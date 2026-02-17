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
      <div className="min-h-screen flex items-center justify-center p-4 app-backdrop">
        
        <Card className="w-full max-w-lg relative shadow-premium-lg border-border/70 bg-card/98 backdrop-blur-md">
          <CardHeader className="text-center space-y-6 pb-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <img 
                  src="/assets/generated/logo-compass-path.dim_512x512.png" 
                  alt="TripMuse" 
                  className="w-24 h-24 relative" 
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent">
                Welcome to TripMuse
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Your intelligent travel companion for unforgettable journeys
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="grid gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
                <div className="mt-0.5 p-2 rounded-md bg-primary/10">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-medium text-sm text-foreground">Smart Itineraries</h4>
                  <p className="text-xs text-muted-foreground">AI-powered trip planning tailored to your preferences</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
                <div className="mt-0.5 p-2 rounded-md bg-accent/10">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-medium text-sm text-foreground">Day-by-Day Plans</h4>
                  <p className="text-xs text-muted-foreground">Detailed schedules with activities and recommendations</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
                <div className="mt-0.5 p-2 rounded-md bg-primary/10">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-medium text-sm text-foreground">Budget Tracking</h4>
                  <p className="text-xs text-muted-foreground">Keep your expenses organized with INR estimates</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
                <div className="mt-0.5 p-2 rounded-md bg-accent/10">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-medium text-sm text-foreground">Task Management</h4>
                  <p className="text-xs text-muted-foreground">Never miss a booking or preparation step</p>
                </div>
              </div>
            </div>

            <Button
              onClick={login}
              disabled={isLoggingIn}
              size="lg"
              className="w-full text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {isLoggingIn ? 'Connecting...' : 'Get Started'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secure authentication powered by Internet Identity
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
