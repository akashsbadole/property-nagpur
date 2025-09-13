import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Square, Heart, Share2, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyCardMobileProps {
  property: {
    id: string;
    title: string;
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    type: string;
    image: string;
    status: 'available' | 'sold' | 'rented';
  };
  onViewDetails: (id: string) => void;
  onContact: (id: string) => void;
  onSave?: (id: string) => void;
  isSaved?: boolean;
}

const PropertyCardMobile: React.FC<PropertyCardMobileProps> = ({
  property,
  onViewDetails,
  onContact,
  onSave,
  isSaved = false
}) => {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img 
          src={property.image} 
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 left-2">
          <Badge 
            variant={property.status === 'available' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {property.status}
          </Badge>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-background/80 hover:bg-background"
            onClick={() => onSave?.(property.id)}
          >
            <Heart className={cn("h-4 w-4", isSaved && "fill-red-500 text-red-500")} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-background/80 hover:bg-background"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            {property.location}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              {property.bedrooms}
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              {property.bathrooms}
            </div>
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              {property.area} sq ft
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-2xl font-bold text-primary">
                ₹{property.price.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{property.type}</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onContact(property.id)}
              >
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
              <Button
                size="sm"
                onClick={() => onViewDetails(property.id)}
              >
                View
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCardMobile;