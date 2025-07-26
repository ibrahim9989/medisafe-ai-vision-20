import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('RadioGPT: Function invoked');

  try {
    const { 
      imageData, 
      imageType, 
      medicalImageType = 'radiology',
      clinicalContext, 
      patientName, 
      patientAge,
      userId 
    } = await req.json();

    console.log('RadioGPT: Request received', {
      hasImageData: !!imageData,
      imageType,
      medicalImageType,
      hasContext: !!clinicalContext,
      patientName,
      patientAge,
      userId
    });

    if (!imageData) {
      console.error('RadioGPT: No image data provided');
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userId) {
      console.error('RadioGPT: No user ID provided');
      return new Response(
        JSON.stringify({ error: 'User authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get API keys from environment
    const geminiApiKey = Deno.env.get('INTERPRET_AI_GEMINI_API_KEY');
    const azureApiKey = Deno.env.get('INTERPRET_AI_AZURE_API_KEY');
    const azureEndpoint = Deno.env.get('INTERPRET_AI_AZURE_ENDPOINT');

    console.log('RadioGPT: API keys status', {
      hasGemini: !!geminiApiKey,
      hasAzure: !!azureApiKey,
      hasAzureEndpoint: !!azureEndpoint
    });

    // Create detailed prompt based on medical image type
    const getPromptForImageType = (type: string, context?: string, name?: string, age?: number) => {
      const basePrompt = `You are RadioGPT, an AI radiological companion for ICU medical professionals. 
You provide detailed, accurate interpretation of medical images to assist healthcare providers.

IMPORTANT: You provide interpretations and observations, NOT diagnoses. Always remind that final diagnosis requires clinical correlation.

Image Type: ${type.toUpperCase()}
${name ? `Patient: ${name}` : ''}
${age ? `Age: ${age} years` : ''}
${context ? `Clinical Context: ${context}` : ''}

Please provide a comprehensive interpretation including:
1. Technical quality assessment
2. Key findings and observations
3. Notable abnormalities or normal variants
4. Recommendations for further imaging or clinical correlation if needed
5. Urgency level (routine, urgent, emergent) with reasoning

Format your response clearly with appropriate medical terminology while being accessible to ICU staff.

Remember: This is an AI interpretation to assist medical professionals, not replace clinical judgment.`;

      switch (type) {
        case 'eeg':
          return basePrompt + `

For EEG interpretation, focus on:
- Rhythm and frequency analysis
- Presence of epileptiform activity
- Background activity assessment
- Artifact identification
- Sleep stages if applicable`;

        case 'ecg':
          return basePrompt + `

For ECG interpretation, focus on:
- Heart rate and rhythm
- Axis determination
- Interval measurements (PR, QRS, QT)
- ST-segment and T-wave analysis
- Arrhythmia identification
- Signs of ischemia, infarction, or other abnormalities`;

        case 'radiology':
        default:
          return basePrompt + `

For radiological interpretation, focus on:
- Anatomical structures visibility
- Abnormal findings or masses
- Positioning and technique
- Comparison with normal anatomy
- Pathological processes if evident`;
      }
    };

    const prompt = getPromptForImageType(medicalImageType, clinicalContext, patientName, patientAge);

    // Try Gemini first (no timeout for radiological analysis)
    const tryGemini = async () => {
      if (!geminiApiKey) {
        throw new Error('Gemini API key not configured');
      }

      console.log('RadioGPT: Attempting Gemini analysis');

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: imageType,
                  data: imageData
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('RadioGPT: Gemini API error', { status: response.status, error: errorText });
        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('RadioGPT: Gemini response received', { 
        hasContent: !!result.candidates?.[0]?.content?.parts?.[0]?.text,
        usageMetadata: result.usageMetadata 
      });

      const interpretation = result.candidates?.[0]?.content?.parts?.[0]?.text;
      const tokensUsed = result.usageMetadata?.totalTokenCount || 0;

      if (!interpretation) {
        throw new Error('No interpretation generated by Gemini');
      }

      return {
        interpretation,
        provider: 'gemini',
        tokensUsed,
        timestamp: new Date().toISOString()
      };
    };

    // Try Azure OpenAI as fallback
    const tryAzureOpenAI = async () => {
      if (!azureApiKey || !azureEndpoint) {
        throw new Error('Azure OpenAI credentials not configured');
      }

      console.log('RadioGPT: Attempting Azure OpenAI analysis');

      const response = await fetch(`${azureEndpoint}/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-15-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': azureApiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${imageType};base64,${imageData}`
                  }
                }
              ]
            }
          ],
          max_tokens: 2048,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('RadioGPT: Azure OpenAI error', { status: response.status, error: errorText });
        throw new Error(`Azure OpenAI error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('RadioGPT: Azure OpenAI response received', { 
        hasContent: !!result.choices?.[0]?.message?.content,
        usage: result.usage 
      });

      const interpretation = result.choices?.[0]?.message?.content;
      const tokensUsed = result.usage?.total_tokens || 0;

      if (!interpretation) {
        throw new Error('No interpretation generated by Azure OpenAI');
      }

      return {
        interpretation,
        provider: 'azure_openai',
        tokensUsed,
        timestamp: new Date().toISOString()
      };
    };

    // Try Gemini first, then Azure OpenAI as fallback
    let result;
    try {
      result = await tryGemini();
      console.log('RadioGPT: Successfully analyzed with Gemini');
    } catch (geminiError) {
      console.log('RadioGPT: Gemini failed, trying Azure OpenAI', { error: geminiError.message });
      try {
        result = await tryAzureOpenAI();
        console.log('RadioGPT: Successfully analyzed with Azure OpenAI');
      } catch (azureError) {
        console.error('RadioGPT: Both providers failed', { 
          geminiError: geminiError.message, 
          azureError: azureError.message 
        });
        throw new Error('Both AI providers failed to analyze the image');
      }
    }

    // Initialize Supabase client for audit logging
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Log the analysis for audit purposes
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'radiogpt_analysis',
        resource: 'medical_image',
        metadata: {
          image_type: medicalImageType,
          provider: result.provider,
          tokens_used: result.tokensUsed,
          has_clinical_context: !!clinicalContext,
          patient_name: patientName || null,
          patient_age: patientAge || null
        }
      });

      console.log('RadioGPT: Audit log created');
    } catch (auditError) {
      console.error('RadioGPT: Failed to create audit log', auditError);
      // Don't fail the request if audit logging fails
    }

    console.log('RadioGPT: Analysis completed successfully', {
      provider: result.provider,
      tokensUsed: result.tokensUsed,
      interpretationLength: result.interpretation.length
    });

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('RadioGPT: Function error', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process medical image',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});