import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X, Search, Filter } from 'lucide-react';

interface PropertyFiltersProps {
  filters: {
    search: string;
    property_type: string;
    min_price: number;
    max_price: number;
    bhk: string[];
    city: string;
    area_range: number[];
    furnishing_status: string;
    possession_status: string;
    verified_only: boolean;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  cities: string[];
  amenities: { id: string; name: string; category?: string }[];
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  cities,
  amenities
}) => {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleBHK = (bhk: string) => {
    const currentBHK = filters.bhk || [];
    const newBHK = currentBHK.includes(bhk)
      ? currentBHK.filter(b => b !== bhk)
      : [...currentBHK, bhk];
    updateFilter('bhk', newBHK);
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search' && value) return true;
    if (key === 'property_type' && value !== 'all') return true;
    if (key === 'min_price' && typeof value === 'number' && value > 0) return true;
    if (key === 'max_price' && typeof value === 'number' && value < 10000000) return true;
    if (key === 'bhk' && Array.isArray(value) && value.length > 0) return true;
    if (key === 'city' && value !== 'all') return true;
    if (key === 'furnishing_status' && value !== 'all') return true;
    if (key === 'possession_status' && value !== 'all') return true;
    if (key === 'verified_only' && value === true) return true;
    return false;
  }).length;

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Properties</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by title, location..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <Label>Property Type</Label>
          <Select
            value={filters.property_type}
            onValueChange={(value) => updateFilter('property_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="rental">Rental</SelectItem>
              <SelectItem value="pg">PG/Co-living</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label>Price Range</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="min_price" className="text-xs text-muted-foreground">Min Price</Label>
              <Input
                id="min_price"
                type="number"
                placeholder="Min"
                value={filters.min_price || ''}
                onChange={(e) => updateFilter('min_price', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="max_price" className="text-xs text-muted-foreground">Max Price</Label>
              <Input
                id="max_price"
                type="number"
                placeholder="Max"
                value={filters.max_price || ''}
                onChange={(e) => updateFilter('max_price', parseInt(e.target.value) || 10000000)}
              />
            </div>
          </div>
        </div>

        {/* BHK */}
        <div className="space-y-3">
          <Label>BHK</Label>
          <div className="flex flex-wrap gap-2">
            {['1', '2', '3', '4', '5+'].map((bhk) => (
              <Button
                key={bhk}
                variant={filters.bhk?.includes(bhk) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleBHK(bhk)}
                className="text-xs"
              >
                {bhk} BHK
              </Button>
            ))}
          </div>
        </div>

        {/* Area Range */}
        <div className="space-y-3">
          <Label>Area (sqft)</Label>
          <div className="px-3">
            <Slider
              value={filters.area_range || [0, 5000]}
              onValueChange={(value) => updateFilter('area_range', value)}
              max={5000}
              min={0}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{filters.area_range?.[0] || 0} sqft</span>
              <span>{filters.area_range?.[1] || 5000} sqft</span>
            </div>
          </div>
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label>City</Label>
          <Select
            value={filters.city}
            onValueChange={(value) => updateFilter('city', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Furnishing Status */}
        <div className="space-y-2">
          <Label>Furnishing</Label>
          <Select
            value={filters.furnishing_status}
            onValueChange={(value) => updateFilter('furnishing_status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="furnished">Furnished</SelectItem>
              <SelectItem value="semi_furnished">Semi Furnished</SelectItem>
              <SelectItem value="unfurnished">Unfurnished</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Possession Status */}
        <div className="space-y-2">
          <Label>Possession</Label>
          <Select
            value={filters.possession_status}
            onValueChange={(value) => updateFilter('possession_status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="ready_to_move">Ready to Move</SelectItem>
              <SelectItem value="under_construction">Under Construction</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Verified Only */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="verified_only"
            checked={filters.verified_only}
            onCheckedChange={(checked) => updateFilter('verified_only', checked)}
          />
          <Label htmlFor="verified_only" className="text-sm">
            Show verified properties only
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};