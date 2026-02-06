import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/Navbar';
import { motion } from 'framer-motion';
import { 
  MapPin, Calendar, Wallet, Compass, 
  Train, Bus, Plane, Shuffle,
  Mountain, Waves, UtensilsCrossed, ShoppingBag, Camera, Landmark,
  ArrowRight, Sparkles, Loader2
} from 'lucide-react';
import { TravelPreferences } from '@/types/travel';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const interestOptions = [
  { id: 'nature', label: 'Nature', icon: Mountain },
  { id: 'beaches', label: 'Beaches', icon: Waves },
  { id: 'food', label: 'Food', icon: UtensilsCrossed },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'adventure', label: 'Adventure', icon: Compass },
  { id: 'temples', label: 'Temples', icon: Landmark },
  { id: 'photography', label: 'Photography', icon: Camera },
];

const travelModes = [
  { id: 'bus', label: 'Bus', icon: Bus, description: 'Most affordable' },
  { id: 'train', label: 'Train', icon: Train, description: 'Comfortable & scenic' },
  { id: 'flight', label: 'Flight', icon: Plane, description: 'Fastest option' },
  { id: 'mixed', label: 'Mixed', icon: Shuffle, description: 'Best combination' },
];

const budgetLevels = [
  { id: 'low', label: 'Budget', range: '₹1,000-3,000/day', color: 'bg-green-500' },
  { id: 'medium', label: 'Standard', range: '₹3,000-7,000/day', color: 'bg-amber-500' },
  { id: 'high', label: 'Comfort', range: '₹7,000+/day', color: 'bg-purple-500' },
];

export default function Planner() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [preferences, setPreferences] = useState<TravelPreferences>({
    destination: '',
    startingCity: '',
    startDate: '',
    endDate: '',
    budgetLevel: 'medium',
    interests: [],
    travelMode: 'train',
  });

  const updatePreference = <K extends keyof TravelPreferences>(
    key: K, 
    value: TravelPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const toggleInterest = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return preferences.destination && preferences.startingCity;
      case 2:
        return preferences.startDate && preferences.endDate;
      case 3:
        return true;
      case 4:
        return preferences.interests.length > 0;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to generate your itinerary');
      return;
    }

    setIsSubmitting(true);
    
    // Store preferences in sessionStorage for the results page
    sessionStorage.setItem('travelPreferences', JSON.stringify(preferences));
    
    navigate('/results');
  };

  // Redirect to auth if not logged in
  if (!authLoading && !user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-28 pb-12">
        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    s <= step 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div className={`w-16 md:w-24 h-1 mx-2 rounded transition-colors ${
                    s < step ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Destination</span>
            <span>Dates</span>
            <span>Budget</span>
            <span>Interests</span>
          </div>
        </div>

        {/* Step Content */}
        <motion.div 
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Step 1: Destination */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-display text-3xl font-bold mb-2">Where do you want to go?</h2>
                <p className="text-muted-foreground">Tell us your dream destination</p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination City</Label>
                  <Input
                    id="destination"
                    placeholder="e.g., Goa, Manali, Jaipur"
                    value={preferences.destination}
                    onChange={(e) => updatePreference('destination', e.target.value)}
                    className="text-lg h-14"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startingCity">Starting From</Label>
                  <Input
                    id="startingCity"
                    placeholder="e.g., Mumbai, Delhi, Bangalore"
                    value={preferences.startingCity}
                    onChange={(e) => updatePreference('startingCity', e.target.value)}
                    className="text-lg h-14"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Dates */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/20 mb-4">
                  <Calendar className="w-8 h-8 text-secondary" />
                </div>
                <h2 className="font-display text-3xl font-bold mb-2">When are you traveling?</h2>
                <p className="text-muted-foreground">Select your travel dates</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={preferences.startDate}
                    onChange={(e) => updatePreference('startDate', e.target.value)}
                    className="text-lg h-14"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={preferences.endDate}
                    onChange={(e) => updatePreference('endDate', e.target.value)}
                    className="text-lg h-14"
                    min={preferences.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Budget & Travel Mode */}
          {step === 3 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 mb-4">
                  <Wallet className="w-8 h-8 text-accent-foreground" />
                </div>
                <h2 className="font-display text-3xl font-bold mb-2">Budget & Travel Style</h2>
                <p className="text-muted-foreground">Help us optimize your trip</p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Budget Level</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {budgetLevels.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => updatePreference('budgetLevel', level.id as 'low' | 'medium' | 'high')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          preferences.budgetLevel === level.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${level.color} mb-2`} />
                        <div className="font-semibold">{level.label}</div>
                        <div className="text-xs text-muted-foreground">{level.range}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Preferred Travel Mode</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {travelModes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => updatePreference('travelMode', mode.id as TravelPreferences['travelMode'])}
                        className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                          preferences.travelMode === mode.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <mode.icon className="w-6 h-6 text-primary" />
                        <div className="text-left">
                          <div className="font-semibold">{mode.label}</div>
                          <div className="text-xs text-muted-foreground">{mode.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Interests */}
          {step === 4 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-coral/20 mb-4">
                  <Compass className="w-8 h-8 text-coral" />
                </div>
                <h2 className="font-display text-3xl font-bold mb-2">What excites you?</h2>
                <p className="text-muted-foreground">Select all that interest you</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {interestOptions.map((interest) => (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      preferences.interests.includes(interest.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <interest.icon className={`w-8 h-8 ${
                      preferences.interests.includes(interest.id) ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <span className="font-medium">{interest.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12">
            <Button 
              variant="outline" 
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1}
            >
              Back
            </Button>
            
            {step < 4 ? (
              <Button 
                variant="hero"
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                variant="hero"
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Itinerary
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
