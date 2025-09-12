import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityContext {
  rateLimitCheck: (action: string) => Promise<boolean>;
  logSecurityEvent: (event: string, details?: any) => void;
  isBlocked: boolean;
}

const SecurityContext = createContext<SecurityContext | null>(null);

interface RateLimitEntry {
  action: string;
  timestamp: number;
  count: number;
}

interface SecurityMiddlewareProps {
  children: React.ReactNode;
}

const RATE_LIMITS = {
  login_attempt: { max: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  property_enquiry: { max: 10, window: 60 * 60 * 1000 }, // 10 enquiries per hour
  document_upload: { max: 20, window: 60 * 60 * 1000 }, // 20 uploads per hour
  search_request: { max: 100, window: 60 * 60 * 1000 }, // 100 searches per hour
  broker_contact: { max: 15, window: 60 * 60 * 1000 }, // 15 broker contacts per hour
  payment_attempt: { max: 3, window: 30 * 60 * 1000 }, // 3 payment attempts per 30 minutes
};

export const SecurityMiddleware: React.FC<SecurityMiddlewareProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rateLimitData, setRateLimitData] = useState<Record<string, RateLimitEntry[]>>({});
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);

  useEffect(() => {
    // Check if user is still blocked
    if (blockedUntil && Date.now() < blockedUntil) {
      setIsBlocked(true);
    } else {
      setIsBlocked(false);
      setBlockedUntil(null);
    }
  }, [blockedUntil]);

  useEffect(() => {
    // Load rate limit data from localStorage
    const saved = localStorage.getItem('rateLimitData');
    if (saved) {
      try {
        setRateLimitData(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading rate limit data:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save rate limit data to localStorage
    localStorage.setItem('rateLimitData', JSON.stringify(rateLimitData));
  }, [rateLimitData]);

  const rateLimitCheck = async (action: string): Promise<boolean> => {
    if (isBlocked) {
      toast({
        title: "Access Temporarily Blocked",
        description: "Too many requests. Please wait before trying again.",
        variant: "destructive"
      });
      return false;
    }

    const limit = RATE_LIMITS[action as keyof typeof RATE_LIMITS];
    if (!limit) return true;

    const now = Date.now();
    const userKey = user?.id || 'anonymous';
    const key = `${userKey}_${action}`;
    
    // Get existing entries for this action
    const existing = rateLimitData[key] || [];
    
    // Filter out old entries
    const validEntries = existing.filter(
      entry => now - entry.timestamp < limit.window
    );
    
    // Check if limit exceeded
    if (validEntries.length >= limit.max) {
      // Log security event
      logSecurityEvent('rate_limit_exceeded', {
        action,
        user_id: user?.id,
        attempts: validEntries.length,
        limit: limit.max
      });

      // Check for suspicious activity
      if (validEntries.length > limit.max * 2) {
        setIsBlocked(true);
        setBlockedUntil(now + 30 * 60 * 1000); // Block for 30 minutes
        
        logSecurityEvent('user_blocked', {
          action,
          user_id: user?.id,
          attempts: validEntries.length,
          blocked_until: blockedUntil
        });
      }

      toast({
        title: "Rate Limit Exceeded",
        description: `Too many ${action.replace('_', ' ')} attempts. Please wait and try again.`,
        variant: "destructive"
      });
      
      return false;
    }

    // Add new entry
    const newEntry: RateLimitEntry = {
      action,
      timestamp: now,
      count: 1
    };

    setRateLimitData(prev => ({
      ...prev,
      [key]: [...validEntries, newEntry]
    }));

    return true;
  };

  const logSecurityEvent = async (event: string, details?: any) => {
    try {
      // In a real application, you would send this to your backend
      const securityLog = {
        event,
        user_id: user?.id,
        timestamp: new Date().toISOString(),
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent,
        details
      };

      // Store in localStorage for now (in production, send to backend)
      const existingLogs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
      existingLogs.push(securityLog);
      
      // Keep only last 100 logs
      const recentLogs = existingLogs.slice(-100);
      localStorage.setItem('securityLogs', JSON.stringify(recentLogs));

      // In production, also send to Supabase or monitoring service
      console.log('Security Event:', securityLog);
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  };

  return (
    <SecurityContext.Provider 
      value={{ 
        rateLimitCheck, 
        logSecurityEvent, 
        isBlocked 
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within SecurityMiddleware');
  }
  return context;
};

// HOC for protecting routes
export const withSecurity = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRole?: string
) => {
  return (props: P) => {
    const { user, userRole } = useAuth();
    const { isBlocked, logSecurityEvent } = useSecurity();

    useEffect(() => {
      if (requiredRole && userRole !== requiredRole) {
        logSecurityEvent('unauthorized_access_attempt', {
          required_role: requiredRole,
          user_role: userRole,
          component: WrappedComponent.name
        });
      }
    }, [userRole, requiredRole]);

    if (isBlocked) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Access Temporarily Blocked</h2>
            <p className="text-muted-foreground">
              Your account has been temporarily blocked due to suspicious activity.
              Please wait before trying again.
            </p>
          </div>
        </div>
      );
    }

    if (requiredRole && userRole !== requiredRole) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this resource.
            </p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

// Utility function to sanitize user input
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

// XSS protection for rendering user content
export const sanitizeForDisplay = (content: string): string => {
  return sanitizeInput(content)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};
