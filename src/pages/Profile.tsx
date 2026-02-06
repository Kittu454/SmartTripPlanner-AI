import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/Navbar';
import { motion } from 'framer-motion';
import { 
  User, Mail, Calendar, MapPin, Trash2, 
  ExternalLink, Loader2, Edit2, Check, X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Trip = Tables<'trips'>;

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchProfile();
      fetchTrips();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setNewUsername(data.username || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchTrips = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUsername = async () => {
    if (!user || !newUsername.trim()) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername.trim() })
        .eq('user_id', user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, username: newUsername.trim() } : null);
      setEditingUsername(false);
      toast.success('Username updated!');
    } catch (error) {
      console.error('Error updating username:', error);
      toast.error('Failed to update username');
    }
  };

  const deleteTrip = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

      if (error) throw error;
      
      setTrips(prev => prev.filter(t => t.id !== tripId));
      toast.success('Trip deleted');
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Failed to delete trip');
    }
  };

  const viewTrip = (trip: Trip) => {
    // Store the itinerary and navigate to results
    if (trip.itinerary) {
      sessionStorage.setItem('travelPreferences', JSON.stringify({
        destination: trip.destination,
        startingCity: trip.starting_city,
        startDate: trip.start_date,
        endDate: trip.end_date,
        budgetLevel: trip.budget_level,
        interests: trip.interests,
        travelMode: trip.travel_mode,
      }));
      
      // Store the itinerary directly
      const itinerary = trip.itinerary as any;
      itinerary.startDate = trip.start_date;
      itinerary.endDate = trip.end_date;
      sessionStorage.setItem('savedItinerary', JSON.stringify(itinerary));
    }
    navigate('/results');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-28 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-sunset flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  {editingUsername ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="w-48"
                        placeholder="Username"
                      />
                      <Button size="icon" variant="ghost" onClick={updateUsername}>
                        <Check className="w-4 h-4 text-secondary" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingUsername(false)}>
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h1 className="font-display text-2xl font-bold">
                        {profile?.username || 'Traveler'}
                      </h1>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => setEditingUsername(true)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
                
                <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {profile?.email || user?.email}
                </div>
                
                <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                  <div className="text-center">
                    <div className="font-bold text-xl text-primary">{trips.length}</div>
                    <div className="text-xs text-muted-foreground">Trips Planned</div>
                  </div>
                </div>
              </div>
              
              <Button variant="hero" onClick={() => navigate('/planner')}>
                <MapPin className="w-4 h-4" />
                Plan New Trip
              </Button>
            </div>
          </motion.div>

          {/* Trip History */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">My Trips</h2>
            
            {trips.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-muted/30 rounded-2xl"
              >
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No trips yet</h3>
                <p className="text-muted-foreground mb-4">Start planning your first adventure!</p>
                <Button variant="hero" onClick={() => navigate('/planner')}>
                  Plan a Trip
                </Button>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {trips.map((trip, index) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card rounded-xl border border-border overflow-hidden group hover:shadow-lg transition-shadow"
                  >
                    <div className="h-32 bg-gradient-hero flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-white/50" />
                    </div>
                    
                    <div className="p-5">
                      <h3 className="font-display font-bold text-lg mb-2 line-clamp-1">
                        {trip.title}
                      </h3>
                      
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {trip.destination}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => viewTrip(trip)}
                        >
                          <ExternalLink className="w-4 h-4" />
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteTrip(trip.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
