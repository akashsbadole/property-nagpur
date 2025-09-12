import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Users,
  Bell,
  Calendar,
  Star,
  Phone,
  Mail,
  MapPin,
  Eye
} from 'lucide-react';

interface BrokerStats {
  totalDeals: number;
  totalCommission: number;
  activeListings: number;
  pendingEnquiries: number;
  rating: number;
  monthlyEarnings: number;
}

interface Notification {
  id: string;
  notification_type: string;
  message: string;
  created_at: string;
  status: string;
  property_id: string;
  contact_info: any;
}

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  property_type: string;
  listing_status: string;
  views_count: number;
  enquiries_count: number;
  created_at: string;
}

export const BrokerDashboard: React.FC = () => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<BrokerStats>({
    totalDeals: 0,
    totalCommission: 0,
    activeListings: 0,
    pendingEnquiries: 0,
    rating: 0,
    monthlyEarnings: 0
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && userRole === 'broker') {
      fetchBrokerData();
    }
  }, [user, userRole]);

  const fetchBrokerData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get broker profile
      const { data: brokerData } = await supabase
        .from('brokers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (brokerData) {
        // Fetch notifications
        const { data: notificationsData } = await supabase
          .from('broker_notifications')
          .select('*')
          .eq('broker_id', brokerData.id)
          .order('created_at', { ascending: false })
          .limit(10);

        // Fetch properties assigned to this broker
        const { data: propertiesData } = await supabase
          .from('properties')
          .select('*')
          .eq('broker_id', brokerData.id)
          .order('created_at', { ascending: false });

        // Calculate stats
        const totalDeals = brokerData.total_deals || 0;
        const rating = brokerData.rating || 0;
        const activeListings = propertiesData?.filter(p => p.listing_status === 'active').length || 0;
        const pendingEnquiries = notificationsData?.filter(n => n.status === 'sent').length || 0;

        setStats({
          totalDeals,
          totalCommission: totalDeals * 50000, // Estimated
          activeListings,
          pendingEnquiries,
          rating,
          monthlyEarnings: totalDeals * 10000 // Estimated monthly
        });

        setNotifications(notificationsData || []);
        setProperties(propertiesData || []);
      }
    } catch (error) {
      console.error('Error fetching broker data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('broker_notifications')
        .update({ status: 'read' })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId 
            ? { ...notification, status: 'read' } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'enquiry': return <Mail className="h-4 w-4" />;
      case 'call_request': return <Phone className="h-4 w-4" />;
      case 'site_visit': return <MapPin className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  if (userRole !== 'broker') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Broker access required.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Deals</p>
                <p className="text-2xl font-bold">{stats.totalDeals}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Commission</p>
                <p className="text-2xl font-bold">{formatPrice(stats.totalCommission)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold">{stats.activeListings}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  {stats.rating.toFixed(1)}
                  <Star className="h-5 w-5 text-yellow-500" />
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">
            Notifications {stats.pendingEnquiries > 0 && (
              <Badge className="ml-2" variant="destructive">
                {stats.pendingEnquiries}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="properties">My Properties</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      notification.status === 'sent' 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.notification_type)}
                        <div>
                          <p className="font-medium">
                            {notification.notification_type.replace('_', ' ').toUpperCase()}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          {notification.contact_info && (
                            <div className="text-xs text-muted-foreground">
                              <p>Contact: {notification.contact_info.name}</p>
                              <p>Email: {notification.contact_info.email}</p>
                              {notification.contact_info.phone && (
                                <p>Phone: {notification.contact_info.phone}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                        {notification.status === 'sent' && (
                          <Button
                            size="sm"
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No notifications yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Listed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{property.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {property.property_type} • {property.address}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{formatPrice(property.price)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={property.listing_status === 'active' ? 'default' : 'secondary'}
                        >
                          {property.listing_status}
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
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(property.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {properties.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No properties assigned yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-lg font-semibold">Monthly Earnings</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(stats.monthlyEarnings)}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-lg font-semibold">Success Rate</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalDeals > 0 ? '85%' : '0%'}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-lg font-semibold">Avg. Deal Size</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPrice(2500000)}
                  </p>
                </div>
              </div>

              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                <p>Detailed analytics coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};