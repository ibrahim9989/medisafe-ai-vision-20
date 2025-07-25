
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Function invoked with method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting medical image interpretation...');
    
    const { imageData, imageType, clinicalContext, patientName, patientAge } = await req.json();
    console.log('Request body parsed successfully');

    if (!imageData) {
      console.error('No image data provided');
      throw new Error('No image data provided');
    }

    // Check for Azure OpenAI configuration - using GPT41 API key
    const azureApiKey = Deno.env.get('AZURE_OPENAI_GPT41_API_KEY');
    const azureEndpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT');
    
    console.log('Azure config check:', {
      hasApiKey: !!azureApiKey,
      hasEndpoint: !!azureEndpoint,
      endpoint: azureEndpoint ? azureEndpoint.substring(0, 30) + '...' : 'not set'
    });
    
    if (!azureApiKey || !azureEndpoint) {
      console.error('Azure OpenAI configuration missing');
      throw new Error('Azure OpenAI GPT41 configuration not found');
    }

    // Use the correct deployment name for GPT-4.1
    const deploymentName = 'gpt-41'; // Updated deployment name for GPT-4.1
    const apiVersion = '2024-02-15-preview';

    console.log('Using deployment:', deploymentName);
    console.log('API version:', apiVersion);
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

    console.log('Request body prepared, sending to Azure OpenAI...');
    
    const azureUrl = `${azureEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;
    console.log('Azure URL:', azureUrl);
    
    // Set a timeout for the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('Request timeout triggered');
      controller.abort();
    }, 45000); // 45 second timeout

    const response = await fetch(azureUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': azureApiKey,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('Azure OpenAI response status:', response.status);
    console.log('Azure OpenAI response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI API error:', response.status, errorText);
      
      // Handle specific error cases
      if (response.status === 429) {
        console.log('Rate limit hit, returning 503');
        return new Response(
          JSON.stringify({ 
            error: 'Service temporarily overloaded. Please try again in a few moments.',
            timestamp: new Date().toISOString()
          }),
          { 
            status: 503,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Retry-After': '30'
            } 
          }
        );
      }
      
      if (response.status === 404) {
        console.log('404 error - deployment not found');
        return new Response(
          JSON.stringify({ 
            error: 'AI model deployment not found. Please check GPT-4.1 deployment configuration.',
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
      
      return new Response(
        JSON.stringify({ 
          error: `Azure OpenAI API error: ${response.status} - ${errorText}`,
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

    const data = await response.json();
    console.log('Azure OpenAI response received successfully');
    console.log('Response data structure:', Object.keys(data));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid response format:', data);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response format from Azure OpenAI',
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

    const interpretation = data.choices[0].message.content;
    console.log('Interpretation generated, length:', interpretation?.length);

    if (!interpretation || interpretation.trim().length === 0) {
      console.error('No interpretation generated');
      return new Response(
        JSON.stringify({ 
          error: 'No interpretation generated',
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

    // Calculate token usage from the response
    const tokensUsed = data.usage ? data.usage.total_tokens : Math.ceil(interpretation.length / 4);
    
    console.log('Medical image interpretation completed successfully');
    console.log('Tokens used:', tokensUsed);

    return new Response(
      JSON.stringify({ 
        interpretation: interpretation.trim(),
        tokensUsed: tokensUsed,
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
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle timeout error
    if (error.name === 'AbortError') {
      console.log('Request aborted due to timeout');
      return new Response(
        JSON.stringify({ 
          error: 'Request timeout. Please try again with a smaller image or better internet connection.',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 408,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
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
