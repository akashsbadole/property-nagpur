import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { pipeline } from '@huggingface/transformers';
import {
  Brain,
  Search,
  FileText,
  TrendingUp,
  MapPin,
  Home,
  DollarSign,
  Clock,
  Star,
  Sparkles,
  MessageSquare,
  Upload,
  Download,
  Loader2
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  property_type: string;
  bhk: number | null;
  area_sqft: number | null;
  images: any[] | null;
  score?: number;
  reasoning?: string;
}

interface DocumentAnalysis {
  fileName: string;
  summary: string;
  keyPoints: string[];
  confidence: number;
  recommendations: string[];
}

interface MarketInsight {
  location: string;
  avgPrice: number;
  priceChange: number;
  demandLevel: 'high' | 'medium' | 'low';
  predictions: {
    month: string;
    predictedPrice: number;
  }[];
}

export const AIRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'ai', message: string}>>([]);
  const [recommendations, setRecommendations] = useState<Property[]>([]);
  const [documentAnalysis, setDocumentAnalysis] = useState<DocumentAnalysis[]>([]);
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Initialize AI models
  const [embeddingModel, setEmbeddingModel] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initializeAI();
  }, []);

  const initializeAI = async () => {
    try {
      setLoading(true);
      // Initialize embedding model for semantic search
      const extractor = await pipeline(
        'feature-extraction',
        'mixedbread-ai/mxbai-embed-xsmall-v1',
        { device: 'webgpu' }
      );
      setEmbeddingModel(extractor);
      setInitialized(true);
    } catch (error) {
      console.error('Failed to initialize AI models:', error);
      // Fallback to CPU if WebGPU fails
      try {
        const extractor = await pipeline(
          'feature-extraction',
          'mixedbread-ai/mxbai-embed-xsmall-v1'
        );
        setEmbeddingModel(extractor);
        setInitialized(true);
      } catch (fallbackError) {
        console.error('Failed to initialize AI models with fallback:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const getPropertyRecommendations = async () => {
    if (!user || !embeddingModel) return;

    setLoading(true);
    try {
      // Get user preferences from search history and profile
      const { data: properties, error } = await supabase
        .from('properties')
        .select('*')
        .eq('listing_status', 'active')
        .limit(50);

      if (error) throw error;

      // Create embeddings for properties
      const propertyTexts = properties.map(p => 
        `${p.title} ${p.description} ${p.property_type} ${p.address} ${p.bhk}BHK`
      );

      // Get user preference query
      const userQuery = `${searchQuery || 'affordable home with good amenities'}`;
      
      if (propertyTexts.length > 0) {
        const [queryEmbedding, propertyEmbeddings] = await Promise.all([
          embeddingModel(userQuery, { pooling: 'mean', normalize: true }),
          embeddingModel(propertyTexts, { pooling: 'mean', normalize: true })
        ]);

        // Calculate similarity scores
        const scoredProperties = properties.map((property, index) => {
          const similarity = cosineSimilarity(
            queryEmbedding.data,
            propertyEmbeddings.data[index]
          );
          
          return {
            id: property.id,
            title: property.title,
            price: property.price,
            address: property.address,
            property_type: property.property_type,
            bhk: property.bhk,
            area_sqft: property.area_sqft,
            images: property.images,
            score: similarity,
            reasoning: generateRecommendationReasoning(property, similarity)
          } as Property;
        });

        // Sort by score and take top 6
        const topRecommendations = scoredProperties
          .sort((a, b) => b.score - a.score)
          .slice(0, 6);

        setRecommendations(topRecommendations);
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeDocument = async () => {
    if (!selectedFile || !embeddingModel) return;

    setLoading(true);
    setAnalysisProgress(0);
    
    try {
      const fileText = await extractTextFromFile(selectedFile);
      setAnalysisProgress(25);

      // Create embedding for document
      const embedding = await embeddingModel(fileText, { pooling: 'mean', normalize: true });
      setAnalysisProgress(50);

      // Analyze document content
      const analysis = await analyzeDocumentContent(fileText, selectedFile.name);
      setAnalysisProgress(75);

      setDocumentAnalysis(prev => [...prev, analysis]);
      setAnalysisProgress(100);
    } catch (error) {
      console.error('Error analyzing document:', error);
    } finally {
      setLoading(false);
      setAnalysisProgress(0);
    }
  };

  const getMarketInsights = async (location: string) => {
    setLoading(true);
    try {
      const { data: properties, error } = await supabase
        .from('properties')
        .select('price, created_at, address')
        .ilike('address', `%${location}%`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / properties.length;
      const recentProperties = properties.slice(0, 20);
      const olderProperties = properties.slice(20, 40);
      
      const recentAvg = recentProperties.reduce((sum, p) => sum + p.price, 0) / recentProperties.length;
      const olderAvg = olderProperties.reduce((sum, p) => sum + p.price, 0) / olderProperties.length;
      
      const priceChange = ((recentAvg - olderAvg) / olderAvg) * 100;

      const insight: MarketInsight = {
        location,
        avgPrice,
        priceChange,
        demandLevel: properties.length > 50 ? 'high' : properties.length > 20 ? 'medium' : 'low',
        predictions: generatePricePredictions(avgPrice, priceChange)
      };

      setMarketInsights(prev => [insight, ...prev.filter(i => i.location !== location)]);
    } catch (error) {
      console.error('Error getting market insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', message: userMessage }]);

    // Simple AI response based on keywords
    let aiResponse = generateAIResponse(userMessage);
    
    setChatHistory(prev => [...prev, { role: 'ai', message: aiResponse }]);
  };

  // Helper functions
  const cosineSimilarity = (a: number[], b: number[]): number => {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  };

  const generateRecommendationReasoning = (property: any, score: number): string => {
    const reasons = [];
    if (score > 0.8) reasons.push('Excellent match for your preferences');
    if (property.price < 5000000) reasons.push('Great value for money');
    if (property.bhk >= 2) reasons.push('Spacious layout');
    if (property.area_sqft > 1000) reasons.push('Good area size');
    
    return reasons.join(', ') || 'Good option based on your search criteria';
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string || '');
      };
      reader.readAsText(file);
    });
  };

  const analyzeDocumentContent = async (text: string, fileName: string): Promise<DocumentAnalysis> => {
    // Simple text analysis - in a real app, you'd use more sophisticated NLP
    const sentences = text.split('.').filter(s => s.trim().length > 10);
    const keyPoints = sentences.slice(0, 5).map(s => s.trim());
    
    const summary = sentences.slice(0, 2).join('. ') + '.';
    
    const recommendations = [
      'Review all terms and conditions carefully',
      'Verify property ownership documents',
      'Check for any pending legal issues',
      'Confirm all financial obligations'
    ];

    return {
      fileName,
      summary,
      keyPoints,
      confidence: 0.85,
      recommendations
    };
  };

  const generatePricePredictions = (currentPrice: number, priceChange: number) => {
    const months = ['Next Month', '3 Months', '6 Months', '1 Year'];
    return months.map((month, index) => ({
      month,
      predictedPrice: currentPrice * (1 + (priceChange / 100) * (index + 1) * 0.1)
    }));
  };

  const generateAIResponse = (message: string): string => {
    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.includes('property') || lowercaseMessage.includes('house') || lowercaseMessage.includes('apartment')) {
      return "I can help you find the perfect property! Based on your preferences, I'd recommend looking at properties with good amenities, proper documentation, and in well-connected areas. Would you like me to search for specific types of properties?";
    }
    
    if (lowercaseMessage.includes('price') || lowercaseMessage.includes('cost') || lowercaseMessage.includes('budget')) {
      return "Property prices vary based on location, size, and amenities. I can analyze market trends and suggest properties within your budget. What's your preferred price range and location?";
    }
    
    if (lowercaseMessage.includes('document') || lowercaseMessage.includes('legal') || lowercaseMessage.includes('verification')) {
      return "Document verification is crucial for property transactions. I can help analyze property documents, check for legal compliance, and suggest necessary verifications. Upload your documents for detailed analysis.";
    }
    
    if (lowercaseMessage.includes('broker') || lowercaseMessage.includes('agent')) {
      return "I can help you connect with verified brokers in your area. Our platform has experienced brokers who can assist with property search, negotiations, and paperwork. Would you like me to find brokers near you?";
    }
    
    return "I'm here to help with all your property needs! I can assist with property recommendations, document analysis, market insights, and connecting you with verified brokers. How can I help you today?";
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)}Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Property Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recommendations" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="documents">Document Analysis</TabsTrigger>
              <TabsTrigger value="market">Market Insights</TabsTrigger>
              <TabsTrigger value="chat">AI Assistant</TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Describe your ideal property..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button onClick={getPropertyRecommendations} disabled={loading || !initialized}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Get Recommendations
                </Button>
              </div>

              {!initialized && (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
                  <p>Initializing AI models...</p>
                </div>
              )}

              {recommendations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.map((property) => (
                    <Card key={property.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="aspect-video bg-muted rounded-lg mb-3 relative overflow-hidden">
                          {property.images?.[0] ? (
                            <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Home className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-primary/90 text-primary-foreground">
                              <Star className="h-3 w-3 mr-1" />
                              {(property.score * 100).toFixed(0)}% Match
                            </Badge>
                          </div>
                        </div>
                        
                        <h3 className="font-semibold mb-2 line-clamp-2">{property.title}</h3>
                        <p className="text-lg font-bold text-primary mb-2">{formatPrice(property.price)}</p>
                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {property.address}
                        </p>
                        <p className="text-xs text-muted-foreground italic">{property.reasoning}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <Button onClick={analyzeDocument} disabled={!selectedFile || loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Analyze Document
                </Button>
              </div>

              {analysisProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Analyzing document...</span>
                    <span>{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} />
                </div>
              )}

              {documentAnalysis.map((analysis, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5" />
                      {analysis.fileName}
                      <Badge variant="outline">
                        {(analysis.confidence * 100).toFixed(0)}% Confidence
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Summary</h4>
                      <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Key Points</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.keyPoints.map((point, i) => (
                          <li key={i} className="text-sm text-muted-foreground">{point}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {analysis.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-orange-600 flex items-center gap-2">
                            <Sparkles className="h-3 w-3" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="market" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter location (e.g., Mumbai, Bangalore)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      getMarketInsights((e.target as HTMLInputElement).value);
                    }
                  }}
                />
                <Button 
                  onClick={() => {
                    const input = document.querySelector('input[placeholder*="location"]') as HTMLInputElement;
                    if (input?.value) getMarketInsights(input.value);
                  }} 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                  Get Insights
                </Button>
              </div>

              {marketInsights.map((insight, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {insight.location} Market Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{formatPrice(insight.avgPrice)}</p>
                        <p className="text-sm text-muted-foreground">Average Price</p>
                      </div>
                      
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="text-2xl font-bold text-green-600">
                          {insight.priceChange > 0 ? '+' : ''}{insight.priceChange.toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Price Change</p>
                      </div>
                      
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Badge className={`text-lg px-3 py-1 ${
                          insight.demandLevel === 'high' ? 'bg-red-100 text-red-800' :
                          insight.demandLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {insight.demandLevel.toUpperCase()}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-2">Demand Level</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Price Predictions</h4>
                      <div className="space-y-2">
                        {insight.predictions.map((pred, i) => (
                          <div key={i} className="flex justify-between items-center py-2 px-3 bg-muted/30 rounded">
                            <span className="text-sm">{pred.month}</span>
                            <span className="font-medium">{formatPrice(pred.predictedPrice)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="chat" className="space-y-4">
              <Card className="h-96 flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Property Assistant Chat
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    {chatHistory.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <Brain className="h-12 w-12 mx-auto mb-4 text-primary" />
                        <p>Hi! I'm your AI property assistant.</p>
                        <p className="text-sm">Ask me about properties, market trends, or document verification!</p>
                      </div>
                    )}
                    
                    {chatHistory.map((chat, index) => (
                      <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          chat.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-foreground'
                        }`}>
                          <p className="text-sm">{chat.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask about properties, prices, documents..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                    />
                    <Button onClick={handleChatSubmit} disabled={!chatMessage.trim()}>
                      Send
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};