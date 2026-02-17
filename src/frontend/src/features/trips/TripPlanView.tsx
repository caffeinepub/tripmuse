import { TripPlan } from '../../backend';
import { formatINR } from '../../utils/currency';
import { buildDestinationMapUrl } from '../../utils/maps';
import SectionHeading from '../../components/SectionHeading';
import MapsNavigationSection from './MapsNavigationSection';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Hotel, Utensils, Landmark, Bus, ExternalLink } from 'lucide-react';
import { generatePackingList, generateWeatherTips, generateDestinationSuggestions } from './TripPlanGenerator';

interface TripPlanViewProps {
  trip: TripPlan;
}

export default function TripPlanView({ trip }: TripPlanViewProps) {
  const startDate = new Date(Number(trip.startDate) / 1_000_000);
  const endDate = new Date(Number(trip.endDate) / 1_000_000);

  const intakeForGeneration = {
    destination: trip.destination,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    days: trip.itinerary.length,
    travelStyle: 'balanced' as const,
    groupType: 'solo' as const,
    interests: '',
    budgetRange: `₹${trip.budget.total}`,
    hotelLevel: trip.costAssumptions.hotelLevel as any,
    transportType: trip.costAssumptions.transportType as any,
    dailyFoodBudget: trip.costAssumptions.dailyFoodBudget,
  };

  const packingList = generatePackingList(intakeForGeneration);
  const weatherTips = generateWeatherTips(intakeForGeneration);
  const destinationSuggestions = generateDestinationSuggestions(intakeForGeneration);

  const accommodations = trip.accommodations.length > 0 ? trip.accommodations : [];
  const mustVisitPlaces = trip.mustVisitPlaces.length > 0 ? trip.mustVisitPlaces : [];
  const foodRecommendations = trip.foodRecommendations.length > 0 ? trip.foodRecommendations : [];
  const localTransportOptions = trip.localTransportOptions.length > 0 ? trip.localTransportOptions : [];

  const handleViewDestinationInMaps = () => {
    const url = buildDestinationMapUrl(trip.destination);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 h-64 md:h-80 overflow-hidden rounded-none sm:rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-accent/80" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">{trip.title}</h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-white/95 mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span className="text-lg font-medium">{trip.destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span className="text-lg">
                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
              </span>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleViewDestinationInMaps}
            className="bg-white/95 hover:bg-white text-primary shadow-lg"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View destination in Maps
          </Button>
        </div>
      </div>

      {/* Destination Suggestions */}
      <div>
        <SectionHeading emoji="✨" title="Destination Highlights">
          <p className="text-sm">Top recommendations for your trip</p>
        </SectionHeading>
        <Card>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {destinationSuggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-muted-foreground leading-relaxed">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Maps & Navigation Section */}
      <MapsNavigationSection mustVisitPlaces={mustVisitPlaces} destination={trip.destination} />

      {/* Itinerary */}
      <div>
        <SectionHeading emoji="📅" title="Day-by-Day Itinerary">
          <p className="text-sm">Your personalized schedule</p>
        </SectionHeading>
        <div className="space-y-4">
          {trip.itinerary.map((day, index) => {
            const dayDate = new Date(Number(day.date) / 1_000_000);
            return (
              <Card key={index} className="shadow-sm hover:shadow-md transition-shadow border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Day {index + 1}</h3>
                      <p className="text-sm text-muted-foreground">
                        {dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2 ml-2">
                    {day.activities.map((activity, actIndex) => (
                      <li key={actIndex} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
                        <span className="text-primary mt-1">•</span>
                        <span>{activity}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Accommodations */}
      {accommodations.length > 0 && (
        <div>
          <SectionHeading emoji="🏨" title="Recommended Accommodations">
            <p className="text-sm">Places to stay during your trip</p>
          </SectionHeading>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accommodations.map((accommodation, index) => (
              <Card key={index} className="shadow-sm hover:shadow-md transition-shadow border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-3">
                    <Hotel className="w-5 h-5 text-primary mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{accommodation.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{accommodation.location}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="capitalize">{accommodation.type}</Badge>
                        <span className="font-semibold text-primary">{formatINR(accommodation.pricePerNight)}/night</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Must-Visit Places */}
      {mustVisitPlaces.length > 0 && (
        <div>
          <SectionHeading emoji="🎯" title="Must-Visit Places">
            <p className="text-sm">Top attractions and landmarks</p>
          </SectionHeading>
          <div className="grid gap-4 md:grid-cols-2">
            {mustVisitPlaces.map((place, index) => (
              <Card key={index} className="shadow-sm hover:shadow-md transition-shadow border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Landmark className="w-5 h-5 text-primary mt-1" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{place.name}</h3>
                        <Badge variant="outline" className="capitalize">{place.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{place.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Food Recommendations */}
      {foodRecommendations.length > 0 && (
        <div>
          <SectionHeading emoji="🍽️" title="Food Recommendations">
            <p className="text-sm">Local cuisine and dining spots</p>
          </SectionHeading>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {foodRecommendations.map((food, index) => (
              <Card key={index} className="shadow-sm hover:shadow-md transition-shadow border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Utensils className="w-5 h-5 text-primary mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{food.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{food.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="capitalize">{food.type}</Badge>
                        <span className="text-xs text-muted-foreground">{food.budgetLevel}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Local Transport Options */}
      {localTransportOptions.length > 0 && (
        <div>
          <SectionHeading emoji="🚕" title="Local Transport Options">
            <p className="text-sm">Getting around the destination</p>
          </SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {localTransportOptions.map((transport, index) => (
              <Card key={index} className="shadow-sm hover:shadow-md transition-shadow border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bus className="w-5 h-5 text-primary" />
                      <span className="font-medium capitalize">{transport.type.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                    <span className="font-semibold text-primary">{formatINR(transport.price)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Packing List */}
      <div>
        <SectionHeading emoji="🧳" title="Packing List">
          <p className="text-sm">Essential items for your trip</p>
        </SectionHeading>
        <Card>
          <CardContent className="pt-6">
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {packingList.map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="text-primary">☐</span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Weather Tips */}
      <div>
        <SectionHeading emoji="🌦️" title="Weather & Best Time to Visit">
          <p className="text-sm">Climate information and tips</p>
        </SectionHeading>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed">{weatherTips}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
