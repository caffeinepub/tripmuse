import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

import Float "mo:core/Float";


actor {
  type TripPlan = {
    id : Nat;
    title : Text;
    destination : Text;
    startDate : Time.Time;
    endDate : Time.Time;
    itinerary : [ItineraryDay];
    budget : BudgetEstimate;
    toDos : [ToDo];
    emergencyInfo : [EmergencyContact];
    costAssumptions : CostAssumptions;
    currency : Currency;
    accommodations : [Accommodation];
    mustVisitPlaces : [MustVisitPlace];
    foodRecommendations : [FoodRecommendation];
    localTransportOptions : [LocalTransportOption];
    totalFoodBudget : Float;
  };

  type ItineraryDay = {
    date : Time.Time;
    activities : [Text];
  };

  type BudgetEstimate = {
    total : Float;
    stay : Float;
    food : Float;
    transport : Float;
    attractions : Float;
  };

  type ToDo = {
    title : Text;
    notes : Text;
    dueDate : ?Time.Time;
    completed : Bool;
  };

  type EmergencyContact = {
    name : Text;
    phone : Text;
    type_ : Text;
  };

  type CostAssumptions = {
    dailyFoodBudget : Float;
    hotelLevel : Text;
    transportType : Text;
  };

  type Currency = {
    code : Text;
    symbol : Text;
    exchangeRate : Float;
  };

  type Accommodation = {
    name : Text;
    location : Text;
    pricePerNight : Float;
    type_ : AccommodationType;
  };

  type AccommodationType = {
    #hotel;
    #hostel;
    #apartment;
    #other;
  };

  type MustVisitPlace = {
    name : Text;
    description : Text;
    type_ : PlaceType;
  };

  type PlaceType = {
    #historical;
    #natural;
    #cultural;
    #other;
  };

  type FoodRecommendation = {
    name : Text;
    description : Text;
    type_ : FoodType;
    imageUrl : ?Text;
    budgetLevel : Text;
    popularity : Int;
  };

  type FoodType = {
    #veg;
    #nonVeg;
    #other;
  };

  type LocalTransportOption = {
    type_ : TransportType;
    price : Float;
    currency : Currency;
  };

  type TransportType = {
    #autoRikshaw;
    #taxi;
    #taxiService;
    #publicBus;
    #metro;
    #train;
    #ferry;
    #bikeRentals;
    #carRentals;
    #other;
  };

  public type UserProfile = {
    name : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module TripPlan {
    public func compare(plan1 : TripPlan, plan2 : TripPlan) : Order.Order {
      Nat.compare(plan1.id, plan2.id);
    };
  };

  var nextTripId = 0;
  let userProfiles = Map.empty<Principal, UserProfile>();
  let tripPlans = Map.empty<Principal, List.List<TripPlan>>();
  let inrCurrency : Currency = {
    code = "INR";
    symbol = "₹";
    exchangeRate = 1.0;
  };

  func getNextTripId() : Nat {
    let id = nextTripId;
    nextTripId += 1;
    id;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createTripPlan(
    title : Text,
    destination : Text,
    startDate : Time.Time,
    endDate : Time.Time,
    itinerary : [ItineraryDay],
    budget : BudgetEstimate,
    costAssumptions : CostAssumptions,
    currency : Currency,
    accommodations : [Accommodation],
    mustVisitPlaces : [MustVisitPlace],
    foodRecommendations : [FoodRecommendation],
    localTransportOptions : [LocalTransportOption],
    totalFoodBudget : Float,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create trip plans");
    };

    let tripId = getNextTripId();
    let tripPlan : TripPlan = {
      id = tripId;
      title;
      destination;
      startDate;
      endDate;
      itinerary;
      budget;
      toDos = [];
      emergencyInfo = [];
      costAssumptions;
      currency;
      accommodations;
      mustVisitPlaces;
      foodRecommendations;
      localTransportOptions;
      totalFoodBudget;
    };

    let currentTrips = switch (tripPlans.get(caller)) {
      case (null) { List.empty<TripPlan>() };
      case (?existingTrips) { existingTrips };
    };
    currentTrips.add(tripPlan);
    tripPlans.add(caller, currentTrips);

    tripId;
  };

  public shared ({ caller }) func addTripToDos(tripId : Nat, todos : [ToDo]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add todos");
    };

    let updated = switch (tripPlans.get(caller)) {
      case (null) { false };
      case (?trips) {
        var found = false;
        let updatedTrips = trips.map<TripPlan, TripPlan>(
          func(trip) {
            if (trip.id == tripId) {
              found := true;
              {
                trip with toDos = todos;
              };
            } else {
              trip;
            };
          }
        );
        if (found) {
          tripPlans.add(caller, updatedTrips);
        };
        found;
      };
    };

    if (not updated) {
      Runtime.trap("Trip not found or unauthorized");
    };
  };

  public shared ({ caller }) func addTripEmergencyInfo(tripId : Nat, emergencyInfo : [EmergencyContact]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add emergency info");
    };

    let updated = switch (tripPlans.get(caller)) {
      case (null) { false };
      case (?trips) {
        var found = false;
        let updatedTrips = trips.map<TripPlan, TripPlan>(
          func(trip) {
            if (trip.id == tripId) {
              found := true;
              {
                trip with emergencyInfo;
              };
            } else {
              trip;
            };
          }
        );
        if (found) {
          tripPlans.add(caller, updatedTrips);
        };
        found;
      };
    };

    if (not updated) {
      Runtime.trap("Trip not found or unauthorized");
    };
  };

  public shared ({ caller }) func updateBudgetEstimates(tripId : Nat, budget : BudgetEstimate, costAssumptions : CostAssumptions) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update budget estimates");
    };

    let updated = switch (tripPlans.get(caller)) {
      case (null) { false };
      case (?trips) {
        var found = false;
        let updatedTrips = trips.map<TripPlan, TripPlan>(
          func(trip) {
            if (trip.id == tripId) {
              found := true;
              {
                trip with budget;
                costAssumptions;
              };
            } else {
              trip;
            };
          }
        );
        if (found) {
          tripPlans.add(caller, updatedTrips);
        };
        found;
      };
    };

    if (not updated) {
      Runtime.trap("Trip not found or unauthorized");
    };
  };

  public shared ({ caller }) func addAccommodations(tripId : Nat, accommodations : [Accommodation]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add accommodations");
    };

    let updated = switch (tripPlans.get(caller)) {
      case (null) { false };
      case (?trips) {
        var found = false;
        let updatedTrips = trips.map<TripPlan, TripPlan>(
          func(trip) {
            if (trip.id == tripId) {
              found := true;
              {
                trip with accommodations;
              };
            } else {
              trip;
            };
          }
        );
        if (found) {
          tripPlans.add(caller, updatedTrips);
        };
        found;
      };
    };

    if (not updated) {
      Runtime.trap("Trip not found or unauthorized");
    };
  };

  public shared ({ caller }) func addMustVisitPlaces(tripId : Nat, places : [MustVisitPlace]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add must-visit places");
    };

    let updated = switch (tripPlans.get(caller)) {
      case (null) { false };
      case (?trips) {
        var found = false;
        let updatedTrips = trips.map<TripPlan, TripPlan>(
          func(trip) {
            if (trip.id == tripId) {
              found := true;
              {
                trip with mustVisitPlaces = places;
              };
            } else {
              trip;
            };
          }
        );
        if (found) {
          tripPlans.add(caller, updatedTrips);
        };
        found;
      };
    };

    if (not updated) {
      Runtime.trap("Trip not found or unauthorized");
    };
  };

  public shared ({ caller }) func addFoodRecommendations(tripId : Nat, recommendations : [FoodRecommendation]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add food recommendations");
    };

    let updated = switch (tripPlans.get(caller)) {
      case (null) { false };
      case (?trips) {
        var found = false;
        let updatedTrips = trips.map<TripPlan, TripPlan>(
          func(trip) {
            if (trip.id == tripId) {
              found := true;
              {
                trip with foodRecommendations = recommendations;
              };
            } else {
              trip;
            };
          }
        );
        if (found) {
          tripPlans.add(caller, updatedTrips);
        };
        found;
      };
    };

    if (not updated) {
      Runtime.trap("Trip not found or unauthorized");
    };
  };

  public shared ({ caller }) func addLocalTransportOptions(tripId : Nat, options : [LocalTransportOption]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add local transport options");
    };

    let updated = switch (tripPlans.get(caller)) {
      case (null) { false };
      case (?trips) {
        var found = false;
        let updatedTrips = trips.map<TripPlan, TripPlan>(
          func(trip) {
            if (trip.id == tripId) {
              found := true;
              {
                trip with localTransportOptions = options;
              };
            } else {
              trip;
            };
          }
        );
        if (found) {
          tripPlans.add(caller, updatedTrips);
        };
        found;
      };
    };

    if (not updated) {
      Runtime.trap("Trip not found or unauthorized");
    };
  };

  public shared ({ caller }) func markToDoCompleted(tripId : Nat, toDoIndex : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark todos as completed");
    };

    let updated = switch (tripPlans.get(caller)) {
      case (null) { false };
      case (?trips) {
        var found = false;
        let updatedTrips = trips.map<TripPlan, TripPlan>(
          func(trip) {
            if (trip.id == tripId) {
              found := true;
              let todosList = List.fromArray<ToDo>(trip.toDos);
              if (toDoIndex < todosList.size()) {
                let todosArray = trip.toDos.toVarArray<ToDo>();
                if (toDoIndex < todosArray.size()) {
                  todosArray[toDoIndex] := {
                    todosArray[toDoIndex] with completed = true;
                  };
                  {
                    trip with toDos = todosArray.toArray();
                  };
                } else {
                  trip;
                };
              } else {
                trip;
              };
            } else {
              trip;
            };
          }
        );
        if (found) {
          tripPlans.add(caller, updatedTrips);
        };
        found;
      };
    };

    if (not updated) {
      Runtime.trap("Trip not found or to-do out of range");
    };
  };

  public shared ({ caller }) func deleteTripPlan(tripId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete trip plans");
    };

    switch (tripPlans.get(caller)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?trips) {
        let updatedTrips = trips.filter(func(trip) { trip.id != tripId });
        tripPlans.add(caller, updatedTrips);
      };
    };
  };

  public query ({ caller }) func getTripPlan(tripId : Nat) : async TripPlan {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trip plans");
    };

    switch (tripPlans.get(caller)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?trips) {
        switch (trips.values().find(func(t) { t.id == tripId })) {
          case (null) { Runtime.trap("Trip not found") };
          case (?trip) { trip };
        };
      };
    };
  };

  public query ({ caller }) func getAllTripPlans() : async [TripPlan] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trip plans");
    };

    switch (tripPlans.get(caller)) {
      case (null) { [] };
      case (?trips) {
        trips.toArray();
      };
    };
  };

  public func getInrCurrency() : async Currency {
    inrCurrency;
  };

  func convertToInr(amount : Float, currency : Currency) : Float {
    amount * currency.exchangeRate;
  };

  func convertTripToInr(trip : TripPlan) : TripPlan {
    {
      trip with
      budget = {
        trip.budget with
        total = convertToInr(trip.budget.total, trip.currency);
        stay = convertToInr(trip.budget.stay, trip.currency);
        food = convertToInr(trip.budget.food, trip.currency);
        transport = convertToInr(trip.budget.transport, trip.currency);
        attractions = convertToInr(trip.budget.attractions, trip.currency);
      };
      currency = inrCurrency;
      accommodations = trip.accommodations.map(func(acc) { { acc with pricePerNight = convertToInr(acc.pricePerNight, trip.currency) } });
      mustVisitPlaces = trip.mustVisitPlaces;
      foodRecommendations = trip.foodRecommendations;
      localTransportOptions = trip.localTransportOptions.map(
        func(opt) {
          { opt with price = convertToInr(opt.price, trip.currency) };
        }
      );
      totalFoodBudget = convertToInr(trip.totalFoodBudget, trip.currency);
    };
  };

  public shared ({ caller }) func convertTripCurrenciesToInr(tripId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can convert trip currencies");
    };

    let updated = switch (tripPlans.get(caller)) {
      case (null) { false };
      case (?trips) {
        var found = false;
        let updatedTrips = trips.map<TripPlan, TripPlan>(
          func(trip) {
            if (trip.id == tripId) {
              found := true;
              convertTripToInr(trip);
            } else {
              trip;
            };
          }
        );
        if (found) {
          tripPlans.add(caller, updatedTrips);
        };
        found;
      };
    };

    if (not updated) {
      Runtime.trap("Trip not found or unauthorized");
    };
  };
};

