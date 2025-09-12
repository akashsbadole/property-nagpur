import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Home, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  MapPin,
  DollarSign,
  Calendar
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  property_type: string;
  verification_status: string;
  listing_status: string;
  owner_id: string;
  created_at: string;
  views_count: number;
  enquiries_count: number;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export const AdminPropertyManagement: React.FC = () => {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    if (userRole === 'admin') {
      fetchProperties();
    }
  }, [userRole]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          profiles:owner_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties((data as any) || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePropertyStatus = async (propertyId: string, status: 'verified' | 'pending' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ verification_status: status })
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(prev =>
        prev.map(property =>
          property.id === propertyId ? { ...property, verification_status: status } : property
        )
      );

      toast({
        title: "Success",
        description: `Property ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating property:', error);
      toast({
        title: "Error",
        description: "Failed to update property status",
        variant: "destructive"
      });
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === null || property.verification_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)}Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  if (userRole !== 'admin') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Property Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === null ? "default" : "outline"}
                onClick={() => setStatusFilter(null)}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'pending' ? "default" : "outline"}
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'verified' ? "default" : "outline"}
                onClick={() => setStatusFilter('verified')}
              >
                Verified
              </Button>
              <Button
                variant={statusFilter === 'rejected' ? "default" : "outline"}
                onClick={() => setStatusFilter('rejected')}
              >
                Rejected
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{property.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {property.property_type}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {property.profiles?.full_name || 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {property.profiles?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-primary">
                        {formatPrice(property.price)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-sm">{property.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(property.verification_status) as any}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(property.verification_status)}
                          {property.verification_status}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {property.views_count} views
                        </div>
                        <div className="text-muted-foreground">
                          {property.enquiries_count} enquiries
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {property.verification_status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updatePropertyStatus(property.id, 'verified')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePropertyStatus(property.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Property Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium">Property Info</h4>
                                  <p>Title: {property.title}</p>
                                  <p>Type: {property.property_type}</p>
                                  <p>Price: {formatPrice(property.price)}</p>
                                  <p>Address: {property.address}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium">Performance</h4>
                                  <p>Views: {property.views_count}</p>
                                  <p>Enquiries: {property.enquiries_count}</p>
                                  <p>Listed: {new Date(property.created_at).toLocaleDateString()}</p>
                                  <p>Status: {property.verification_status}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredProperties.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No properties found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};