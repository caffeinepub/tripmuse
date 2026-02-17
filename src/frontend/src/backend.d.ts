import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CostAssumptions {
    hotelLevel: string;
    dailyFoodBudget: number;
    transportType: string;
}
export interface MustVisitPlace {
    name: string;
    type: PlaceType;
    description: string;
}
export type Time = bigint;
export interface LocalTransportOption {
    type: TransportType;
    currency: Currency;
    price: number;
}
export interface EmergencyContact {
    name: string;
    type: string;
    phone: string;
}
export interface Currency {
    code: string;
    exchangeRate: number;
    symbol: string;
}
export interface BudgetEstimate {
    total: number;
    food: number;
    transport: number;
    stay: number;
    attractions: number;
}
export interface TripPlan {
    id: bigint;
    title: string;
    destination: string;
    toDos: Array<ToDo>;
    endDate: Time;
    mustVisitPlaces: Array<MustVisitPlace>;
    foodRecommendations: Array<FoodRecommendation>;
    currency: Currency;
    accommodations: Array<Accommodation>;
    costAssumptions: CostAssumptions;
    emergencyInfo: Array<EmergencyContact>;
    localTransportOptions: Array<LocalTransportOption>;
    budget: BudgetEstimate;
    totalFoodBudget: number;
    itinerary: Array<ItineraryDay>;
    startDate: Time;
}
export interface FoodRecommendation {
    name: string;
    type: FoodType;
    description: string;
    budgetLevel: string;
    imageUrl?: string;
    popularity: bigint;
}
export interface ItineraryDay {
    date: Time;
    activities: Array<string>;
}
export interface Accommodation {
    pricePerNight: number;
    name: string;
    type: AccommodationType;
    location: string;
}
export interface ToDo {
    title: string;
    completed: boolean;
    dueDate?: Time;
    notes: string;
}
export interface UserProfile {
    name: string;
}
export enum AccommodationType {
    hotel = "hotel",
    other = "other",
    apartment = "apartment",
    hostel = "hostel"
}
export enum FoodType {
    veg = "veg",
    nonVeg = "nonVeg",
    other = "other"
}
export enum PlaceType {
    other = "other",
    cultural = "cultural",
    historical = "historical",
    natural = "natural"
}
export enum TransportType {
    metro = "metro",
    train = "train",
    carRentals = "carRentals",
    other = "other",
    publicBus = "publicBus",
    bikeRentals = "bikeRentals",
    taxi = "taxi",
    autoRikshaw = "autoRikshaw",
    taxiService = "taxiService",
    ferry = "ferry"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAccommodations(tripId: bigint, accommodations: Array<Accommodation>): Promise<void>;
    addFoodRecommendations(tripId: bigint, recommendations: Array<FoodRecommendation>): Promise<void>;
    addLocalTransportOptions(tripId: bigint, options: Array<LocalTransportOption>): Promise<void>;
    addMustVisitPlaces(tripId: bigint, places: Array<MustVisitPlace>): Promise<void>;
    addTripEmergencyInfo(tripId: bigint, emergencyInfo: Array<EmergencyContact>): Promise<void>;
    addTripToDos(tripId: bigint, todos: Array<ToDo>): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    convertTripCurrenciesToInr(tripId: bigint): Promise<void>;
    createTripPlan(title: string, destination: string, startDate: Time, endDate: Time, itinerary: Array<ItineraryDay>, budget: BudgetEstimate, costAssumptions: CostAssumptions, currency: Currency, accommodations: Array<Accommodation>, mustVisitPlaces: Array<MustVisitPlace>, foodRecommendations: Array<FoodRecommendation>, localTransportOptions: Array<LocalTransportOption>, totalFoodBudget: number): Promise<bigint>;
    deleteTripPlan(tripId: bigint): Promise<void>;
    getAllTripPlans(): Promise<Array<TripPlan>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInrCurrency(): Promise<Currency>;
    getTripPlan(tripId: bigint): Promise<TripPlan>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markToDoCompleted(tripId: bigint, toDoIndex: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateBudgetEstimates(tripId: bigint, budget: BudgetEstimate, costAssumptions: CostAssumptions): Promise<void>;
}
