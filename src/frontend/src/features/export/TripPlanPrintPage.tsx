import { useParams } from '@tanstack/react-router';
import { useGetTripPlan } from '../../hooks/useQueries';
import { formatINR } from '../../utils/currency';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { generatePackingList, generateWeatherTips } from '../trips/TripPlanGenerator';

export default function TripPlanPrintPage() {
  const { tripId } = useParams({ from: '/trip/$tripId/print' });
  const { data: trip, isLoading } = useGetTripPlan(BigInt(tripId));
  const navigate = useNavigate();

  if (isLoading || !trip) {
    return <div className="p-8">Loading...</div>;
  }

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="print:hidden mb-6 flex gap-3">
        <Button variant="outline" onClick={() => navigate({ to: '/trip/$tripId', params: { tripId: tripId } })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handlePrint} className="gap-2 shadow-md">
          <Printer className="w-4 h-4" />
          Print / Save as PDF
        </Button>
      </div>

      <div className="print-content bg-white text-black p-8 md:p-12 max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{trip.title}</h1>
          <p className="text-xl md:text-2xl text-gray-600">
            {trip.destination} • {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </p>
        </div>

        <section className="mb-10 page-break-inside-avoid">
          <h2 className="text-2xl md:text-3xl font-bold mb-5 pb-3 border-b-2 border-gray-300">📅 Itinerary</h2>
          {trip.itinerary.map((day, index) => {
            const dayDate = new Date(Number(day.date) / 1_000_000);
            return (
              <div key={index} className="mb-7 page-break-inside-avoid">
                <h3 className="text-lg md:text-xl font-semibold mb-3">
                  Day {index + 1} - {dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  {day.activities.map((activity, actIndex) => (
                    <li key={actIndex} className="text-gray-700 leading-relaxed">{activity}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>

        {trip.accommodations.length > 0 && (
          <section className="mb-10 page-break-inside-avoid">
            <h2 className="text-2xl md:text-3xl font-bold mb-5 pb-3 border-b-2 border-gray-300">🏨 Accommodations</h2>
            <div className="space-y-4">
              {trip.accommodations.map((accommodation, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="font-semibold text-lg">{accommodation.name}</p>
                  <p className="text-sm text-gray-600 mb-1">{accommodation.location}</p>
                  <p className="font-medium">{formatINR(accommodation.pricePerNight)}/night • {accommodation.type}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {trip.mustVisitPlaces.length > 0 && (
          <section className="mb-10 page-break-inside-avoid">
            <h2 className="text-2xl md:text-3xl font-bold mb-5 pb-3 border-b-2 border-gray-300">🎯 Must-Visit Places</h2>
            <div className="space-y-4">
              {trip.mustVisitPlaces.map((place, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                  <p className="font-semibold text-lg">{place.name}</p>
                  <p className="text-sm text-gray-600 mb-1 capitalize">{place.type}</p>
                  <p className="text-gray-700">{place.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {trip.foodRecommendations.length > 0 && (
          <section className="mb-10 page-break-inside-avoid">
            <h2 className="text-2xl md:text-3xl font-bold mb-5 pb-3 border-b-2 border-gray-300">🍽️ Food Recommendations</h2>
            <div className="space-y-4">
              {trip.foodRecommendations.map((food, index) => (
                <div key={index} className="border-l-4 border-orange-500 pl-4 py-2">
                  <p className="font-semibold text-lg">{food.name}</p>
                  <p className="text-sm text-gray-600 mb-1">{food.budgetLevel} • {food.type}</p>
                  <p className="text-gray-700">{food.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-10 page-break-inside-avoid">
          <h2 className="text-2xl md:text-3xl font-bold mb-5 pb-3 border-b-2 border-gray-300">💰 Budget</h2>
          <div className="space-y-3 text-base">
            <div className="flex justify-between py-2">
              <span className="font-medium">Accommodation:</span>
              <span className="font-semibold">{formatINR(trip.budget.stay)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium">Food:</span>
              <span className="font-semibold">{formatINR(trip.budget.food)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium">Transportation:</span>
              <span className="font-semibold">{formatINR(trip.budget.transport)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium">Attractions:</span>
              <span className="font-semibold">{formatINR(trip.budget.attractions)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t-2 border-gray-300 pt-3 mt-3">
              <span>Total:</span>
              <span>{formatINR(trip.budget.total)}</span>
            </div>
          </div>
        </section>

        <section className="mb-10 page-break-inside-avoid">
          <h2 className="text-2xl md:text-3xl font-bold mb-5 pb-3 border-b-2 border-gray-300">🧳 Packing List</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {packingList.map((item, index) => (
              <li key={index} className="flex items-center gap-3">
                <span className="text-lg">☐</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10 page-break-inside-avoid">
          <h2 className="text-2xl md:text-3xl font-bold mb-5 pb-3 border-b-2 border-gray-300">✅ To-Do List</h2>
          {trip.toDos.length === 0 ? (
            <p className="text-gray-600">No tasks added yet</p>
          ) : (
            <ul className="space-y-3">
              {trip.toDos.map((todo, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-lg">{todo.completed ? '☑' : '☐'}</span>
                  <div>
                    <span className={todo.completed ? 'line-through text-gray-500' : ''}>{todo.title}</span>
                    {todo.notes && <p className="text-sm text-gray-600 mt-1">{todo.notes}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mb-10 page-break-inside-avoid">
          <h2 className="text-2xl md:text-3xl font-bold mb-5 pb-3 border-b-2 border-gray-300">🚨 Emergency Contacts</h2>
          {trip.emergencyInfo.length === 0 ? (
            <p className="text-gray-600">No emergency contacts added yet</p>
          ) : (
            <div className="grid gap-4">
              {trip.emergencyInfo.map((contact, index) => (
                <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                  <p className="font-semibold text-lg">{contact.name}</p>
                  <p className="text-sm text-gray-600 mb-1">{contact.type}</p>
                  <p className="font-mono text-base">{contact.phone}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-10 page-break-inside-avoid">
          <h2 className="text-2xl md:text-3xl font-bold mb-5 pb-3 border-b-2 border-gray-300">🌦️ Weather Tips</h2>
          <p className="text-gray-700 leading-relaxed">{weatherTips}</p>
        </section>
      </div>
    </>
  );
}
