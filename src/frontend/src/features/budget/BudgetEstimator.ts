import type { CostAssumptions, BudgetEstimate } from '../../backend';

// All costs are in INR
const HOTEL_COSTS: Record<string, number> = {
  budget: 3000,      // ₹3,000/night (~$40)
  'mid-range': 7500, // ₹7,500/night (~$100)
  upscale: 15000,    // ₹15,000/night (~$200)
  luxury: 30000,     // ₹30,000/night (~$400)
};

const TRANSPORT_COSTS: Record<string, number> = {
  public: 750,  // ₹750/day (~$10)
  rental: 3750, // ₹3,750/day (~$50)
  taxi: 3000,   // ₹3,000/day (~$40)
  mixed: 2250,  // ₹2,250/day (~$30)
};

export function calculateBudget(
  days: number,
  assumptions: CostAssumptions
): { budget: BudgetEstimate; costAssumptions: CostAssumptions } {
  const hotelCostPerNight = HOTEL_COSTS[assumptions.hotelLevel] || HOTEL_COSTS['mid-range'];
  const transportCostPerDay = TRANSPORT_COSTS[assumptions.transportType] || TRANSPORT_COSTS.mixed;

  const stay = hotelCostPerNight * days;
  const food = assumptions.dailyFoodBudget * days;
  const transport = transportCostPerDay * days;
  const attractions = days * 1500; // ₹1,500/day for attractions (~$20)

  const total = stay + food + transport + attractions;

  return {
    budget: {
      total,
      stay,
      food,
      transport,
      attractions,
    },
    costAssumptions: assumptions,
  };
}

export function getHotelCostPerNight(hotelLevel: string): number {
  return HOTEL_COSTS[hotelLevel] || HOTEL_COSTS['mid-range'];
}

export function getTransportCostPerDay(transportType: string): number {
  return TRANSPORT_COSTS[transportType] || TRANSPORT_COSTS.mixed;
}
