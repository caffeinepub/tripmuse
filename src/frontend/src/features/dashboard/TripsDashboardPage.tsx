import { useGetAllTripPlans } from '../../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import TripCard from './TripCard';
import { Button } from '@/components/ui/button';
import { Plus, Compass } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function TripsDashboardPage() {
  const { data: trips, isLoading } = useGetAllTripPlans();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-64 bg-muted rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const hasTrips = trips && trips.length > 0;

  return (
    <div className="space-y-10 md:space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent shadow-premium-lg">
        <div className="absolute inset-0 bg-[url('/assets/generated/hero-sunrise.dim_1600x600.png')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
        
        <div className="relative z-10 px-8 py-12 md:px-12 md:py-16 lg:py-20">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-primary-foreground">
              Your Travel Adventures
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed max-w-2xl">
              Plan, organize, and explore the world with confidence. Every journey begins with a single step.
            </p>
            <Button
              onClick={() => navigate({ to: '/new-trip' })}
              size="lg"
              variant="secondary"
              className="gap-2 h-12 px-6 text-base shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Plan a New Trip
            </Button>
          </div>
        </div>
      </div>

      {/* Trips Grid or Empty State */}
      {!hasTrips ? (
        <Card className="border-dashed border-2 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-20 md:py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Compass className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">No trips yet</h3>
            <p className="text-muted-foreground text-base mb-8 max-w-md leading-relaxed">
              Start planning your next adventure! Create your first trip to get personalized recommendations and itineraries.
            </p>
            <Button 
              onClick={() => navigate({ to: '/new-trip' })} 
              className="gap-2 h-11 px-6 shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Your First Trip
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-semibold">Your Trips</h2>
            <p className="text-muted-foreground">
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <TripCard key={trip.id.toString()} trip={trip} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
