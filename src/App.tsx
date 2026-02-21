import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Planner from "./pages/Planner";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
// IMPORTANT: You must import your results page here
import Results from "./pages/Results"; 

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* This is the missing link! 
              This route tells React what to show when the URL is /results 
            */}
            <Route path="/results" element={<Results />} /> 
            
            {/* The asterisk (*) catches any undefined URL and shows the 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;