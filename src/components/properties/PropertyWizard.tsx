import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, ChevronRight, Upload, X, Home, Building, 
  MapPin, IndianRupee, Camera, CheckCircle 
} from 'lucide-react';
import { toast } from 'sonner';

const propertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  property_type: z.enum(["residential", "commercial", "rental", "pg"]),
  property_subtype: z.string().optional(),
  price: z.number().min(1, "Price must be greater than 0"),
  area_sqft: z.number().optional(),
  bhk: z.number().optional(),
  bathrooms: z.number().optional(),
  floors_total: z.number().optional(),
  floor_number: z.number().optional(),
  age_of_property: z.number().optional(),
  furnishing_status: z.enum(["furnished", "semi_furnished", "unfurnished"]).optional(),
  possession_status: z.enum(["ready_to_move", "under_construction"]).optional(),
  address: z.string().min(1, "Address is required"),
  is_negotiable: z.boolean().default(true),
  maintenance_charges: z.number().optional(),
  security_deposit: z.number().optional(),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyWizardProps {
  onSubmit: (data: PropertyFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  amenities: { id: string; name: string; category?: string }[];
}

const steps = [
  { id: 1, title: 'Property Type', icon: Home },
  { id: 2, title: 'Property Details', icon: Building },
  { id: 3, title: 'Location & Address', icon: MapPin },
  { id: 4, title: 'Pricing', icon: IndianRupee },
  { id: 5, title: 'Photos & Media', icon: Camera },
  { id: 6, title: 'Review & Publish', icon: CheckCircle },
];

export const PropertyWizard: React.FC<PropertyWizardProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  amenities
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: '',
      description: '',
      property_type: 'residential',
      price: 0,
      is_negotiable: true,
    },
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: PropertyFormData) => {
    try {
      await onSubmit(data);
      toast.success("Property submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit property");
    }
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">List Your Property</h1>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 ${
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isCompleted
                      ? 'border-success bg-success text-success-foreground'
                      : 'border-border bg-background'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs text-center hidden md:block">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {/* Step 1: Property Type */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Property Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { value: 'residential', label: 'Residential', desc: 'Houses, Apartments, Flats' },
                  { value: 'commercial', label: 'Commercial', desc: 'Offices, Shops, Warehouses' },
                  { value: 'rental', label: 'Rental', desc: 'Properties for rent' },
                  { value: 'pg', label: 'PG/Co-living', desc: 'Paying guest accommodations' }
                ].map((type) => (
                  <div
                    key={type.value}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      form.watch('property_type') === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => form.setValue('property_type', type.value as any)}
                  >
                    <h3 className="font-semibold">{type.label}</h3>
                    <p className="text-sm text-muted-foreground">{type.desc}</p>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-sm font-medium">Property Subtype (Optional)</label>
                <Input
                  placeholder="e.g., Apartment, Villa, Office Space"
                  {...form.register('property_subtype')}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Property Details */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium">Property Title *</label>
                <Input
                  placeholder="e.g., Spacious 3BHK Apartment in Prime Location"
                  {...form.register('title')}
                  className="mt-1"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe your property in detail..."
                  {...form.register('description')}
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">BHK</label>
                  <Input
                    type="number"
                    placeholder="e.g., 3"
                    {...form.register('bhk', { valueAsNumber: true })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Bathrooms</label>
                  <Input
                    type="number"
                    placeholder="e.g., 2"
                    {...form.register('bathrooms', { valueAsNumber: true })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Area (sqft)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 1200"
                    {...form.register('area_sqft', { valueAsNumber: true })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Age (years)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 5"
                    {...form.register('age_of_property', { valueAsNumber: true })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Furnishing Status</label>
                  <Select onValueChange={(value) => form.setValue('furnishing_status', value as any)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select furnishing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="furnished">Furnished</SelectItem>
                      <SelectItem value="semi_furnished">Semi Furnished</SelectItem>
                      <SelectItem value="unfurnished">Unfurnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Possession Status</label>
                  <Select onValueChange={(value) => form.setValue('possession_status', value as any)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select possession" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ready_to_move">Ready to Move</SelectItem>
                      <SelectItem value="under_construction">Under Construction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Location */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Location & Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium">Complete Address *</label>
                <Textarea
                  placeholder="Enter complete address with locality, city, state, pincode"
                  {...form.register('address')}
                  className="mt-1"
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.address.message}</p>
                )}
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  📍 Map integration will be available to pin your exact location
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Pricing */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Pricing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium">Price (₹) *</label>
                <Input
                  type="number"
                  placeholder="Enter price"
                  {...form.register('price', { valueAsNumber: true })}
                  className="mt-1"
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.price.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={form.watch('is_negotiable')}
                  onCheckedChange={(checked) => form.setValue('is_negotiable', checked as boolean)}
                />
                <label className="text-sm font-medium">Price is negotiable</label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Maintenance Charges (₹/month)</label>
                  <Input
                    type="number"
                    placeholder="Optional"
                    {...form.register('maintenance_charges', { valueAsNumber: true })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Security Deposit (₹)</label>
                  <Input
                    type="number"
                    placeholder="Optional"
                    {...form.register('security_deposit', { valueAsNumber: true })}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Photos & Media */}
        {currentStep === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Photos & Videos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium">Property Images</label>
                <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">
                    Drag & drop images here, or click to select
                  </p>
                  <Button type="button" variant="outline">
                    Choose Images
                  </Button>
                </div>
              </div>

              {images.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Uploaded Images</label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Property ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Contact Information</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <Input
                      placeholder="Contact person name"
                      {...form.register('contact_person')}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Phone number"
                      {...form.register('contact_phone')}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Email address"
                      {...form.register('contact_email')}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 6: Review & Publish */}
        {currentStep === 6 && (
          <Card>
            <CardHeader>
              <CardTitle>Review Your Listing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{form.watch('title')}</h3>
                <p className="text-2xl font-bold text-primary mb-2">
                  ₹{form.watch('price')?.toLocaleString()}
                  {form.watch('is_negotiable') && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">Negotiable</span>
                  )}
                </p>
                <p className="text-muted-foreground mb-4">{form.watch('address')}</p>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {form.watch('bhk') && (
                    <div>
                      <span className="font-medium">{form.watch('bhk')} BHK</span>
                    </div>
                  )}
                  {form.watch('bathrooms') && (
                    <div>
                      <span className="font-medium">{form.watch('bathrooms')} Bath</span>
                    </div>
                  )}
                  {form.watch('area_sqft') && (
                    <div>
                      <span className="font-medium">{form.watch('area_sqft')} sqft</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2">📋 Before Publishing</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Your property will be reviewed by our team</li>
                  <li>• Verification process may take 24-48 hours</li>
                  <li>• You'll receive notifications about enquiries</li>
                  <li>• You can edit listing details anytime</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button type="button" onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Property'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};