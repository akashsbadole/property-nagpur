import React from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

interface MobileHeaderProps {
  title?: string;
  showSearch?: boolean;
  onMenuClick?: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  title = "HomeDwell AI", 
  showSearch = false, 
  onMenuClick 
}) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMenuClick}
            className="h-8 w-8"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {showSearch && (
            <div className="relative max-w-sm">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="h-8 pl-8"
              />
            </div>
          )}
          
          {user && (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bell className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;