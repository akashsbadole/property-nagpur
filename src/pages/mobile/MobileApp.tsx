import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import MobileHeader from '@/components/mobile/MobileHeader';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import Index from '@/pages/Index';
import Properties from '@/pages/Properties';
import PropertyDetail from '@/pages/PropertyDetail';
import Auth from '@/pages/Auth';
import { AdminPanel } from '@/pages/admin/AdminPanel';
import { BrokerPanel } from '@/pages/broker/BrokerPanel';
import NotFound from '@/pages/NotFound';

const MobileApp = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!isMobile) {
    return (
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/broker" element={<BrokerPanel />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader 
        onMenuClick={() => setMenuOpen(!menuOpen)}
        showSearch={true}
      />
      
      <main className="pb-16 px-4 pt-4">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/broker" element={<BrokerPanel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {user && <MobileNavigation />}
    </div>
  );
};

export default MobileApp;