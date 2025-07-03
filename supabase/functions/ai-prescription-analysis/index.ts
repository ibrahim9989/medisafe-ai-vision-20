
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AZURE_OPENAI_GPT41_API_KEY = Deno.env.get('AZURE_OPENAI_GPT41_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prescriptionData } = await req.json();

    if (!AZURE_OPENAI_GPT41_API_KEY) {
      throw new Error('Azure OpenAI GPT-4.1 API key not configured');
    }

    console.log('Starting AI prescription analysis...');

    const analysisPrompt = `You are an expert medical AI assistant. Analyze this prescription data and provide comprehensive insights:

PRESCRIPTION DATA:
Patient: ${prescriptionData.patientName}, Age: ${prescriptionData.age}, Gender: ${prescriptionData.gender}
Diagnosis: ${prescriptionData.diagnosis}
Diagnosis Details: ${prescriptionData.diagnosisDetails}
Underlying Conditions: ${prescriptionData.underlyingConditions}
Medications: ${JSON.stringify(prescriptionData.medications)}
Consultation Notes: ${prescriptionData.consultationNotes}
Lab Analysis: ${prescriptionData.labAnalysis}
Recommended Tests: ${JSON.stringify(prescriptionData.recommendedTests)}

ANALYZE AND PROVIDE:
1. Drug interactions and contraindications
2. Risk factors based on patient profile and underlying conditions
3. Recommendations for treatment optimization
4. Alternative treatment options
5. Overall safety assessment considering diagnosis and underlying conditions

RETURN RESPONSE AS JSON:
{
  "analysis": "comprehensive analysis summary including diagnosis and underlying conditions assessment",
  "risk_factors": ["risk1", "risk2"],
  "drug_interactions": ["interaction1", "interaction2"],
  "recommendations": ["rec1", "rec2"],
  "alternative_treatments": ["alt1", "alt2"]
}`;

    const gptResponse = await fetch('https://otly.cognitiveservices.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2025-01-01-preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AZURE_OPENAI_GPT41_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are an expert medical AI assistant. Always respond with valid JSON format.' },
          { role: 'user', content: analysisPrompt }
        ],
        model: 'gpt-4.1',
        max_completion_tokens: 2048,
        temperature: 0.1,
        top_p: 0.8,
      }),
    });

    if (!gptResponse.ok) {
      const errorText = await gptResponse.text();
      console.error('Azure OpenAI GPT-4.1 API error:', errorText);
      throw new Error(`Azure OpenAI GPT-4.1 API error (${gptResponse.status}): ${errorText}`);
    }

    const gptResult = await gptResponse.json();
    const analysisText = gptResult.choices?.[0]?.message?.content || '';
    
    if (!analysisText) {
      throw new Error('No analysis received from Azure OpenAI GPT-4.1 API');
    }

    console.log('GPT-4.1 analysis received, length:', analysisText.length);
    
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
