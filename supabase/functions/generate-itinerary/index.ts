import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // FIX: Fallback if 'preferences' is nested or sent as top-level object
    const preferences = body.preferences || body;
    
    if (!preferences || !preferences.destination) {
      console.error("Payload received was invalid:", body);
      return new Response(JSON.stringify({ error: "Invalid request: Missing destination" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured in Secrets");

    const { destination, startingCity, startDate, endDate, budgetLevel, interests = [], travelMode } = preferences;

    const userPrompt = `Create a student travel itinerary for ${destination} from ${startingCity || 'nearby'}. 
    Dates: ${startDate} to ${endDate}. Budget: ${budgetLevel}. Interests: ${interests.join(', ')}. Mode: ${travelMode}.
    Return ONLY a valid JSON object with: { "title": "Trip Title", "days": [], "budgetBreakdown": {}, "moneyTips": [] }.`;

    // FIX: Changed URL from v1beta to v1 for stability
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: { 
            temperature: 0.1, 
            response_mime_type: "application/json" 
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(JSON.stringify({ error: "Gemini Error", details: errorData }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const content = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    return new Response(JSON.stringify({ itinerary: JSON.parse(content) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Function Crash:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});