import { TripPlan } from '../../backend';
import { useNavigate } from '@tanstack/react-router';
import { useDeleteTripPlan, useCreateTripPlan } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, MapPin, Calendar, DollarSign, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatINR } from '../../utils/currency';

interface TripCardProps {
  trip: TripPlan;
}

export default function TripCard({ trip }: TripCardProps) {
  const navigate = useNavigate();
  const deleteTripMutation = useDeleteTripPlan();
  const createTripMutation = useCreateTripPlan();

  const startDate = new Date(Number(trip.startDate) / 1_000_000);
  const endDate = new Date(Number(trip.endDate) / 1_000_000);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this trip?')) {
      try {
        await deleteTripMutation.mutateAsync(trip.id);
        toast.success('Trip deleted successfully');
      } catch (error) {
        toast.error('Failed to delete trip');
      }
    }
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newTripId = await createTripMutation.mutateAsync({
        title: `${trip.title} (Copy)`,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        itinerary: trip.itinerary,
        budget: trip.budget,
        costAssumptions: trip.costAssumptions,
        currency: trip.currency,
        accommodations: trip.accommodations,
        mustVisitPlaces: trip.mustVisitPlaces,
        foodRecommendations: trip.foodRecommendations,
        localTransportOptions: trip.localTransportOptions,
        totalFoodBudget: trip.totalFoodBudget,
      });
      toast.success('Trip duplicated successfully');
      navigate({ to: '/trip/$tripId', params: { tripId: newTripId.toString() } });
    } catch (error) {
      toast.error('Failed to duplicate trip');
    }
  };

  return (
    <Card className="group hover:shadow-premium transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/30">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {trip.title}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent
        className="space-y-4"
        onClick={() => navigate({ to: '/trip/$tripId', params: { tripId: trip.id.toString() } })}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0 text-primary/70" />
            <span className="line-clamp-1 font-medium">{trip.destination}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 flex-shrink-0 text-primary/70" />
            <span>{days} {days === 1 ? 'day' : 'days'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <DollarSign className="w-4 h-4 flex-shrink-0 text-primary/70" />
            <span className="font-medium">{formatINR(trip.budget.total)}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
          <Badge variant="secondary" className="text-xs font-medium">
            {trip.costAssumptions.hotelLevel}
          </Badge>
          <Badge variant="secondary" className="text-xs font-medium">
            {trip.costAssumptions.transportType}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
