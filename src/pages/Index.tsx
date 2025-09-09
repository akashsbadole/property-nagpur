import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Search, MapPin, MessageCircle, Shield, CreditCard, BarChart3, Users, LogOut, User } from 'lucide-react';

const Index = () => {
  const { user, userRole, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-primary">PropertyHub</h1>
            </div>
            <Button onClick={() => navigate('/auth')} className="bg-primary hover:bg-primary-hover">
              Sign In
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Find Your Perfect
              <span className="text-primary block">Property</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Buy, sell or rent properties across India. Thousands of verified listings await you.
            </p>
            
            {/* Search Bar */}
            <div className="bg-background border rounded-xl p-6 shadow-lg max-w-2xl mx-auto mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Enter city, locality or property name"
                    className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button size="lg" className="bg-primary hover:bg-primary-hover px-8">
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Category Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border/50">
                <CardContent className="p-4 text-center">
                  <Home className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">Flats</h3>
                  <p className="text-xs text-muted-foreground">Apartments</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border/50">
                <CardContent className="p-4 text-center">
                  <Home className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">Houses</h3>
                  <p className="text-xs text-muted-foreground">Independent</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border/50">
                <CardContent className="p-4 text-center">
                  <Home className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">Commercial</h3>
                  <p className="text-xs text-muted-foreground">Office/Shop</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border/50">
                <CardContent className="p-4 text-center">
                  <Home className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">Plots</h3>
                  <p className="text-xs text-muted-foreground">Land</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/auth')} size="lg" className="bg-primary hover:bg-primary-hover">
                Get Started
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/properties')}>
                Browse Properties
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Platform Features</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need for a seamless property experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Search className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Advanced Search</CardTitle>
                <CardDescription>
                  Filter by location, price, amenities, and more to find exactly what you're looking for
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Map View</CardTitle>
                <CardDescription>
                  Explore properties on an interactive map with location insights and nearby amenities
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Direct Communication</CardTitle>
                <CardDescription>
                  Chat directly with property owners and agents, schedule site visits seamlessly
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Verified Listings</CardTitle>
                <CardDescription>
                  All properties are verified with KYC and document verification for your security
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Secure Payments</CardTitle>
                <CardDescription>
                  Safe and secure payment processing for featured listings and token amounts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Market Analytics</CardTitle>
                <CardDescription>
                  Get insights on price trends, locality scores, and market appreciation rates
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary/5 py-16">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold text-foreground mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust PropertyHub for their real estate needs
            </p>
            <Button onClick={() => navigate('/auth')} size="lg" className="bg-primary hover:bg-primary-hover">
              Create Your Account
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-background py-8">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>&copy; 2024 PropertyHub. All rights reserved.</p>
          </div>
        </footer>
      </div>
    );
  }

  // Authenticated user dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary">PropertyHub</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4" />
              <span className="font-medium">{user.email}</span>
              {userRole && (
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs capitalize">
                  {userRole}
                </span>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!
          </h2>
          <p className="text-muted-foreground">
            Manage your properties and explore new opportunities
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Properties</CardTitle>
              <div className="text-2xl font-bold">0</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Listings</CardTitle>
              <div className="text-2xl font-bold">0</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
              <div className="text-2xl font-bold">0</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Enquiries</CardTitle>
              <div className="text-2xl font-bold">0</div>
            </CardHeader>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/properties')}>
            <CardHeader>
              <Search className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Search Properties</CardTitle>
              <CardDescription>
                Find properties that match your criteria with advanced filters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Searching</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Home className="h-8 w-8 text-primary mb-2" />
              <CardTitle>List Property</CardTitle>
              <CardDescription>
                Add your property to reach thousands of potential buyers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">List Now</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>My Network</CardTitle>
              <CardDescription>
                Connect with agents, brokers, and other property professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">View Network</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
