import React from 'react';
import { BrokerDashboard } from '@/components/brokers/BrokerDashboard';
import { withSecurity } from '@/middleware/SecurityMiddleware';
import { Building2 } from 'lucide-react';

const BrokerPanelComponent: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Building2 className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Broker Dashboard</h1>
      </div>

      <BrokerDashboard />
    </div>
  );
};

export const BrokerPanel = withSecurity(BrokerPanelComponent, 'broker');