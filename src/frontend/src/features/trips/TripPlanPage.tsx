import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetTripPlan } from '../../hooks/useQueries';
import TripPlanView from './TripPlanView';
import BudgetSection from '../budget/BudgetSection';
import ToDoSection from '../todos/ToDoSection';
import EmergencySection from '../emergency/EmergencySection';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Printer, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function TripPlanPage() {
  const { tripId } = useParams({ from: '/trip/$tripId' });
  const navigate = useNavigate();
  const { data: trip, isLoading, isError, error } = useGetTripPlan(BigInt(tripId));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-lg text-muted-foreground">Loading your trip plan...</p>
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <Card className="max-w-md w-full shadow-premium">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Trip Not Found</h2>
              <p className="text-muted-foreground">
                {error?.message || 'The trip you are looking for does not exist or you do not have access to it.'}
              </p>
            </div>
            <Button onClick={() => navigate({ to: '/' })} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="outline" onClick={() => navigate({ to: '/' })} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={() => navigate({ to: '/trip/$tripId/print', params: { tripId } })}
          variant="outline"
          className="gap-2"
        >
          <Printer className="w-4 h-4" />
          Print / Export
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="todos">To-Do</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <TripPlanView trip={trip} />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetSection trip={trip} />
        </TabsContent>

        <TabsContent value="todos">
          <ToDoSection trip={trip} />
        </TabsContent>

        <TabsContent value="emergency">
          <EmergencySection trip={trip} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
