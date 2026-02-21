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
        // FIX: Ensure the function name is lowercase and matches your dashboard exactly
        const { data, error } = await supabase.functions.invoke('generate-itinerary', {
          body: { preferences },
        });

        if (error) {
          // If this triggers a 404, the function isn't deployed or named correctly
          throw new Error(`Edge Function Error: ${error.message}`);
        }

        if (!data || data.error) {
          throw new Error(data?.error || 'No data received from AI');
        }

        const generatedItinerary = data.itinerary;
        // Inject dates from preferences if AI didn't return them
        generatedItinerary.startDate = generatedItinerary.startDate || preferences.startDate;
        generatedItinerary.endDate = generatedItinerary.endDate || preferences.endDate;
        
        setItinerary(generatedItinerary);
        
        // SAFE PARSING: Extract markers with checks to prevent crashes
        const markers: MapMarker[] = [];
        generatedItinerary.days?.forEach((day: any, dIdx: number) => {
          day.activities?.forEach((activity: any, aIdx: number) => {
            if (activity?.coordinates?.lat && activity?.coordinates?.lng) {
              markers.push({
                id: `act-${dIdx}-${aIdx}`,
                name: activity.name || 'Activity',
                type: 'attraction',
                coordinates: activity.coordinates,
                description: activity.description,
              });
            }
          });
          
          if (day.accommodation?.coordinates?.lat && day.accommodation?.coordinates?.lng) {
            markers.push({
              id: `hotel-${dIdx}`,
              name: day.accommodation.name || 'Hotel',
              type: 'hotel',
              coordinates: day.accommodation.coordinates,
            });
          }
        });
        
        setMapMarkers(markers);
      } catch (error: any) {
        console.error('Error generating itinerary:', error);
        toast.error(error.message || 'Failed to generate itinerary');
        // Option: navigate('/planner') if you want to force them back on error
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
    if (!user || !itinerary) {
        toast.error("Please log in to save your trip");
        return;
    }
    
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
      toast.error('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Generating Your Adventure</h2>
          <p className="text-muted-foreground mb-4">Our AI is crafting the perfect itinerary...</p>
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Navbar />
        <h2 className="text-2xl font-bold mb-4">Itinerary could not be loaded</h2>
        <Button onClick={() => navigate('/planner')}>Go Back to Planner</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2" id="itinerary-content">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{itinerary.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />{itinerary.destination}</span>
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-secondary" />{new Date(itinerary.startDate).toLocaleDateString()}</span>
                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" />{itinerary.days?.length || 0} Days</span>
              </div>
            </div>

            <div className="space-y-4">
              {itinerary.days?.map((day, index) => (
                <div key={index} className="bg-card rounded-xl border border-border overflow-hidden">
                  <button onClick={() => toggleDay(index)} className="w-full p-4 flex items-center justify-between hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex flex-col items-center justify-center">
                        <span className="text-[10px]">Day</span>
                        <span className="text-sm font-bold">{day.day}</span>
                      </div>
                      <span className="font-semibold">Day {day.day} Itinerary</span>
                    </div>
                    {expandedDays.includes(index) ? <ChevronUp /> : <ChevronDown />}
                  </button>
                  
                  {expandedDays.includes(index) && (
                    <div className="p-4 border-t border-border space-y-4">
                      {day.activities?.map((act: any, i: number) => (
                        <div key={i} className="flex gap-3 text-sm">
                          <div className="text-primary font-bold min-w-[60px]">{act.time}</div>
                          <div>
                            <div className="font-medium">{act.name}</div>
                            <div className="text-muted-foreground">{act.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-3">
              <Button onClick={handleSaveTrip} disabled={saving} className="w-full">
                {saving ? <Loader2 className="animate-spin" /> : <Save className="mr-2 w-4 h-4" />} Save Trip
              </Button>
              <Button variant="outline" onClick={handleDownloadPDF} className="w-full">
                <Download className="mr-2 w-4 h-4" /> Download PDF
              </Button>
            </div>

            {itinerary.budgetBreakdown && (
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" /> Budget</h3>
                <div className="text-2xl font-bold text-primary mb-4">₹{itinerary.budgetBreakdown.total?.toLocaleString()}</div>
                <div className="space-y-2 text-sm">
                   <div className="flex justify-between"><span>Food</span><span>₹{itinerary.budgetBreakdown.food}</span></div>
                   <div className="flex justify-between"><span>Stay</span><span>₹{itinerary.budgetBreakdown.accommodation}</span></div>
                   <div className="flex justify-between"><span>Travel</span><span>₹{itinerary.budgetBreakdown.travel}</span></div>
                </div>
              </div>
            )}

            <div className="bg-card rounded-xl border border-border overflow-hidden h-80">
              <TravelMap markers={mapMarkers} className="h-full w-full" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}