export interface TripIntake {
  destination: string;
  startDate: string;
  endDate: string;
  days: number;
  startingFrom?: string;
  travelStyle: 'luxury' | 'budget' | 'adventure' | 'relaxing' | 'balanced';
  groupType: 'solo' | 'couple' | 'family' | 'friends';
  interests: string;
  season?: string;
  budgetRange: string;
  hotelLevel: 'budget' | 'mid-range' | 'upscale' | 'luxury';
  transportType: 'public' | 'rental' | 'taxi' | 'mixed';
  dailyFoodBudget: number;
}

export function validateIntake(intake: Partial<TripIntake>): string[] {
  const errors: string[] = [];

  if (!intake.destination?.trim()) errors.push('Destination is required');
  if (!intake.startDate) errors.push('Start date is required');
  if (!intake.endDate) errors.push('End date is required');
  if (!intake.days || intake.days <= 0) errors.push('Number of days must be greater than 0');
  if (!intake.travelStyle) errors.push('Travel style is required');
  if (!intake.groupType) errors.push('Group type is required');
  if (!intake.interests?.trim()) errors.push('Interests are required');
  if (!intake.budgetRange?.trim()) errors.push('Budget range is required');
  if (!intake.hotelLevel) errors.push('Hotel level is required');
  if (!intake.transportType) errors.push('Transport type is required');
  if (!intake.dailyFoodBudget || intake.dailyFoodBudget <= 0) errors.push('Daily food budget must be greater than 0');

  return errors;
}
