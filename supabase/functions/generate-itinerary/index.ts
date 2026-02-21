import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // FIX: Safely handle if 'preferences' is nested or sent directly
    const preferences = body.preferences || body;
    
    if (!preferences || !preferences.destination) {
      console.error("Missing preferences or destination in request body:", body);
      return new Response(JSON.stringify({ error: "Invalid request: Missing preferences" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured in Supabase Secrets");
    }

    const { 
      destination, 
      startingCity, 
      startDate, 
      endDate, 
      budgetLevel, 
      interests = [], 
      travelMode 
    } = preferences;

    const systemPrompt = `You are an expert travel planner specializing in student travel in India. 
    Respond ONLY with a valid JSON object. Do not include any conversational text or markdown blocks like \`\`\`json.`;

    const userPrompt = `Create a detailed student travel itinerary from ${startingCity || 'nearby'} to ${destination} for dates ${startDate} to ${endDate}. 
    Budget Level: ${budgetLevel}. Interests: ${interests.join(', ')}. Mode: ${travelMode}.
    Return exactly this JSON structure: 
    { 
      "title": "Trip Title", 
      "destination": "${destination}",
      "days": [
        {
          "day": 1,
          "date": "YYYY-MM-DD",
          "activities": [{"time": "09:00 AM", "name": "Activity", "description": "...", "location": "...", "duration": "2h", "cost": 0, "coordinates": {"lat": 0, "lng": 0}}],
          "accommodation": {"name": "...", "type": "...", "location": "...", "cost": 0, "coordinates": {"lat": 0, "lng": 0}},
          "meals": [{"type": "breakfast", "name": "...", "place": "...", "estimatedCost": 0}],
          "tips": ["..."]
        }
      ], 
      "budgetBreakdown": {"travel": 0, "accommodation": 0, "food": 0, "activities": 0, "miscellaneous": 0, "total": 0}, 
      "moneyTips": [],
      "travelRoutes": [{"from": "...", "to": "...", "mode": "...", "duration": "...", "estimatedCost": 0, "recommendation": "..."}]
    }.`;

    // FIX: Use 'v1' instead of 'v1beta' to avoid model-not-found errors
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
          }],
          generationConfig: {
            temperature: 0.1, // Lowered for even better JSON consistency
            response_mime_type: "application/json",
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error details:", JSON.stringify(errorData));
      return new Response(JSON.stringify({ error: "AI Service Error", details: errorData }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    let content = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean any accidental markdown formatting
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const itinerary = JSON.parse(content);
      return new Response(JSON.stringify({ itinerary }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("JSON Parse Error. Raw content:", content);
      return new Response(JSON.stringify({ error: "AI returned invalid JSON" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (error: any) {
    console.error("Function error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});