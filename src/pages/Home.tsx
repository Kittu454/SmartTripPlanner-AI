import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { motion } from 'framer-motion';
import { MapPin, Sparkles, Wallet, Map, ArrowRight, Star } from 'lucide-react';
import heroImage from '@/assets/hero-travel.jpg';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Itineraries',
    description: 'Get personalized day-by-day travel plans tailored to your interests and budget.',
    color: 'bg-coral',
  },
  {
    icon: Wallet,
    title: 'Budget Optimization',
    description: 'Find the cheapest routes, student hostels, and free attractions to maximize your adventure.',
    color: 'bg-secondary',
  },
  {
    icon: Map,
    title: 'Interactive Maps',
    description: 'Visualize your journey with markers for attractions, restaurants, and accommodations.',
    color: 'bg-accent',
  },
];

const testimonials = [
  {
    name: 'Priya S.',
    university: 'Delhi University',
    text: 'Planned my Goa trip for under ₹5000! The AI suggestions were spot on.',
    rating: 5,
  },
  {
    name: 'Rahul M.',
    university: 'IIT Bombay',
    text: 'Best travel planner for students. Saved me hours of research.',
    rating: 5,
  },
  {
    name: 'Ananya K.',
    university: 'Christ University',
    text: 'The budget breakdown feature is incredibly helpful for planning!',
    rating: 5,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Travel adventure" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
        </div>
        
        {/* Content */}
        <div className="container relative z-10 px-4 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Travel Planning</span>
            </motion.div>
            
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Plan Your Perfect
              <span className="block text-gradient-sunset">Student Adventure</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get personalized, budget-friendly travel itineraries powered by AI. 
              No more generic suggestions – just adventures that fit your wallet and interests.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth" className="gap-2">
                  Start Planning Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/auth">View Demo</Link>
              </Button>
            </div>
            
            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-8 mt-12 pt-8 border-t border-border/50"
            >
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Trips Planned</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-secondary">40%</div>
                <div className="text-sm text-muted-foreground">Avg. Savings</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-accent-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Destinations</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Why Students Love <span className="text-gradient-sunset">TravelAI</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to plan unforgettable adventures on a student budget.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Loved by <span className="text-gradient-ocean">Students</span>
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border/50"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-foreground mb-4">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.university}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Ready for Your Next Adventure?
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8">
              Join thousands of students who are traveling smarter, not harder.
            </p>
            <Button variant="golden" size="xl" asChild>
              <Link to="/auth" className="gap-2">
                Start Planning Now
                <MapPin className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-sunset flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-semibold">TravelAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 TravelAI. Made for students, by students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
