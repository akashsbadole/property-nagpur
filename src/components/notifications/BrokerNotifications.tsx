import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, Phone, MessageCircle, Calendar, MapPin, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Notification {
  id: string;
  notification_type: string;
  message: string;
  status: string;
  sent_at: string;
  contact_info: any;
  property_id: string;
  enquirer_id: string;
  properties: {
    title: string;
    address: string;
    price: number;
  } | null;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

export const BrokerNotifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      // Get broker ID first
      const { data: brokerData, error: brokerError } = await supabase
        .from('brokers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (brokerError) {
        console.log('User is not a broker');
        setNotifications([]);
        return;
      }

      const { data, error } = await supabase
        .from('broker_notifications')
        .select(`
          *,
          properties:property_id (title, address, price),
          profiles:enquirer_id (full_name, email)
        `)
        .eq('broker_id', brokerData.id)
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications((data as any) || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('broker_notifications')
        .update({ status: 'read' })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, status: 'read' } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_enquiry':
        return <MessageCircle className="h-4 w-4" />;
      case 'site_visit':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_enquiry':
        return 'bg-blue-500';
      case 'site_visit':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Broker Notifications
          {notifications.filter(n => n.status === 'sent').length > 0 && (
            <Badge variant="destructive">
              {notifications.filter(n => n.status === 'sent').length} New
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notifications yet</p>
            <p className="text-sm">You'll receive notifications when buyers show interest in properties.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.status === 'sent' ? 'bg-muted/50 border-primary/20' : 'bg-background'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full text-white ${getNotificationColor(notification.notification_type)}`}>
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {notification.notification_type.replace('_', ' ')}
                        </Badge>
                        {notification.status === 'sent' && (
                          <Badge variant="destructive" className="text-xs">NEW</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.sent_at), { addSuffix: true })}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm">
                        {notification.properties?.title}
                      </h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {notification.properties?.address}
                      </p>
                    </div>

                    <p className="text-sm">{notification.message}</p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{notification.profiles?.full_name}</span>
                        <span className="text-muted-foreground">({notification.profiles?.email})</span>
                      </div>

                      {notification.contact_info && (
                        <div className="space-y-1 text-sm">
                          {notification.contact_info.phone && (
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                {notification.contact_info.phone}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCall(notification.contact_info.phone)}
                              >
                                Call
                              </Button>
                            </div>
                          )}
                          
                          {notification.contact_info.preferred_time && (
                            <p className="text-muted-foreground">
                              Best time to call: {notification.contact_info.preferred_time}
                            </p>
                          )}

                          {notification.contact_info.site_visit && (
                            <div className="flex items-center gap-2 text-green-600">
                              <Calendar className="h-3 w-3" />
                              <span className="text-xs">Site visit requested</span>
                              {notification.contact_info.visit_date && (
                                <span className="text-xs">
                                  on {new Date(notification.contact_info.visit_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {notification.status === 'sent' && (
                      <div className="pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as Read
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};