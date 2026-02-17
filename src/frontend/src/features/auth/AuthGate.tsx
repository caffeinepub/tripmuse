import { ReactNode } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';

interface AuthGateProps {
  children: ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { identity, login, loginStatus } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
        <div className="absolute inset-0 bg-[url('/assets/generated/hero-sunrise.dim_1600x600.png')] bg-cover bg-center opacity-[0.03]" />
        
        <Card className="w-full max-w-lg relative shadow-premium-lg border-border/50">
          <CardHeader className="text-center space-y-6 pb-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
                <img 
                  src="/assets/generated/logo-compass-path.dim_512x512.png" 
                  alt="TripMuse" 
                  className="w-24 h-24 relative" 
                />
              </div>
            </div>
            <div className="space-y-3">
              <CardTitle className="text-3xl md:text-4xl font-semibold">
                Welcome to TripMuse
              </CardTitle>
              <CardDescription className="text-base md:text-lg leading-relaxed">
                Your intelligent travel companion for seamless trip planning
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <div className="grid gap-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Smart Destinations</p>
                  <p className="text-sm text-muted-foreground">Personalized suggestions based on your preferences</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Detailed Itineraries</p>
                  <p className="text-sm text-muted-foreground">Day-by-day plans tailored to your travel style</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Budget Planning</p>
                  <p className="text-sm text-muted-foreground">Track expenses and optimize your spending</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Travel Checklists</p>
                  <p className="text-sm text-muted-foreground">Never forget important tasks and reminders</p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full h-12 text-base shadow-md hover:shadow-lg transition-all"
              size="lg"
            >
              {isLoggingIn ? 'Connecting...' : 'Login to Start Planning'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
