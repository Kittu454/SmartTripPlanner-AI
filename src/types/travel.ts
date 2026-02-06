export interface TravelPreferences {
  destination: string;
  startingCity: string;
  startDate: string;
  endDate: string;
  budgetLevel: 'low' | 'medium' | 'high';
  interests: string[];
  travelMode: 'bus' | 'train' | 'flight' | 'mixed';
}

export interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
  meals: Meal[];
  accommodation: Accommodation | null;
  tips: string[];
}

export interface Activity {
  time: string;
  name: string;
  description: string;
  location: string;
  cost: number;
  duration: string;
  coordinates?: { lat: number; lng: number };
}

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  place: string;
  estimatedCost: number;
  recommendation?: string;
}

export interface Accommodation {
  name: string;
  type: 'hostel' | 'hotel' | 'homestay' | 'airbnb';
  cost: number;
  location: string;
  coordinates?: { lat: number; lng: number };
}

export interface BudgetBreakdown {
  travel: number;
  accommodation: number;
  food: number;
  activities: number;
  miscellaneous: number;
  total: number;
}

export interface Itinerary {
  id?: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: DayPlan[];
  budgetBreakdown: BudgetBreakdown;
  moneyTips: string[];
  bestTimeToVisit: string;
  travelRoutes: TravelRoute[];
}

export interface TravelRoute {
  from: string;
  to: string;
  mode: string;
  duration: string;
  estimatedCost: number;
  recommendation: string;
}

export interface MapMarker {
  id: string;
  name: string;
  type: 'attraction' | 'restaurant' | 'hotel' | 'transport';
  coordinates: { lat: number; lng: number };
  description?: string;
}
