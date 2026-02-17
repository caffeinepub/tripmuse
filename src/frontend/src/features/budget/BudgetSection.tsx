import { useState } from 'react';
import { TripPlan } from '../../backend';
import { useUpdateBudgetEstimates } from '../../hooks/useQueries';
import { calculateBudget } from './BudgetEstimator';
import { formatINR } from '../../utils/currency';
import SectionHeading from '../../components/SectionHeading';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface BudgetSectionProps {
  trip: TripPlan;
}

export default function BudgetSection({ trip }: BudgetSectionProps) {
  const updateBudgetMutation = useUpdateBudgetEstimates();
  const [assumptions, setAssumptions] = useState(trip.costAssumptions);
  const [hasChanges, setHasChanges] = useState(false);

  const days = trip.itinerary.length;
  const { budget } = calculateBudget(days, assumptions);

  const handleAssumptionChange = (field: keyof typeof assumptions, value: any) => {
    setAssumptions((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateBudgetMutation.mutateAsync({
        tripId: trip.id,
        budget,
        costAssumptions: assumptions,
      });
      setHasChanges(false);
      toast.success('Budget updated successfully');
    } catch (error) {
      toast.error('Failed to update budget');
    }
  };

  return (
    <div>
      <SectionHeading emoji="💰" title="Budget Estimate">
        <p className="text-sm">Adjust your assumptions to see updated costs (INR)</p>
      </SectionHeading>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold mb-4">Cost Assumptions</h3>

            <div className="space-y-2">
              <Label htmlFor="hotelLevel">Accommodation Level</Label>
              <Select
                value={assumptions.hotelLevel}
                onValueChange={(v) => handleAssumptionChange('hotelLevel', v)}
              >
                <SelectTrigger id="hotelLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget (₹3,000/night)</SelectItem>
                  <SelectItem value="mid-range">Mid-Range (₹7,500/night)</SelectItem>
                  <SelectItem value="upscale">Upscale (₹15,000/night)</SelectItem>
                  <SelectItem value="luxury">Luxury (₹30,000/night)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transportType">Transportation</Label>
              <Select
                value={assumptions.transportType}
                onValueChange={(v) => handleAssumptionChange('transportType', v)}
              >
                <SelectTrigger id="transportType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public Transport (₹750/day)</SelectItem>
                  <SelectItem value="rental">Rental Car (₹3,750/day)</SelectItem>
                  <SelectItem value="taxi">Taxis/Rideshare (₹3,000/day)</SelectItem>
                  <SelectItem value="mixed">Mixed (₹2,250/day)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyFoodBudget">Daily Food Budget (₹)</Label>
              <Input
                id="dailyFoodBudget"
                type="number"
                min="0"
                value={assumptions.dailyFoodBudget}
                onChange={(e) => handleAssumptionChange('dailyFoodBudget', parseFloat(e.target.value) || 0)}
              />
            </div>

            {hasChanges && (
              <Button onClick={handleSave} className="w-full" disabled={updateBudgetMutation.isPending}>
                {updateBudgetMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Budget Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Accommodation</span>
                <span className="font-medium">{formatINR(budget.stay)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Food</span>
                <span className="font-medium">{formatINR(budget.food)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Transportation</span>
                <span className="font-medium">{formatINR(budget.transport)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Attractions</span>
                <span className="font-medium">{formatINR(budget.attractions)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Estimate</span>
                <span className="text-primary">{formatINR(budget.total)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * Estimates are approximate and may vary based on actual spending
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
