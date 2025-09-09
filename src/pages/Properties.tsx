import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyFilters } from '@/components/properties/PropertyFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Grid, List, Map, Search } from 'lucide-react';
import { toast } from 'sonner';
import { debounce } from '@/lib/utils';

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
  address: string;
  images: any;
  is_featured: boolean;
  listing_status: string;
  verification_status: string;
  views_count: number;
  created_at: string;
  profiles?: {
    full_name?: string;
    phone?: string;
  };
  locations?: {
    city: string;
    state: string;
  };
}

const PropertiesPage: React.FC = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [savedProperties, setSavedProperties] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    search: '',
    property_type: 'all',
    min_price: 0,
    max_price: 10000000,
    bhk: [] as string[],
    city: 'all',
    area_range: [0, 5000],
    furnishing_status: 'all',
    possession_status: 'all',
    verified_only: false,
  });

  // Debounced filter function
  const debouncedFetchProperties = debounce(fetchProperties, 500);

  async function fetchProperties() {
    try {
      setLoading(true);
      let query = supabase
        .from('properties')
        .select(`
          *,
          profiles:owner_id (full_name, phone),
          locations:location_id (city, state)
        `)
        .eq('listing_status', 'active')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,address.ilike.%${filters.search}%`);
      }

      if (filters.property_type !== 'all') {
        query = query.eq('property_type', filters.property_type as any);
      }

      if (filters.min_price > 0) {
        query = query.gte('price', filters.min_price);
      }

      if (filters.max_price < 10000000) {
        query = query.lte('price', filters.max_price);
      }

      if (filters.bhk.length > 0) {
        const bhkNumbers = filters.bhk.map(b => b === '5+' ? 5 : parseInt(b));
        query = query.in('bhk', bhkNumbers);
      }

      if (filters.furnishing_status !== 'all') {
        query = query.eq('furnishing_status', filters.furnishing_status as any);
      }

      if (filters.possession_status !== 'all') {
        query = query.eq('possession_status', filters.possession_status as any);
      }

      if (filters.verified_only) {
        query = query.eq('verification_status', 'verified');
      }

      const { data, error } = await query;

      if (error) throw error;
      setProperties((data as any) || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  }

  async function fetchCities() {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('city')
        .order('city');

      if (error) throw error;
      const uniqueCities = [...new Set(data.map(item => item.city))];
      setCities(uniqueCities);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  }

  async function fetchAmenities() {
    try {
      const { data, error } = await supabase
        .from('amenities')
        .select('*')
        .order('name');

      if (error) throw error;
      setAmenities(data || []);
    } catch (error) {
      console.error('Error fetching amenities:', error);
    }
  }

  useEffect(() => {
    fetchCities();
    fetchAmenities();
  }, []);

  useEffect(() => {
    debouncedFetchProperties();
  }, [filters]);

  const handleViewDetails = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const handleContact = (propertyId: string) => {
    if (!user) {
      toast.error('Please login to contact property owner');
      return;
    }
    // Open chat or contact modal
    console.log('Contact for property:', propertyId);
  };

  const handleSaveProperty = async (propertyId: string) => {
    if (!user) {
      toast.error('Please login to save properties');
      return;
    }

    try {
      const isSaved = savedProperties.includes(propertyId);
      
      if (isSaved) {
        // Remove from saved
        setSavedProperties(prev => prev.filter(id => id !== propertyId));
        toast.success('Removed from saved properties');
      } else {
        // Add to saved
        setSavedProperties(prev => [...prev, propertyId]);
        toast.success('Added to saved properties');
      }
    } catch (error) {
      toast.error('Failed to update saved properties');
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      property_type: 'all',
      min_price: 0,
      max_price: 10000000,
      bhk: [],
      city: 'all',
      area_range: [0, 5000],
      furnishing_status: 'all',
      possession_status: 'all',
      verified_only: false,
    });
  };

  const canAddProperty = userRole === 'seller' || userRole === 'agent' || userRole === 'admin';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Properties</h1>
            <p className="text-muted-foreground">
              {properties.length} properties found
            </p>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>

            {canAddProperty && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <PropertyFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={clearFilters}
              cities={cities}
              amenities={amenities}
            />
          </div>

          {/* Properties Content */}
          <div className="lg:col-span-3">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <TabsContent value="grid">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <div className="h-48 bg-muted rounded-t-lg" />
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                            <div className="h-3 bg-muted rounded w-2/3" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : properties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {properties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onViewDetails={handleViewDetails}
                        onContact={handleContact}
                        onSave={handleSaveProperty}
                        isSaved={savedProperties.includes(property.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No properties found</h3>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your filters to see more results
                      </p>
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="list">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">List view coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="map">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">Map view coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPage;