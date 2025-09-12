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
  Users, 
  Search, 
  Eye, 
  Shield, 
  UserCheck,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';

interface User {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  is_active: boolean;
  kyc_verified: boolean;
  created_at: string;
  user_roles: Array<{
    role: string;
    is_primary: boolean;
  }>;
  properties_count?: number;
  enquiries_count?: number;
}

export const AdminUserManagement: React.FC = () => {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  useEffect(() => {
    if (userRole === 'admin') {
      fetchUsers();
    }
  }, [userRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            role,
            is_primary
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch additional stats for each user
      const usersWithStats = await Promise.all(
        (data || []).map(async (user: any) => {
          const [propertiesResult, enquiriesResult] = await Promise.all([
            supabase
              .from('properties')
              .select('id', { count: 'exact' })
              .eq('owner_id', user.user_id),
            supabase
              .from('enquiries')
              .select('id', { count: 'exact' })
              .eq('enquirer_id', user.user_id)
          ]);

          return {
            ...user,
            user_roles: user.user_roles || [],
            properties_count: propertiesResult.count || 0,
            enquiries_count: enquiriesResult.count || 0
          } as User;
        })
      );

      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(prev =>
        prev.map(user =>
          user.user_id === userId ? { ...user, is_active: !currentStatus } : user
        )
      );

      toast({
        title: "Success",
        description: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === null || 
      user.user_roles.some(role => role.role === roleFilter);
    
    return matchesSearch && matchesRole;
  });

  const getPrimaryRole = (roles: Array<{role: string; is_primary: boolean}>) => {
    const primaryRole = roles.find(r => r.is_primary);
    return primaryRole?.role || roles[0]?.role || 'buyer';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'broker': return 'default';
      case 'seller': return 'secondary';
      default: return 'outline';
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
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={roleFilter === null ? "default" : "outline"}
                onClick={() => setRoleFilter(null)}
              >
                All
              </Button>
              <Button
                variant={roleFilter === 'buyer' ? "default" : "outline"}
                onClick={() => setRoleFilter('buyer')}
              >
                Buyers
              </Button>
              <Button
                variant={roleFilter === 'seller' ? "default" : "outline"}
                onClick={() => setRoleFilter('seller')}
              >
                Sellers
              </Button>
              <Button
                variant={roleFilter === 'broker' ? "default" : "outline"}
                onClick={() => setRoleFilter('broker')}
              >
                Brokers
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.full_name || 'No name provided'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleColor(getPrimaryRole(user.user_roles)) as any}>
                        {getPrimaryRole(user.user_roles)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={user.is_active ? "default" : "secondary"}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {user.kyc_verified && (
                          <div className="flex items-center gap-1">
                            <UserCheck className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600">KYC Verified</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{user.properties_count || 0} properties</div>
                        <div className="text-muted-foreground">
                          {user.enquiries_count || 0} enquiries
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={user.is_active ? "outline" : "default"}
                          onClick={() => toggleUserStatus(user.user_id, user.is_active)}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>User Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium">Personal Info</h4>
                                  <p>Name: {user.full_name || 'Not provided'}</p>
                                  <p>Email: {user.email}</p>
                                  <p>Phone: {user.phone || 'Not provided'}</p>
                                  <p>KYC: {user.kyc_verified ? 'Verified' : 'Not verified'}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium">Account Info</h4>
                                  <p>Status: {user.is_active ? 'Active' : 'Inactive'}</p>
                                  <p>Roles: {user.user_roles.map(r => r.role).join(', ')}</p>
                                  <p>Properties: {user.properties_count}</p>
                                  <p>Enquiries: {user.enquiries_count}</p>
                                  <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
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

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};