import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Planner from "./pages/Planner";
import Results from "./pages/Results";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  async function testEdgeFunction() {
    const res = await fetch(
      "https://PROJECT_REF.functions.supabase.co/hello-world",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ test: true }),
      }
    );

    const data = await res.json();
    console.log("Edge response:", data);
  }

  return (
    <div>
      <button onClick={testEdgeFunction}>
        Test Edge Function
      </button>
    </div>
  );
}

export default App;
