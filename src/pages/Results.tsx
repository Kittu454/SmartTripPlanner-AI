import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { TravelMap } from '@/components/TravelMap';
import { motion } from 'framer-motion';
import { 
  MapPin, Calendar, Wallet, Download, Save, 
  Clock, ArrowRight, Loader2, ChevronDown, ChevronUp,
  Lightbulb, Utensils, Bed, Bus, RefreshCw
} from 'lucide-react';
import { Itinerary, TravelPreferences, MapMarker } from '@/types/travel';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function Results() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedDays, setExpandedDays] = useState<number[]>([0]);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);

  useEffect(() => {
    const generateItinerary = async () => {
      const prefsStr = sessionStorage.getItem('travelPreferences');
      if (!prefsStr) {
        toast.error('No travel preferences found');
        navigate('/planner');
        return;
      }

      const preferences: TravelPreferences = JSON.parse(prefsStr);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-itinerary', {
          body: { preferences },
        });

        if (error) {
          throw error;
        }

        if (data.error) {
          throw new Error(data.error);
        }

        const generatedItinerary = data.itinerary;
        generatedItinerary.startDate = preferences.startDate;
        generatedItinerary.endDate = preferences.endDate;
        
        setItinerary(generatedItinerary);
        
        // Extract markers from itinerary
        const markers: MapMarker[] = [];
        let markerId = 0;
        
        generatedItinerary.days?.forEach((day: any) => {
          day.activities?.forEach((activity: any) => {
            if (activity.coordinates?.lat && activity.coordinates?.lng) {
              markers.push({
                id: `attraction-${markerId++}`,
                name: activity.name,
                type: 'attraction',
                coordinates: activity.coordinates,
                description: activity.description,
              });
            }
          });
          
          if (day.accommodation?.coordinates?.lat && day.accommodation?.coordinates?.lng) {
            markers.push({
              id: `hotel-${markerId++}`,
              name: day.accommodation.name,
              type: 'hotel',
              coordinates: day.accommodation.coordinates,
            });
          }
        });
        
        setMapMarkers(markers);
      } catch (error) {
        console.error('Error generating itinerary:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to generate itinerary');
      } finally {
        setLoading(false);
      }
    };

    generateItinerary();
  }, [navigate]);

  const toggleDay = (dayIndex: number) => {
    setExpandedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const handleSaveTrip = async () => {
    if (!user || !itinerary) return;
    
    setSaving(true);
    try {
      const prefsStr = sessionStorage.getItem('travelPreferences');
      const preferences: TravelPreferences = prefsStr ? JSON.parse(prefsStr) : {};

      const { error } = await supabase.from('trips').insert([{
        user_id: user.id,
        title: itinerary.title,
        destination: itinerary.destination,
        start_date: itinerary.startDate,
        end_date: itinerary.endDate,
        budget_level: preferences.budgetLevel || 'medium',
        starting_city: preferences.startingCity || '',
        interests: preferences.interests || [],
        travel_mode: preferences.travelMode || 'train',
        itinerary: JSON.parse(JSON.stringify(itinerary)),
      }]);

      if (error) throw error;
      toast.success('Trip saved to your profile!');
    } catch (error) {
      console.error('Error saving trip:', error);
      toast.error('Failed to save trip');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!itinerary) return;
    
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('itinerary-content');
      if (!element) return;

      const opt = {
        margin: 10,
        filename: `${itinerary.title.replace(/\s+/g, '-')}-itinerary.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      };

      await html2pdf().set(opt).from(element).save();
      toast.success('PDF downloaded!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-sunset flex items-center justify-center mx-auto mb-6 animate-pulse">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Generating Your Adventure</h2>
          <p className="text-muted-foreground mb-4">Our AI is crafting the perfect itinerary...</p>
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-28 text-center">
          <h2 className="font-display text-2xl font-bold mb-4">Something went wrong</h2>
          <Button onClick={() => navigate('/planner')}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-28 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2" id="itinerary-content">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
                {itinerary.title}
              </h1>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  {itinerary.destination}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-secondary" />
                  {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 text-accent-foreground" />
                  {itinerary.days?.length || 0} Days
                </div>
              </div>
              
              {itinerary.bestTimeToVisit && (
                <div className="mt-4 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                  <div className="flex items-center gap-2 text-sm">
                    <Lightbulb className="w-4 h-4 text-secondary" />
                    <span className="font-medium">Best time to visit:</span>
                    <span className="text-muted-foreground">{itinerary.bestTimeToVisit}</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Day-by-Day Itinerary */}
            <div className="space-y-4">
              {itinerary.days?.map((day, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl border border-border overflow-hidden"
                >
                  <button
                    onClick={() => toggleDay(index)}
                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex flex-col items-center justify-center">
                        <span className="text-xs font-medium">Day</span>
                        <span className="text-lg font-bold">{day.day}</span>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">
                          {new Date(day.date || itinerary.startDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {day.activities?.length || 0} activities planned
                        </div>
                      </div>
                    </div>
                    {expandedDays.includes(index) ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  
                  {expandedDays.includes(index) && (
                    <div className="px-4 pb-4 border-t border-border">
                      {/* Activities */}
                      <div className="mt-4 space-y-4">
                        {day.activities?.map((activity, actIndex) => (
                          <div key={actIndex} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                {activity.time}
                              </div>
                              {actIndex < (day.activities?.length || 0) - 1 && (
                                <div className="w-0.5 flex-1 bg-border mt-2" />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="font-medium">{activity.name}</div>
                              <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                              <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {activity.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {activity.duration}
                                </span>
                                {activity.cost > 0 && (
                                  <span className="flex items-center gap-1 text-primary font-medium">
                                    ₹{activity.cost}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Meals */}
                      {day.meals && day.meals.length > 0 && (
                        <div className="mt-6 p-4 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2 mb-3">
                            <Utensils className="w-4 h-4 text-primary" />
                            <span className="font-medium text-sm">Meals</span>
                          </div>
                          <div className="grid gap-2">
                            {day.meals.map((meal, mealIndex) => (
                              <div key={mealIndex} className="flex justify-between items-center text-sm">
                                <div>
                                  <span className="capitalize text-muted-foreground">{meal.type}:</span>
                                  <span className="ml-2">{meal.name} at {meal.place}</span>
                                </div>
                                <span className="text-primary font-medium">₹{meal.estimatedCost}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Accommodation */}
                      {day.accommodation && (
                        <div className="mt-4 p-4 rounded-lg bg-secondary/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Bed className="w-4 h-4 text-secondary" />
                            <span className="font-medium text-sm">Stay</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{day.accommodation.name}</div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {day.accommodation.type} • {day.accommodation.location}
                              </div>
                            </div>
                            <span className="text-secondary font-bold">₹{day.accommodation.cost}/night</span>
                          </div>
                        </div>
                      )}

                      {/* Daily Tips */}
                      {day.tips && day.tips.length > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-accent" />
                            <span className="font-medium text-sm">Tips for the day</span>
                          </div>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {day.tips.map((tip, tipIndex) => (
                              <li key={tipIndex}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Money Saving Tips */}
            {itinerary.moneyTips && itinerary.moneyTips.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20"
              >
                <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  Student Money-Saving Tips
                </h3>
                <ul className="space-y-2">
                  {itinerary.moneyTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-primary">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button variant="hero" onClick={handleSaveTrip} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Trip
              </Button>
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <Button variant="ghost" onClick={() => navigate('/planner')}>
                <RefreshCw className="w-4 h-4" />
                Plan New Trip
              </Button>
            </div>

            {/* Budget Breakdown */}
            {itinerary.budgetBreakdown && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card rounded-xl border border-border p-6"
              >
                <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  Budget Breakdown
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Travel', value: itinerary.budgetBreakdown.travel, icon: Bus },
                    { label: 'Accommodation', value: itinerary.budgetBreakdown.accommodation, icon: Bed },
                    { label: 'Food', value: itinerary.budgetBreakdown.food, icon: Utensils },
                    { label: 'Activities', value: itinerary.budgetBreakdown.activities, icon: MapPin },
                    { label: 'Miscellaneous', value: itinerary.budgetBreakdown.miscellaneous, icon: Wallet },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </div>
                      <span className="font-medium">₹{item.value?.toLocaleString() || 0}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-xl text-primary">
                        ₹{itinerary.budgetBreakdown.total?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Map */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="p-4 border-b border-border">
                <h3 className="font-display text-lg font-bold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Trip Map
                </h3>
              </div>
              <TravelMap markers={mapMarkers} className="h-80" />
            </motion.div>

            {/* Travel Routes */}
            {itinerary.travelRoutes && itinerary.travelRoutes.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card rounded-xl border border-border p-6"
              >
                <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                  <Bus className="w-5 h-5 text-secondary" />
                  Travel Routes
                </h3>
                <div className="space-y-4">
                  {itinerary.travelRoutes.map((route, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2 text-sm font-medium mb-1">
                        {route.from} <ArrowRight className="w-4 h-4" /> {route.to}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {route.mode} • {route.duration} • ₹{route.estimatedCost}
                      </div>
                      {route.recommendation && (
                        <div className="text-xs text-primary mt-1">{route.recommendation}</div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
