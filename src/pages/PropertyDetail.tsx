import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, Heart, Share2, Phone, MessageCircle, MapPin, 
  Bed, Bath, Square, Calendar, Home, Car, Wifi, Tv,
  ChevronLeft, ChevronRight, Play, ImageIcon, Flag
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  property_type: string;
  property_subtype?: string;
  bhk?: number;
  bathrooms?: number;
  area_sqft?: number;
  floor_number?: number;
  floors_total?: number;
  age_of_property?: number;
  furnishing_status?: string;
  possession_status?: string;
  address: string;
  images: any;
  videos?: any;
  is_featured: boolean;
  is_negotiable: boolean;
  maintenance_charges?: number;
  security_deposit?: number;
  verification_status: string;
  views_count: number;
  created_at: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  profiles?: any;
  locations?: any;
}

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchProperty();
      fetchSimilarProperties();
      recordView();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          profiles:owner_id (id, full_name, phone, avatar_url, created_at),
          locations:location_id (city, state)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Property not found');
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, price, images, address, bhk, area_sqft')
        .eq('listing_status', 'active')
        .neq('id', id)
        .limit(6);

      if (error) throw error;
      setSimilarProperties(data || []);
    } catch (error) {
      console.error('Error fetching similar properties:', error);
    }
  };

  const recordView = async () => {
    if (!id) return;
    
    try {
      await supabase
        .from('property_views')
        .insert({
          property_id: id,
          viewer_id: user?.id || null,
          viewed_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  const handleContact = () => {
    if (!user) {
      toast.error('Please login to contact property owner');
      navigate('/auth');
      return;
    }
    // Open chat modal or navigate to chat
    toast.success('Opening chat...');
  };

  const handleCall = () => {
    if (property?.contact_phone || property?.profiles?.phone) {
      const phone = property.contact_phone || property.profiles?.phone;
      window.open(`tel:${phone}`);
    }
  };

  const handleSave = () => {
    if (!user) {
      toast.error('Please login to save properties');
      return;
    }
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Removed from saved' : 'Added to saved');
  };

  const nextImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Property not found</h2>
          <Button onClick={() => navigate('/properties')}>Back to Properties</Button>
        </div>
      </div>
    );
  }

  const images = Array.isArray(property.images) ? property.images : ['/placeholder.svg'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-current text-destructive' : ''}`} />
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={images[currentImageIndex]}
                    alt={property.title}
                    className="w-full h-96 object-cover rounded-t-lg"
                  />
                  
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      
                      <div className="absolute bottom-4 right-4 bg-black/50 text-white text-sm px-2 py-1 rounded">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                  
                  {property.is_featured && (
                    <Badge className="absolute top-4 left-4 bg-gradient-to-r from-primary to-primary-foreground">
                      Featured
                    </Badge>
                  )}
                </div>
                
                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`View ${index + 1}`}
                        className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
                          index === currentImageIndex ? 'border-primary' : 'border-border'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">{property.title}</h1>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{property.address}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{property.property_type}</Badge>
                      {property.verification_status === 'verified' && (
                        <Badge className="bg-success text-success-foreground">Verified</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {formatPrice(property.price)}
                      {property.is_negotiable && (
                        <span className="text-sm text-muted-foreground ml-2">Negotiable</span>
                      )}
                    </div>
                    {property.area_sqft && (
                      <div className="text-sm text-muted-foreground">
                        ₹{Math.round(property.price / property.area_sqft)}/sqft
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {property.bhk && (
                        <div className="text-center p-4 border rounded-lg">
                          <Bed className="h-6 w-6 mx-auto mb-2 text-primary" />
                          <div className="font-semibold">{property.bhk} BHK</div>
                        </div>
                      )}
                      
                      {property.bathrooms && (
                        <div className="text-center p-4 border rounded-lg">
                          <Bath className="h-6 w-6 mx-auto mb-2 text-primary" />
                          <div className="font-semibold">{property.bathrooms} Bath</div>
                        </div>
                      )}
                      
                      {property.area_sqft && (
                        <div className="text-center p-4 border rounded-lg">
                          <Square className="h-6 w-6 mx-auto mb-2 text-primary" />
                          <div className="font-semibold">{property.area_sqft} sqft</div>
                        </div>
                      )}
                      
                      {property.age_of_property && (
                        <div className="text-center p-4 border rounded-lg">
                          <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
                          <div className="font-semibold">{property.age_of_property} years</div>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {property.furnishing_status && (
                        <div>
                          <h4 className="font-semibold mb-1">Furnishing</h4>
                          <p className="text-muted-foreground capitalize">{property.furnishing_status.replace('_', ' ')}</p>
                        </div>
                      )}
                      
                      {property.possession_status && (
                        <div>
                          <h4 className="font-semibold mb-1">Possession</h4>
                          <p className="text-muted-foreground capitalize">{property.possession_status.replace('_', ' ')}</p>
                        </div>
                      )}
                      
                      {property.floor_number && (
                        <div>
                          <h4 className="font-semibold mb-1">Floor</h4>
                          <p className="text-muted-foreground">{property.floor_number} of {property.floors_total}</p>
                        </div>
                      )}
                      
                      {property.maintenance_charges && (
                        <div>
                          <h4 className="font-semibold mb-1">Maintenance</h4>
                          <p className="text-muted-foreground">₹{property.maintenance_charges}/month</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="description">
                    <div className="prose max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        {property.description || 'No description available.'}
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="location">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Address</h4>
                        <p className="text-muted-foreground">{property.address}</p>
                      </div>
                      
                      {property.locations && (
                        <div>
                          <h4 className="font-semibold mb-2">Location Details</h4>
                          <p className="text-muted-foreground">
                            {property.locations.city}, {property.locations.state}
                          </p>
                        </div>
                      )}
                      
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Map view will be available soon
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={property.profiles?.avatar_url} />
                    <AvatarFallback>
                      {property.profiles?.full_name?.[0] || property.contact_person?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">
                      {property.profiles?.full_name || property.contact_person || 'Property Owner'}
                    </h4>
                    {property.profiles?.created_at && (
                      <p className="text-sm text-muted-foreground">
                        Member since {new Date(property.profiles.created_at).getFullYear()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleContact} className="flex-1">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                  
                  {(property.contact_phone || property.profiles?.phone) && (
                    <Button variant="outline" onClick={handleCall}>
                      <Phone className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <p>Posted {new Date(property.created_at).toLocaleDateString()}</p>
                  <p>{property.views_count} views</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Enquiry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Your Name</label>
                  <input 
                    type="text" 
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Phone Number</label>
                  <input 
                    type="tel" 
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="Enter your phone"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <textarea 
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    rows={3}
                    placeholder="I'm interested in this property..."
                  />
                </div>
                
                <Button className="w-full">Send Enquiry</Button>
              </CardContent>
            </Card>

            {/* Similar Properties */}
            {similarProperties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Similar Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {similarProperties.slice(0, 3).map((similar) => (
                    <div key={similar.id} className="flex gap-3 p-2 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <img 
                        src={similar.images?.[0] || '/placeholder.svg'}
                        alt={similar.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-sm line-clamp-1">{similar.title}</h5>
                        <p className="text-xs text-muted-foreground line-clamp-1">{similar.address}</p>
                        <p className="text-sm font-semibold text-primary">{formatPrice(similar.price)}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;