import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateTripPlan, useGetInrCurrency } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { generateTripPlan } from '../trips/TripPlanGenerator';
import type { TripIntake } from './intakeSchema';
import { Alert, AlertDescription } from '@/components/ui/alert';

const STEPS = [
  { id: 'destination', title: 'Destination & Dates', emoji: '🗺️' },
  { id: 'preferences', title: 'Travel Preferences', emoji: '✨' },
  { id: 'budget', title: 'Budget & Style', emoji: '💰' },
  { id: 'review', title: 'Review & Generate', emoji: '🎯' },
];

export default function TripPlannerWizard() {
  const navigate = useNavigate();
  const createTripMutation = useCreateTripPlan();
  const { data: inrCurrency, isLoading: currencyLoading } = useGetInrCurrency();
  const [currentStep, setCurrentStep] = useState(0);
  const [validationError, setValidationError] = useState<string>('');
  const [intake, setIntake] = useState<Partial<TripIntake>>({
    travelStyle: 'balanced',
    groupType: 'solo',
    hotelLevel: 'mid-range',
    transportType: 'public',
    dailyFoodBudget: 2000, // Default ₹2,000/day
  });

  const updateIntake = (field: keyof TripIntake, value: any) => {
    setIntake((prev) => ({ ...prev, [field]: value }));
    setValidationError('');
  };

  const validateStep = (step: number): string | null => {
    if (step === 0) {
      if (!intake.destination) return 'Please enter a destination';
      if (!intake.startDate) return 'Please select a start date';
      if (!intake.endDate) return 'Please select an end date';
      if (!intake.days || intake.days <= 0) return 'Please enter a valid number of days';
      
      const start = new Date(intake.startDate);
      const end = new Date(intake.endDate);
      if (end <= start) return 'End date must be after start date';
    }
    if (step === 1) {
      if (!intake.travelStyle) return 'Please select a travel style';
      if (!intake.groupType) return 'Please select who you are traveling with';
      if (!intake.interests || intake.interests.trim().length === 0) return 'Please describe your interests';
    }
    if (step === 2) {
      if (!intake.budgetRange) return 'Please enter your budget range';
      if (!intake.hotelLevel) return 'Please select an accommodation level';
      if (!intake.transportType) return 'Please select a transportation preference';
      if (!intake.dailyFoodBudget || intake.dailyFoodBudget <= 0) return 'Please enter a valid daily food budget';
    }
    return null;
  };

  const canProceed = () => {
    return validateStep(currentStep) === null;
  };

  const handleNext = () => {
    const error = validateStep(currentStep);
    if (error) {
      setValidationError(error);
      toast.error(error);
      return;
    }
    setValidationError('');
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setValidationError('');
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleGenerate = async () => {
    const error = validateStep(currentStep);
    if (error) {
      setValidationError(error);
      toast.error(error);
      return;
    }

    if (!inrCurrency) {
      toast.error('Currency information not available. Please try again.');
      return;
    }

    try {
      const plan = generateTripPlan(intake as TripIntake, inrCurrency);
      const tripId = await createTripMutation.mutateAsync(plan);
      toast.success('Trip plan created successfully!');
      navigate({ to: '/trip/$tripId', params: { tripId: tripId.toString() } });
    } catch (error: any) {
      console.error('Failed to create trip plan:', error);
      toast.error(error?.message || 'Failed to create trip plan. Please try again.');
    }
  };

  const isGenerating = createTripMutation.isPending || currencyLoading;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-semibold">Plan Your Perfect Trip</h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          Answer a few questions and we'll create a personalized itinerary for you
        </p>
      </div>

      {/* Stepper */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1 gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-medium transition-all duration-300 ${
                    index <= currentStep
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.emoji}
                </div>
                <span className={`text-xs sm:text-sm font-medium text-center transition-colors ${
                  index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 sm:mx-4 transition-all duration-300 ${
                    index < currentStep ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <Card className="shadow-premium border-border/50">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <span className="text-3xl">{STEPS[currentStep].emoji}</span>
            {STEPS[currentStep].title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {currentStep === 0 && (
            <>
              <div className="space-y-3">
                <Label htmlFor="destination" className="text-base">Where do you want to go? *</Label>
                <Input
                  id="destination"
                  placeholder="e.g., Goa, India"
                  value={intake.destination || ''}
                  onChange={(e) => updateIntake('destination', e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="startDate" className="text-base">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={intake.startDate || ''}
                    onChange={(e) => updateIntake('startDate', e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="endDate" className="text-base">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={intake.endDate || ''}
                    onChange={(e) => updateIntake('endDate', e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="days" className="text-base">Number of Days *</Label>
                <Input
                  id="days"
                  type="number"
                  min="1"
                  placeholder="e.g., 7"
                  value={intake.days || ''}
                  onChange={(e) => updateIntake('days', parseInt(e.target.value) || 0)}
                  className="h-11"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="startingFrom" className="text-base">Starting from (City/Country)</Label>
                <Input
                  id="startingFrom"
                  placeholder="e.g., Mumbai, India"
                  value={intake.startingFrom || ''}
                  onChange={(e) => updateIntake('startingFrom', e.target.value)}
                  className="h-11"
                />
              </div>
            </>
          )}

          {currentStep === 1 && (
            <>
              <div className="space-y-3">
                <Label htmlFor="travelStyle" className="text-base">Travel Style *</Label>
                <Select value={intake.travelStyle} onValueChange={(v) => updateIntake('travelStyle', v)}>
                  <SelectTrigger id="travelStyle" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="luxury">🌟 Luxury</SelectItem>
                    <SelectItem value="budget">💵 Budget</SelectItem>
                    <SelectItem value="adventure">🏔️ Adventure</SelectItem>
                    <SelectItem value="relaxing">🏖️ Relaxing</SelectItem>
                    <SelectItem value="balanced">⚖️ Balanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="groupType" className="text-base">Traveling with *</Label>
                <Select value={intake.groupType} onValueChange={(v) => updateIntake('groupType', v)}>
                  <SelectTrigger id="groupType" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">🧍 Solo</SelectItem>
                    <SelectItem value="couple">💑 Couple</SelectItem>
                    <SelectItem value="family">👨‍👩‍👧‍👦 Family</SelectItem>
                    <SelectItem value="friends">👥 Friends</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="interests" className="text-base">Interests & Activities *</Label>
                <Textarea
                  id="interests"
                  placeholder="e.g., museums, hiking, food tours, nightlife, photography..."
                  value={intake.interests || ''}
                  onChange={(e) => updateIntake('interests', e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="season" className="text-base">Season/Month</Label>
                <Input
                  id="season"
                  placeholder="e.g., Summer, December"
                  value={intake.season || ''}
                  onChange={(e) => updateIntake('season', e.target.value)}
                  className="h-11"
                />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="space-y-3">
                <Label htmlFor="budgetRange" className="text-base">Budget Range (₹) *</Label>
                <Input
                  id="budgetRange"
                  placeholder="e.g., ₹50,000-75,000"
                  value={intake.budgetRange || ''}
                  onChange={(e) => updateIntake('budgetRange', e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="hotelLevel" className="text-base">Accommodation Level *</Label>
                <Select value={intake.hotelLevel} onValueChange={(v) => updateIntake('hotelLevel', v)}>
                  <SelectTrigger id="hotelLevel" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget (Hostels, Budget Hotels)</SelectItem>
                    <SelectItem value="mid-range">Mid-Range (3-Star Hotels)</SelectItem>
                    <SelectItem value="upscale">Upscale (4-Star Hotels)</SelectItem>
                    <SelectItem value="luxury">Luxury (5-Star Hotels)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="transportType" className="text-base">Transportation Preference *</Label>
                <Select value={intake.transportType} onValueChange={(v) => updateIntake('transportType', v)}>
                  <SelectTrigger id="transportType" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public Transport</SelectItem>
                    <SelectItem value="rental">Rental Car</SelectItem>
                    <SelectItem value="taxi">Taxis/Rideshare</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="dailyFoodBudget" className="text-base">Daily Food Budget (₹) *</Label>
                <Input
                  id="dailyFoodBudget"
                  type="number"
                  min="0"
                  placeholder="e.g., 2000"
                  value={intake.dailyFoodBudget || ''}
                  onChange={(e) => updateIntake('dailyFoodBudget', parseFloat(e.target.value) || 0)}
                  className="h-11"
                />
              </div>
            </>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <CardDescription className="text-base">
                Review your trip details before generating your personalized plan
              </CardDescription>
              <div className="rounded-lg border border-border/50 bg-muted/30 p-6">
                <div className="grid gap-4 text-sm">
                  <div className="grid grid-cols-[140px_1fr] gap-3">
                    <span className="font-medium text-muted-foreground">Destination:</span>
                    <span className="font-medium">{intake.destination}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-3">
                    <span className="font-medium text-muted-foreground">Duration:</span>
                    <span className="font-medium">{intake.days} days</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-3">
                    <span className="font-medium text-muted-foreground">Travel Style:</span>
                    <span className="font-medium capitalize">{intake.travelStyle}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-3">
                    <span className="font-medium text-muted-foreground">Group Type:</span>
                    <span className="font-medium capitalize">{intake.groupType}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-3">
                    <span className="font-medium text-muted-foreground">Budget:</span>
                    <span className="font-medium">{intake.budgetRange}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-3">
                    <span className="font-medium text-muted-foreground">Accommodation:</span>
                    <span className="font-medium capitalize">{intake.hotelLevel}</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setCurrentStep(0)}
                variant="outline"
                size="default"
                className="w-full"
              >
                Edit Details
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-border/50">
            <Button
              onClick={handleBack}
              variant="outline"
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            {currentStep < STEPS.length - 1 ? (
              <Button onClick={handleNext} disabled={!canProceed()} className="gap-2">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={!canProceed() || isGenerating}
                className="gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'Generate Trip Plan'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
