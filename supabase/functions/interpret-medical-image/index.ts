
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
    const { imageBase64, imageType, patientName, patientAge, clinicalContext } = await req.json();

    if (!imageBase64 || !imageType || !patientName) {
      throw new Error('Missing required fields: imageBase64, imageType, and patientName are required');
    }

    const azureEndpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT');
    const azureApiKey = Deno.env.get('AZURE_OPENAI_GPT41_API_KEY');

    if (!azureEndpoint || !azureApiKey) {
      throw new Error('Azure OpenAI configuration missing');
    }

    // Construct the prompt based on image type
    let systemPrompt = '';
    let analysisPrompt = '';

    switch (imageType) {
      case 'radiological':
        systemPrompt = 'You are an expert radiologist AI assistant. Analyze medical images with precision and provide detailed interpretations.';
        analysisPrompt = `Please analyze this radiological image (X-ray, CT, or MRI) and provide a detailed interpretation. Focus on:

1. Image quality and technical adequacy
2. Normal anatomical structures visible
3. Any abnormal findings or pathology
4. Recommendations for further imaging or clinical correlation
5. Differential diagnoses if applicable

Patient: ${patientName}${patientAge ? `, Age: ${patientAge}` : ''}
${clinicalContext ? `Clinical Context: ${clinicalContext}` : ''}

Please provide a professional, structured interpretation that would be suitable for medical documentation.`;
        break;

      case 'ecg':
        systemPrompt = 'You are an expert cardiologist AI assistant specializing in ECG interpretation.';
        analysisPrompt = `Please analyze this ECG (Electrocardiogram) and provide a detailed interpretation. Focus on:

1. Heart rate and rhythm analysis
2. P wave, QRS complex, and T wave morphology
3. PR interval, QRS duration, and QT interval measurements
4. Axis determination
5. Any arrhythmias or conduction abnormalities
6. Signs of ischemia, infarction, or other cardiac pathology
7. Clinical significance of findings

Patient: ${patientName}${patientAge ? `, Age: ${patientAge}` : ''}
${clinicalContext ? `Clinical Context: ${clinicalContext}` : ''}

Please provide a comprehensive ECG interpretation suitable for clinical use.`;
        break;

      case 'eeg':
        systemPrompt = 'You are an expert neurologist AI assistant specializing in EEG interpretation.';
        analysisPrompt = `Please analyze this EEG (Electroencephalogram) and provide a detailed interpretation. Focus on:

1. Background rhythm and frequency analysis
2. Symmetry and organization of brain activity
3. Any epileptiform discharges or abnormal patterns
4. Sleep-wake patterns if applicable
5. Artifacts identification
6. Clinical correlation with neurological symptoms
7. Recommendations for further evaluation

Patient: ${patientName}${patientAge ? `, Age: ${patientAge}` : ''}
${clinicalContext ? `Clinical Context: ${clinicalContext}` : ''}

Please provide a detailed EEG interpretation suitable for neurological assessment.`;
        break;

      case 'ultrasound':
        systemPrompt = 'You are an expert radiologist AI assistant specializing in ultrasound imaging interpretation.';
        analysisPrompt = `Please analyze this ultrasound image and provide a detailed interpretation. Focus on:

1. Image quality and technical parameters
2. Anatomical structures visualization
3. Organ morphology and echogenicity
4. Any masses, fluid collections, or abnormalities
5. Doppler findings if applicable
6. Measurements and quantitative assessments
7. Clinical implications of findings

Patient: ${patientName}${patientAge ? `, Age: ${patientAge}` : ''}
${clinicalContext ? `Clinical Context: ${clinicalContext}` : ''}

Please provide a comprehensive ultrasound interpretation.`;
        break;

      default:
        systemPrompt = 'You are an expert medical imaging AI assistant. Analyze medical images and provide professional interpretations.';
        analysisPrompt = `Please analyze this medical image and provide a detailed interpretation. Focus on:

1. Image type identification and quality assessment
2. Visible anatomical structures
3. Any abnormal findings or pathology
4. Clinical significance
5. Recommendations for further evaluation

Patient: ${patientName}${patientAge ? `, Age: ${patientAge}` : ''}
${clinicalContext ? `Clinical Context: ${clinicalContext}` : ''}

Please provide a professional medical interpretation.`;
    }

    const requestBody = {
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: analysisPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.1,
      top_p: 0.95
    };

    const response = await fetch(`${azureEndpoint}/openai/deployments/gpt-4o/chat/completions?api-version=2024-05-01-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': azureApiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure API error:', errorText);
      throw new Error(`Azure API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const interpretation = result.choices[0]?.message?.content;

    if (!interpretation) {
      throw new Error('No interpretation received from Azure API');
    }

    return new Response(
      JSON.stringify({ 
        interpretation,
        imageType,
        patientName,
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
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to interpret medical image',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});
