import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminPropertyManagement } from '@/components/admin/AdminPropertyManagement';
import { AdminUserManagement } from '@/components/admin/AdminUserManagement';
import { BrokerManagement } from '@/components/admin/BrokerManagement';
import { withSecurity } from '@/middleware/SecurityMiddleware';
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  UserCheck,
  Shield,
  Activity
} from 'lucide-react';

const AdminPanelComponent: React.FC = () => {
  const mockStats = {
    totalUsers: 1250,
    totalProperties: 856,
    totalRevenue: 2500000,
    monthlyGrowth: 12.5,
    pendingVerifications: 23,
    totalViews: 45000,
    totalEnquiries: 1200,
    activeSubscriptions: 150
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="properties" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Properties
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="brokers" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Brokers
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <AdminDashboard 
            stats={mockStats} 
            pendingProperties={[]}
            onApproveProperty={() => {}}
            onRejectProperty={() => {}}
            onViewProperty={() => {}}
          />
        </TabsContent>

        <TabsContent value="properties">
          <AdminPropertyManagement />
        </TabsContent>

        <TabsContent value="users">
          <AdminUserManagement />
        </TabsContent>

        <TabsContent value="brokers">
          <BrokerManagement />
        </TabsContent>

        <TabsContent value="security">
          <SecurityLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const SecurityLogs: React.FC = () => {
  const [securityLogs] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem('securityLogs') || '[]');
    } catch {
      return [];
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Security Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {securityLogs.length > 0 ? (
            securityLogs.slice(-20).reverse().map((log: any, index: number) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">{log.event}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>User: {log.user_id || 'Anonymous'}</p>
                  <p>IP: {log.ip_address}</p>
                  {log.details && (
                    <pre className="mt-2 p-2 bg-muted rounded text-xs">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No security events logged yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const AdminPanel = withSecurity(AdminPanelComponent, 'admin');