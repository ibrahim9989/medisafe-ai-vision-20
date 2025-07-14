
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, imageType, clinicalContext, patientName, patientAge } = await req.json();

    if (!imageData) {
      throw new Error('No image data provided');
    }

    // Check for Azure OpenAI credentials
    const azureApiKey = Deno.env.get('AZURE_OPENAI_GPT41_API_KEY');
    const azureEndpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT');

    console.log('Environment check:');
    console.log('- Azure API Key present:', !!azureApiKey);
    console.log('- Azure Endpoint present:', !!azureEndpoint);
    console.log('- Azure Endpoint value:', azureEndpoint);

    if (!azureApiKey || !azureEndpoint) {
      console.error('Missing Azure OpenAI credentials');
      throw new Error('Azure OpenAI credentials not configured. Please set AZURE_OPENAI_GPT41_API_KEY and AZURE_OPENAI_ENDPOINT in Supabase secrets.');
    }

    console.log('Processing medical image interpretation request...');
    console.log('Image type:', imageType);
    console.log('Clinical context provided:', !!clinicalContext);
    console.log('Patient info provided:', {
      name: !!patientName,
      age: !!patientAge
    });

    // Construct the prompt for medical image interpretation
    let prompt = `You are an expert AI radiologist specializing in medical image interpretation. Please analyze this medical image and provide a detailed, accurate interpretation.

IMPORTANT INSTRUCTIONS:
- Provide INTERPRETATION only, NOT diagnosis
- Be thorough and precise in your analysis
- Describe what you observe in the image
- Note any abnormalities, patterns, or significant findings
- Use proper medical terminology
- Structure your response clearly with sections for different aspects
- Always emphasize that this is an interpretation, not a diagnosis

Please analyze this medical image and provide:

1. IMAGE TYPE & QUALITY:
   - Type of medical imaging (X-ray, CT, MRI, ECG, EEG, etc.)
   - Image quality assessment
   - Technical adequacy

2. ANATOMICAL STRUCTURES:
   - Identify visible anatomical structures
   - Assess normal anatomy

3. FINDINGS:
   - Describe any notable findings or abnormalities
   - Location and characteristics of findings
   - Comparison with normal appearance

4. TECHNICAL OBSERVATIONS:
   - Any technical factors affecting interpretation
   - Image artifacts or limitations

5. SUMMARY:
   - Brief summary of key findings
   - Recommendations for clinical correlation`;

    // Add clinical context if provided
    if (clinicalContext) {
      prompt += `\n\nCLINICAL CONTEXT PROVIDED:\n${clinicalContext}`;
    }

    // Add patient information if provided
    if (patientName || patientAge) {
      prompt += `\n\nPATIENT INFORMATION:`;
      if (patientName) prompt += `\nName: ${patientName}`;
      if (patientAge) prompt += `\nAge: ${patientAge} years`;
    }

    prompt += `\n\nRemember: This is an INTERPRETATION for educational and informational purposes. Clinical correlation and professional medical evaluation are essential for proper patient care.`;

    const requestBody = {
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${imageType};base64,${imageData}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    };

    console.log('Sending request to Azure OpenAI...');
    
    const azureUrl = `${azureEndpoint}/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-15-preview`;
    console.log('Azure URL:', azureUrl);

    const response = await fetch(azureUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': azureApiKey,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Azure OpenAI response status:', response.status);
    console.log('Azure OpenAI response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI API error:', response.status, errorText);
      throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Azure OpenAI response received');
    console.log('Response structure:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      hasMessage: !!data.choices?.[0]?.message,
      hasContent: !!data.choices?.[0]?.message?.content
    });

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from Azure OpenAI');
    }

    const interpretation = data.choices[0].message.content;

    if (!interpretation || interpretation.trim().length === 0) {
      throw new Error('No interpretation generated');
    }

    console.log('Medical image interpretation completed successfully');

    return new Response(
      JSON.stringify({ 
        interpretation: interpretation.trim(),
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in interpret-medical-image function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to interpret medical image',
        timestamp: new Date().toISOString()
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
