
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prescriptionData } = await req.json();

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    console.log('Starting AI prescription analysis...');

    const analysisPrompt = `You are an expert medical AI assistant. Analyze this prescription data and provide comprehensive insights:

PRESCRIPTION DATA:
Patient: ${prescriptionData.patientName}, Age: ${prescriptionData.age}, Gender: ${prescriptionData.gender}
Diagnosis: ${prescriptionData.diagnosis}
Medications: ${JSON.stringify(prescriptionData.medications)}
Consultation Notes: ${prescriptionData.consultationNotes}
Lab Analysis: ${prescriptionData.labAnalysis}
Recommended Tests: ${JSON.stringify(prescriptionData.recommendedTests)}

ANALYZE AND PROVIDE:
1. Drug interactions and contraindications
2. Risk factors based on patient profile
3. Recommendations for treatment optimization
4. Alternative treatment options
5. Overall safety assessment

RETURN RESPONSE AS JSON:
{
  "analysis": "comprehensive analysis summary",
  "risk_factors": ["risk1", "risk2"],
  "drug_interactions": ["interaction1", "interaction2"],
  "recommendations": ["rec1", "rec2"],
  "alternative_treatments": ["alt1", "alt2"]
}`;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: analysisPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error (${geminiResponse.status}): ${errorText}`);
    }

    const geminiResult = await geminiResponse.json();
    const analysisText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!analysisText) {
      throw new Error('No analysis received from Gemini API');
    }

    console.log('Gemini analysis received, length:', analysisText.length);
    
    let analysisData;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if JSON parsing fails
        analysisData = {
          analysis: analysisText,
          risk_factors: [],
          drug_interactions: [],
          recommendations: [],
          alternative_treatments: []
        };
      }
    } catch (parseError) {
      console.error('Failed to parse analysis JSON, using fallback');
      analysisData = {
        analysis: analysisText,
        risk_factors: [],
        drug_interactions: [],
        recommendations: [],
        alternative_treatments: []
      };
    }

    console.log('AI prescription analysis completed successfully');

    return new Response(JSON.stringify(analysisData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI prescription analysis error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
