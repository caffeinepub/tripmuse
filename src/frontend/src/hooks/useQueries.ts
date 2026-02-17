import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  UserProfile,
  TripPlan,
  ToDo,
  EmergencyContact,
  BudgetEstimate,
  CostAssumptions,
  Currency,
  Accommodation,
  MustVisitPlace,
  FoodRecommendation,
  LocalTransportOption,
} from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetInrCurrency() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Currency>({
    queryKey: ['inrCurrency'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getInrCurrency();
    },
    enabled: !!actor && !actorFetching,
    staleTime: Infinity,
  });
}

export function useCreateTripPlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: {
      title: string;
      destination: string;
      startDate: bigint;
      endDate: bigint;
      itinerary: TripPlan['itinerary'];
      budget: BudgetEstimate;
      costAssumptions: CostAssumptions;
      currency: Currency;
      accommodations: Accommodation[];
      mustVisitPlaces: MustVisitPlace[];
      foodRecommendations: FoodRecommendation[];
      localTransportOptions: LocalTransportOption[];
      totalFoodBudget: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTripPlan(
        plan.title,
        plan.destination,
        plan.startDate,
        plan.endDate,
        plan.itinerary,
        plan.budget,
        plan.costAssumptions,
        plan.currency,
        plan.accommodations,
        plan.mustVisitPlaces,
        plan.foodRecommendations,
        plan.localTransportOptions,
        plan.totalFoodBudget
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tripPlans'] });
    },
  });
}

export function useGetAllTripPlans() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TripPlan[]>({
    queryKey: ['tripPlans'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTripPlans();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetTripPlan(tripId: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TripPlan>({
    queryKey: ['tripPlan', tripId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTripPlan(tripId);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useDeleteTripPlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tripId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTripPlan(tripId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tripPlans'] });
    },
  });
}

export function useAddTripToDos() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, todos }: { tripId: bigint; todos: ToDo[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTripToDos(tripId, todos);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tripPlan', variables.tripId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['tripPlans'] });
    },
  });
}

export function useMarkToDoCompleted() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, toDoIndex }: { tripId: bigint; toDoIndex: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markToDoCompleted(tripId, toDoIndex);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tripPlan', variables.tripId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['tripPlans'] });
    },
  });
}

export function useAddTripEmergencyInfo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, emergencyInfo }: { tripId: bigint; emergencyInfo: EmergencyContact[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTripEmergencyInfo(tripId, emergencyInfo);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tripPlan', variables.tripId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['tripPlans'] });
    },
  });
}

export function useUpdateBudgetEstimates() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tripId,
      budget,
      costAssumptions,
    }: {
      tripId: bigint;
      budget: BudgetEstimate;
      costAssumptions: CostAssumptions;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBudgetEstimates(tripId, budget, costAssumptions);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tripPlan', variables.tripId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['tripPlans'] });
    },
  });
}
