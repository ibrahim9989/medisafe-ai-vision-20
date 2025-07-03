
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image, mimeType, apiKey } = await req.json()
    
    if (!apiKey) {
      throw new Error('API key is required')
    }

    console.log('Starting lab report analysis with Azure OpenAI GPT-4.1...')

    // Use Azure OpenAI GPT-4.1 for lab report analysis
    const response = await fetch('https://otly.cognitiveservices.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2025-01-01-preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are an expert medical analyst. Analyze lab report images and provide comprehensive medical analysis. Always respond with detailed, professional medical insights.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this lab report image. Extract and interpret all numerical values, reference ranges, and provide a comprehensive medical analysis. Focus on:
1. Key abnormal values and their clinical significance
2. Overall health assessment based on the results
3. Potential conditions or concerns indicated by the results
4. Recommendations for follow-up or treatment
5. Any critical values that require immediate attention

Please provide a structured analysis in a clear, professional medical format.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${image}`
                }
              }
            ]
          }
        ],
        model: 'gpt-4.1',
        max_completion_tokens: 2048,
        temperature: 0.1,
        top_p: 0.8,
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Azure OpenAI GPT-4.1 API error:', errorText)
      throw new Error(`Azure OpenAI GPT-4.1 API error: ${response.status}`)
    }

    const data = await response.json()
    const analysis = data.choices?.[0]?.message?.content || 'Unable to analyze lab report'

    console.log('Lab report analysis completed successfully')

    return new Response(
      JSON.stringify({ analysis }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error analyzing lab report:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze lab report',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
