import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { preferences } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { destination, startingCity, startDate, endDate, budgetLevel, interests, travelMode } = preferences;

    const systemPrompt = `You are an expert travel planner specializing in budget-friendly student travel in India. 
Create detailed, practical travel itineraries that maximize experiences while minimizing costs.
Always provide specific recommendations with estimated costs in INR (₹).
Focus on student-friendly options like hostels, local food, and free attractions.
Include exact location coordinates for mapping when possible.`;

    const userPrompt = `Create a detailed travel itinerary for a student trip:

TRIP DETAILS:
- From: ${startingCity}
- To: ${destination}
- Dates: ${startDate} to ${endDate}
- Budget Level: ${budgetLevel} (${budgetLevel === 'low' ? '₹1,000-3,000/day' : budgetLevel === 'medium' ? '₹3,000-7,000/day' : '₹7,000+/day'})
- Interests: ${interests.join(', ')}
- Preferred Travel: ${travelMode}

Please provide the response in the following JSON structure:
{
  "title": "Trip title",
  "destination": "${destination}",
  "bestTimeToVisit": "Best months to visit",
  "days": [
    {
      "day": 1,
      "date": "${startDate}",
      "activities": [
        {
          "time": "09:00",
          "name": "Activity name",
          "description": "What to do",
          "location": "Place name",
          "cost": 0,
          "duration": "2 hours",
          "coordinates": {"lat": 0.0, "lng": 0.0}
        }
      ],
      "meals": [
        {
          "type": "breakfast",
          "name": "Meal recommendation",
          "place": "Restaurant/cafe name",
          "estimatedCost": 100,
          "recommendation": "Try their special dish"
        }
      ],
      "accommodation": {
        "name": "Hostel/Hotel name",
        "type": "hostel",
        "cost": 500,
        "location": "Area name",
        "coordinates": {"lat": 0.0, "lng": 0.0}
      },
      "tips": ["Local tip for the day"]
    }
  ],
  "budgetBreakdown": {
    "travel": 0,
    "accommodation": 0,
    "food": 0,
    "activities": 0,
    "miscellaneous": 0,
    "total": 0
  },
  "moneyTips": ["Student money-saving tips"],
  "travelRoutes": [
    {
      "from": "${startingCity}",
      "to": "${destination}",
      "mode": "${travelMode}",
      "duration": "Duration",
      "estimatedCost": 0,
      "recommendation": "Best booking platform"
    }
  ]
}

Ensure all costs are realistic and in INR. Include coordinates for major attractions in ${destination}.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to generate itinerary" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response
    let itinerary;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      itinerary = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw content:", content);
      throw new Error("Failed to parse itinerary data");
    }

    return new Response(JSON.stringify({ itinerary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-itinerary error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
