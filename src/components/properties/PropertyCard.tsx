import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Square, Eye, Heart, Phone, MessageCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface PropertyCardProps {
  property: {
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
    images: string[];
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
  };
  onViewDetails?: (id: string) => void;
  onContact?: (id: string) => void;
  onSave?: (id: string) => void;
  isSaved?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onViewDetails,
  onContact,
  onSave,
  isSaved = false
}) => {
  const primaryImage = property.images?.[0] || '/placeholder.svg';

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card hover:shadow-lg transition-all duration-300">
      {property.is_featured && (
        <Badge className="absolute top-3 left-3 z-10 bg-gradient-to-r from-primary to-primary-foreground text-white">
          Featured
        </Badge>
      )}
      
      {property.verification_status === 'verified' && (
        <Badge className="absolute top-3 right-3 z-10 bg-success text-success-foreground">
          Verified
        </Badge>
      )}

      <div className="relative overflow-hidden">
        <img
          src={primaryImage}
          alt={property.title}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="text-white">
            <p className="text-2xl font-bold">{formatPrice(property.price)}</p>
            {property.area_sqft && (
              <p className="text-sm opacity-90">
                ₹{Math.round(property.price / property.area_sqft)}/sqft
              </p>
            )}
          </div>
          
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
            onClick={() => onSave?.(property.id)}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current text-destructive' : ''}`} />
          </Button>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground line-clamp-1">
              {property.title}
            </h3>
            <div className="flex items-center text-muted-foreground text-sm mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="line-clamp-1">{property.address}</span>
            </div>
          </div>
          
          <Badge variant="outline" className="ml-2">
            {property.property_type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="py-3">
        {property.description && (
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
            {property.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {property.bhk && (
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bhk} BHK</span>
            </div>
          )}
          
          {property.bathrooms && (
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          
          {property.area_sqft && (
            <div className="flex items-center">
              <Square className="h-4 w-4 mr-1" />
              <span>{property.area_sqft} sqft</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center text-xs text-muted-foreground">
            <Eye className="h-3 w-3 mr-1" />
            <span>{property.views_count} views</span>
          </div>
          
          {property.profiles?.full_name && (
            <div className="text-xs text-muted-foreground">
              By {property.profiles.full_name}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onViewDetails?.(property.id)}
        >
          View Details
        </Button>
        
        <Button
          size="sm"
          className="flex-1"
          onClick={() => onContact?.(property.id)}
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          Contact
        </Button>
        
        {property.profiles?.phone && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => window.open(`tel:${property.profiles.phone}`)}
          >
            <Phone className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};