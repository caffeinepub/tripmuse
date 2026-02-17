import type { TripIntake } from '../trip-planner/intakeSchema';
import type {
  BudgetEstimate,
  CostAssumptions,
  ItineraryDay,
  Currency,
  Accommodation,
  AccommodationType,
  MustVisitPlace,
  PlaceType,
  FoodRecommendation,
  FoodType,
  LocalTransportOption,
  TransportType,
} from '../../backend';
import { getHotelCostPerNight, getTransportCostPerDay } from '../budget/BudgetEstimator';

interface GeneratedPlan {
  title: string;
  destination: string;
  startDate: bigint;
  endDate: bigint;
  itinerary: ItineraryDay[];
  budget: BudgetEstimate;
  costAssumptions: CostAssumptions;
  currency: Currency;
  accommodations: Accommodation[];
  mustVisitPlaces: MustVisitPlace[];
  foodRecommendations: FoodRecommendation[];
  localTransportOptions: LocalTransportOption[];
  totalFoodBudget: number;
}

export function generateTripPlan(intake: TripIntake, inrCurrency: Currency): GeneratedPlan {
  const startDate = BigInt(new Date(intake.startDate).getTime() * 1_000_000);
  const endDate = BigInt(new Date(intake.endDate).getTime() * 1_000_000);

  const itinerary = generateItinerary(intake);
  const { budget, costAssumptions } = generateBudget(intake);
  const accommodations = generateAccommodations(intake);
  const mustVisitPlaces = generateMustVisitPlaces(intake);
  const foodRecommendations = generateFoodRecommendations(intake);
  const localTransportOptions = generateLocalTransportOptions(intake, inrCurrency);
  const totalFoodBudget = budget.food;

  return {
    title: `${intake.destination} ${intake.travelStyle.charAt(0).toUpperCase() + intake.travelStyle.slice(1)} Trip`,
    destination: intake.destination,
    startDate,
    endDate,
    itinerary,
    budget,
    costAssumptions,
    currency: inrCurrency,
    accommodations,
    mustVisitPlaces,
    foodRecommendations,
    localTransportOptions,
    totalFoodBudget,
  };
}

function generateItinerary(intake: TripIntake): ItineraryDay[] {
  const itinerary: ItineraryDay[] = [];
  const startDate = new Date(intake.startDate);

  for (let i = 0; i < intake.days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateTimestamp = BigInt(currentDate.getTime() * 1_000_000);

    const activities = generateDayActivities(i + 1, intake);

    itinerary.push({
      date: dateTimestamp,
      activities,
    });
  }

  return itinerary;
}

function generateDayActivities(dayNumber: number, intake: TripIntake): string[] {
  const activities: string[] = [];
  const interests = intake.interests.toLowerCase();

  if (dayNumber === 1) {
    activities.push(`Morning: Arrive in ${intake.destination} and check into your ${intake.hotelLevel} accommodation`);
    activities.push('Afternoon: Explore the neighborhood and get oriented with the local area');
    activities.push('Evening: Enjoy a welcome dinner at a local restaurant to sample regional cuisine');
  } else if (dayNumber === intake.days) {
    activities.push('Morning: Final shopping or visit any missed attractions');
    activities.push('Afternoon: Check out and prepare for departure');
    activities.push(`Evening: Depart from ${intake.destination}`);
  } else {
    activities.push(`Morning: Visit popular landmarks and attractions in ${intake.destination}`);

    if (interests.includes('museum') || interests.includes('culture') || interests.includes('history')) {
      activities.push('Afternoon: Explore local museums and cultural sites');
    } else if (interests.includes('food') || interests.includes('culinary')) {
      activities.push('Afternoon: Food tour and local market exploration');
    } else if (interests.includes('adventure') || interests.includes('hiking') || interests.includes('outdoor')) {
      activities.push('Afternoon: Outdoor activities and adventure experiences');
    } else if (interests.includes('shopping')) {
      activities.push('Afternoon: Shopping at local markets and boutiques');
    } else {
      activities.push('Afternoon: Leisure time to explore at your own pace');
    }

    if (interests.includes('nightlife') || interests.includes('entertainment')) {
      activities.push('Evening: Experience the local nightlife and entertainment scene');
    } else if (interests.includes('relaxing') || interests.includes('spa')) {
      activities.push('Evening: Relax and unwind at your accommodation or a local spa');
    } else {
      activities.push('Evening: Dinner at a recommended restaurant and evening stroll');
    }
  }

  return activities;
}

function generateBudget(intake: TripIntake): { budget: BudgetEstimate; costAssumptions: CostAssumptions } {
  const hotelCostPerNight = getHotelCostPerNight(intake.hotelLevel);
  const transportCostPerDay = getTransportCostPerDay(intake.transportType);

  const stay = hotelCostPerNight * intake.days;
  const food = intake.dailyFoodBudget * intake.days;
  const transport = transportCostPerDay * intake.days;
  const attractions = intake.days * 1500; // ₹1,500/day for attractions

  const total = stay + food + transport + attractions;

  return {
    budget: {
      total,
      stay,
      food,
      transport,
      attractions,
    },
    costAssumptions: {
      dailyFoodBudget: intake.dailyFoodBudget,
      hotelLevel: intake.hotelLevel,
      transportType: intake.transportType,
    },
  };
}

function generateAccommodations(intake: TripIntake): Accommodation[] {
  const accommodations: Accommodation[] = [];
  const destination = intake.destination;

  const hotelTypes: { name: string; type: AccommodationType; priceMultiplier: number }[] = [
    { name: `${destination} Central Hotel`, type: 'hotel' as AccommodationType, priceMultiplier: 1.0 },
    { name: `${destination} Downtown Inn`, type: 'hotel' as AccommodationType, priceMultiplier: 0.9 },
    { name: `${destination} Boutique Stay`, type: 'apartment' as AccommodationType, priceMultiplier: 1.1 },
  ];

  const basePrice = getHotelCostPerNight(intake.hotelLevel);

  hotelTypes.forEach((hotel) => {
    accommodations.push({
      name: hotel.name,
      location: `${destination} City Center`,
      pricePerNight: basePrice * hotel.priceMultiplier,
      type: hotel.type,
    });
  });

  return accommodations;
}

function generateMustVisitPlaces(intake: TripIntake): MustVisitPlace[] {
  const places: MustVisitPlace[] = [];
  const destination = intake.destination;
  const interests = intake.interests.toLowerCase();

  if (interests.includes('history') || interests.includes('culture') || interests.includes('museum')) {
    places.push({
      name: `${destination} Historical Museum`,
      description: 'Explore the rich history and cultural heritage of the region',
      type: 'historical' as PlaceType,
    });
    places.push({
      name: `${destination} Old Town`,
      description: 'Walk through historic streets and traditional architecture',
      type: 'cultural' as PlaceType,
    });
  }

  if (interests.includes('nature') || interests.includes('outdoor') || interests.includes('hiking')) {
    places.push({
      name: `${destination} National Park`,
      description: 'Experience stunning natural landscapes and wildlife',
      type: 'natural' as PlaceType,
    });
    places.push({
      name: `${destination} Scenic Viewpoint`,
      description: 'Panoramic views of the city and surrounding areas',
      type: 'natural' as PlaceType,
    });
  }

  places.push({
    name: `${destination} Main Square`,
    description: 'The heart of the city with vibrant atmosphere and local life',
    type: 'cultural' as PlaceType,
  });

  places.push({
    name: `${destination} Local Market`,
    description: 'Experience authentic local culture and shop for souvenirs',
    type: 'cultural' as PlaceType,
  });

  return places;
}

function generateFoodRecommendations(intake: TripIntake): FoodRecommendation[] {
  const recommendations: FoodRecommendation[] = [];
  const destination = intake.destination;
  const budgetLevel = intake.hotelLevel === 'luxury' ? 'High-end' : intake.hotelLevel === 'upscale' ? 'Premium' : intake.hotelLevel === 'mid-range' ? 'Mid-range' : 'Budget-friendly';

  recommendations.push({
    name: `${destination} Traditional Restaurant`,
    description: 'Authentic local cuisine with traditional recipes passed down through generations',
    type: 'other' as FoodType,
    imageUrl: undefined,
    budgetLevel,
    popularity: BigInt(95),
  });

  recommendations.push({
    name: `${destination} Street Food Market`,
    description: 'Experience the vibrant street food scene with local favorites',
    type: 'other' as FoodType,
    imageUrl: undefined,
    budgetLevel: 'Budget-friendly',
    popularity: BigInt(90),
  });

  recommendations.push({
    name: `${destination} Vegetarian Delight`,
    description: 'Excellent vegetarian and vegan options with fresh local ingredients',
    type: 'veg' as FoodType,
    imageUrl: undefined,
    budgetLevel,
    popularity: BigInt(85),
  });

  recommendations.push({
    name: `${destination} Seafood Grill`,
    description: 'Fresh seafood and grilled specialties with ocean views',
    type: 'nonVeg' as FoodType,
    imageUrl: undefined,
    budgetLevel,
    popularity: BigInt(88),
  });

  recommendations.push({
    name: `${destination} Rooftop Cafe`,
    description: 'Scenic rooftop dining with international and fusion cuisine',
    type: 'other' as FoodType,
    imageUrl: undefined,
    budgetLevel: 'Premium',
    popularity: BigInt(92),
  });

  return recommendations;
}

function generateLocalTransportOptions(intake: TripIntake, currency: Currency): LocalTransportOption[] {
  const options: LocalTransportOption[] = [];

  options.push({
    type: 'autoRikshaw' as TransportType,
    price: 50,
    currency,
  });

  options.push({
    type: 'taxi' as TransportType,
    price: 200,
    currency,
  });

  options.push({
    type: 'publicBus' as TransportType,
    price: 20,
    currency,
  });

  options.push({
    type: 'metro' as TransportType,
    price: 40,
    currency,
  });

  options.push({
    type: 'bikeRentals' as TransportType,
    price: 150,
    currency,
  });

  return options;
}

export function generatePackingList(intake: TripIntake): string[] {
  const items: string[] = [
    'Passport and travel documents',
    'Travel insurance documents',
    'Credit/debit cards and cash',
    'Phone and charger',
    'Camera and accessories',
    'Comfortable walking shoes',
    'Weather-appropriate clothing',
    'Toiletries and medications',
    'Sunscreen and sunglasses',
    'Reusable water bottle',
    'Day backpack',
    'Travel adapter',
  ];

  const interests = intake.interests.toLowerCase();

  if (interests.includes('hiking') || interests.includes('adventure')) {
    items.push('Hiking boots', 'Outdoor gear', 'First aid kit');
  }

  if (interests.includes('beach') || interests.includes('swimming')) {
    items.push('Swimwear', 'Beach towel', 'Flip-flops');
  }

  if (interests.includes('photography')) {
    items.push('Extra camera batteries', 'Memory cards', 'Tripod');
  }

  if (intake.travelStyle === 'luxury') {
    items.push('Formal attire', 'Dress shoes');
  }

  return items;
}

export function generateWeatherTips(intake: TripIntake): string {
  const destination = intake.destination;
  const season = intake.season?.toLowerCase() || '';

  let tips = `When visiting ${destination}, `;

  if (season.includes('summer') || season.includes('june') || season.includes('july') || season.includes('august')) {
    tips += 'expect warm to hot weather. Pack light, breathable clothing, sunscreen, and stay hydrated. Early mornings and evenings are best for outdoor activities.';
  } else if (season.includes('winter') || season.includes('december') || season.includes('january') || season.includes('february')) {
    tips += 'prepare for cooler temperatures. Bring layers, a warm jacket, and comfortable shoes. Check if any attractions have seasonal closures.';
  } else if (season.includes('spring') || season.includes('march') || season.includes('april') || season.includes('may')) {
    tips += 'enjoy pleasant weather with mild temperatures. Pack layers as temperatures can vary. This is often a great time for outdoor activities and sightseeing.';
  } else if (season.includes('fall') || season.includes('autumn') || season.includes('september') || season.includes('october') || season.includes('november')) {
    tips += 'experience comfortable temperatures perfect for exploring. Bring a light jacket for cooler evenings. This season often offers beautiful scenery and fewer crowds.';
  } else {
    tips += 'check the local weather forecast before your trip. Pack versatile clothing that can be layered, and always bring a light rain jacket just in case.';
  }

  tips += ` The best time to visit outdoor attractions is typically during daylight hours. Always check local weather updates during your stay.`;

  return tips;
}

export function generateDestinationSuggestions(intake: TripIntake): string[] {
  const suggestions: string[] = [];
  const destination = intake.destination;

  suggestions.push(`Explore the historic landmarks and cultural sites of ${destination}`);
  suggestions.push(`Try authentic local cuisine at traditional restaurants and street food markets`);
  suggestions.push(`Visit local markets and shops for unique souvenirs and handicrafts`);
  suggestions.push(`Take a guided walking tour to learn about the city's history and culture`);
  suggestions.push(`Experience the local nightlife and entertainment scene`);

  return suggestions;
}
