import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Home, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Building,
  Users,
  Shield,
  Heart
} from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Properties', href: '/properties', icon: Building },
    { name: 'Find Brokers', href: '/brokers', icon: Users },
    { name: 'About Us', href: '/about', icon: Heart },
    { name: 'Contact', href: '/contact', icon: Phone },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'GDPR Compliance', href: '/gdpr' },
  ];

  const propertyTypes = [
    { name: 'Apartments', href: '/properties?type=apartment' },
    { name: 'Houses', href: '/properties?type=house' },
    { name: 'Villas', href: '/properties?type=villa' },
    { name: 'Commercial', href: '/properties?type=commercial' },
  ];

  const cities = [
    { name: 'Mumbai', href: '/properties?city=mumbai' },
    { name: 'Delhi', href: '/properties?city=delhi' },
    { name: 'Bangalore', href: '/properties?city=bangalore' },
    { name: 'Pune', href: '/properties?city=pune' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
  ];

  return (
    <footer className="bg-muted/50 border-t">
      {/* Newsletter Section */}
      <div className="border-b bg-primary/5">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
              <p className="text-muted-foreground">
                Get the latest property updates and market insights delivered to your inbox.
              </p>
            </div>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-background"
              />
              <Button type="submit">Subscribe</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <Home className="h-6 w-6 text-primary" />
              PropertyHub
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your trusted partner in finding the perfect property. We connect buyers, sellers, and brokers with cutting-edge technology and personalized service.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                +91 98765 43210
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                support@propertyhub.com
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Mumbai, Maharashtra, India
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-2">
              {socialLinks.map((social) => (
                <Button key={social.name} variant="ghost" size="icon" asChild>
                  <a href={social.href} target="_blank" rel="noopener noreferrer">
                    <social.icon className="h-4 w-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <nav className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Property Types & Cities */}
          <div className="space-y-4">
            <h3 className="font-semibold">Browse Properties</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Property Types</h4>
                <nav className="space-y-1">
                  {propertyTypes.map((type) => (
                    <Link
                      key={type.name}
                      to={type.href}
                      className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {type.name}
                    </Link>
                  ))}
                </nav>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Popular Cities</h4>
                <nav className="space-y-1">
                  {cities.map((city) => (
                    <Link
                      key={city.name}
                      to={city.href}
                      className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {city.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Legal & Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">Legal & Support</h3>
            <nav className="space-y-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Trust Badges */}
            <div className="pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Shield className="h-4 w-4" />
                Secured Platform
              </div>
              <p className="text-xs text-muted-foreground">
                Your data is protected with bank-level security and encryption.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bottom Bar */}
      <div className="container py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            © {currentYear} PropertyHub. All rights reserved. Built with ❤️ in India.
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Made with React & Supabase</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Version 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};