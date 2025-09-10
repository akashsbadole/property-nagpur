import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Phone, Mail, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface Broker {
  id: string;
  user_id: string;
  email: string;
  phone: string;
  company_name: string;
  license_number: string;
  verified: boolean;
  rating: number;
  total_deals: number;
  commission_rate: number;
  address: string;
  specializations: string[];
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

export const BrokerManagement: React.FC = () => {
  const { userRole } = useAuth();
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (userRole === 'admin') {
      fetchBrokers();
    }
  }, [userRole]);

  const fetchBrokers = async () => {
    try {
      const { data, error } = await supabase
        .from('brokers')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBrokers((data as any) || []);
    } catch (error) {
      console.error('Error fetching brokers:', error);
      toast.error('Failed to load brokers');
    } finally {
      setLoading(false);
    }
  };

  const toggleBrokerVerification = async (brokerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('brokers')
        .update({ verified: !currentStatus })
        .eq('id', brokerId);

      if (error) throw error;

      setBrokers(prev =>
        prev.map(broker =>
          broker.id === brokerId ? { ...broker, verified: !currentStatus } : broker
        )
      );

      toast.success(
        !currentStatus ? 'Broker verified successfully' : 'Broker verification removed'
      );
    } catch (error) {
      console.error('Error updating broker verification:', error);
      toast.error('Failed to update broker verification');
    }
  };

  const filteredBrokers = brokers.filter(broker => {
    const matchesSearch = 
      broker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      broker.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      broker.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterVerified === null || broker.verified === filterVerified;
    
    return matchesSearch && matchesFilter;
  });

  if (userRole !== 'admin') {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Broker Management</CardTitle>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search brokers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterVerified === null ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterVerified(null)}
              >
                All
              </Button>
              <Button
                variant={filterVerified === true ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterVerified(true)}
              >
                Verified
              </Button>
              <Button
                variant={filterVerified === false ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterVerified(false)}
              >
                Pending
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Broker</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Deals</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBrokers.map((broker) => (
                  <TableRow key={broker.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {broker.profiles?.full_name || broker.email}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {broker.email}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-medium">{broker.company_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          {broker.commission_rate * 100}% commission
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {broker.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span className="text-sm">{broker.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-sm">{broker.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        {broker.license_number || 'Not provided'}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{broker.total_deals}</div>
                        <div className="text-sm text-muted-foreground">
                          ⭐ {broker.rating.toFixed(1)}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={broker.verified ? "default" : "secondary"}>
                        {broker.verified ? 'Verified' : 'Pending'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={broker.verified ? "outline" : "default"}
                          onClick={() => toggleBrokerVerification(broker.id, broker.verified)}
                        >
                          {broker.verified ? (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Revoke
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verify
                            </>
                          )}
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Broker Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold">Personal Information</h4>
                                  <p>Name: {broker.profiles?.full_name || 'N/A'}</p>
                                  <p>Email: {broker.email}</p>
                                  <p>Phone: {broker.phone || 'N/A'}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">Professional Details</h4>
                                  <p>Company: {broker.company_name || 'N/A'}</p>
                                  <p>License: {broker.license_number || 'N/A'}</p>
                                  <p>Commission: {broker.commission_rate * 100}%</p>
                                </div>
                              </div>
                              
                              {broker.address && (
                                <div>
                                  <h4 className="font-semibold">Address</h4>
                                  <p>{broker.address}</p>
                                </div>
                              )}
                              
                              {broker.specializations && broker.specializations.length > 0 && (
                                <div>
                                  <h4 className="font-semibold">Specializations</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {broker.specializations.map((spec, index) => (
                                      <Badge key={index} variant="outline">
                                        {spec}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div>
                                <h4 className="font-semibold">Performance</h4>
                                <p>Total Deals: {broker.total_deals}</p>
                                <p>Rating: ⭐ {broker.rating.toFixed(1)}</p>
                                <p>Joined: {new Date(broker.created_at).toLocaleDateString()}</p>
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
          
          {filteredBrokers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No brokers found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};