
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prescriptionData, apiKey } = await req.json();
    
    if (!apiKey) {
      throw new Error('API key is required');
    }

    console.log('Starting enhanced AI prescription analysis with Azure OpenAI GPT-4.1...');

    const prompt = `You are an expert medical AI assistant. Analyze this prescription data comprehensively and provide detailed medical insights.

PRESCRIPTION DATA:
- Patient: ${prescriptionData.patientName}, Age: ${prescriptionData.age}, Gender: ${prescriptionData.gender}
- Doctor: ${prescriptionData.doctorName}
- Diagnosis: ${prescriptionData.diagnosis || 'Not specified'}
- Diagnosis Details: ${prescriptionData.diagnosisDetails || 'Not provided'}
- Underlying Conditions: ${prescriptionData.underlyingConditions || 'None specified'}
- Medications: ${JSON.stringify(prescriptionData.medications || [])}
- Vital Signs: Temperature: ${prescriptionData.temperature}°F, BP: ${prescriptionData.bp}
- Lab Analysis: ${prescriptionData.labAnalysis || 'No lab reports analyzed'}
- Consultation Notes: ${prescriptionData.consultationNotes || 'None'}
- Recommended Tests: ${JSON.stringify(prescriptionData.recommendedTests || [])}
- Follow-up Date: ${prescriptionData.followUpDate || 'Not scheduled'}

Provide a comprehensive analysis in JSON format with these fields:
{
  "analysis": "Overall medical analysis and assessment",
  "risk_factors": ["list of identified risk factors"],
  "drug_interactions": ["potential drug interactions or contraindications"],
  "recommendations": ["medical recommendations and suggestions"],
  "alternative_treatments": ["alternative treatment options if applicable"],
  "follow_up_care": ["follow-up care recommendations"],
  "lab_correlation": "Analysis of how lab results correlate with diagnosis and treatment"
}

Focus on patient safety, treatment efficacy, and comprehensive medical care.`;

    // Use Azure OpenAI GPT-4.1 for prescription analysis
    const response = await fetch('https://otly.cognitiveservices.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2025-01-01-preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are an expert medical AI assistant. Always respond with valid JSON format.' },
          { role: 'user', content: prompt }
        ],
        model: 'gpt-4.1',
        max_completion_tokens: 2048,
        temperature: 0.1,
        top_p: 0.8,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI GPT-4.1 API error:', errorText);
      throw new Error(`Azure OpenAI GPT-4.1 API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content || '';

    console.log('Enhanced prescription analysis completed successfully');

    // Parse the JSON response
    let parsedAnalysis;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in analysis response');
      }
    } catch (parseError) {
      console.error('Failed to parse analysis JSON:', parseError);
      parsedAnalysis = {
        analysis: 'Analysis parsing failed, but prescription data processed',
        risk_factors: [],
        drug_interactions: [],
        recommendations: ['Consult with healthcare provider for detailed analysis'],
        alternative_treatments: [],
        follow_up_care: ['Schedule regular follow-up visits'],
        lab_correlation: 'Unable to correlate lab results due to parsing error'
      };
    }

    return new Response(
      JSON.stringify(parsedAnalysis),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in enhanced AI prescription analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze prescription',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
