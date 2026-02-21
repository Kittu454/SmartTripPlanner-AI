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
    const { preferences } = await req.json();
    
    // Using the official Google Gemini API Key from Supabase Secrets
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured in Supabase Secrets");
    }

    const { destination, startingCity, startDate, endDate, budgetLevel, interests, travelMode } = preferences;

    const systemPrompt = `You are an expert travel planner specializing in student travel in India. 
    Respond ONLY with a valid JSON object. Do not include any conversational text or markdown blocks like \`\`\`json.`;

    const userPrompt = `Create a detailed student travel itinerary from ${startingCity} to ${destination} for dates ${startDate} to ${endDate}. 
    Budget Level: ${budgetLevel}. Interests: ${interests.join(', ')}. Mode: ${travelMode}.
    Return exactly this JSON structure: { "title": "Trip Title", "days": [], "budgetBreakdown": {}, "moneyTips": [] }.`;

    // Fetching directly from Google Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
          }],
          generationConfig: {
            temperature: 0.2, // Low temperature for consistent JSON output
            response_mime_type: "application/json", // Forces Gemini to output JSON
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      return new Response(JSON.stringify({ error: "AI Service Error", details: errorData }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    
    // Extract the text content from Gemini's response structure
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