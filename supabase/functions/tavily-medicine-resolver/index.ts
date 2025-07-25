
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MedicineResolution {
  originalName: string;
  genericName: string;
  brandNames: string[];
  activeIngredients: string[];
  confidence: number;
  sources: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const { medicineName } = await req.json();
    
    if (!medicineName || typeof medicineName !== 'string') {
      throw new Error('Invalid medicine name provided');
    }

    // Sanitize input
    const sanitizedMedicineName = medicineName.trim().substring(0, 100);
    
    if (sanitizedMedicineName.length < 2) {
      throw new Error('Medicine name too short');
    }

    // Get Tavily API key from environment
    const tavilyApiKey = Deno.env.get('TAVILY_API_KEY');
    if (!tavilyApiKey) {
      throw new Error('Tavily API key not configured');
    }

    console.log('Processing medicine resolution for:', sanitizedMedicineName);

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tavilyApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "query": `${sanitizedMedicineName} generic name active ingredient pharmaceutical`,
        "topic": "general",
        "search_depth": "basic",
        "chunks_per_source": 3,
        "max_results": 5,
        "include_answer": true,
        "include_raw_content": true,
        "include_images": false,
        "exclude_domains": ["wikipedia.org"],
        "include_domains": ["drugs.com", "rxlist.com", "webmd.com", "fda.gov"]
      })
    };

    const response = await fetch('https://api.tavily.com/search', options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tavily API error:', errorText);
      throw new Error(`Medicine database unavailable: ${response.status}`);
    }

    const data = await response.json();
    const resolution = parseMedicineResolution(sanitizedMedicineName, data);

    // Log the API usage for audit purposes
    await supabaseClient.from('audit_logs').insert({
      user_id: user.id,
      action: 'medicine_resolution',
      resource: `medicine:${sanitizedMedicineName}`,
      metadata: {
        confidence: resolution.confidence,
        sources_count: resolution.sources.length
      }
    });

    return new Response(
      JSON.stringify(resolution),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Medicine resolution error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Medicine resolution failed',
        originalName: '',
        genericName: '',
        brandNames: [],
        activeIngredients: [],
        confidence: 0,
        sources: []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});

function parseMedicineResolution(originalName: string, data: any): MedicineResolution {
  const answer = data.answer || '';
  const results = data.results || [];
  
  let genericName = originalName;
  let brandNames = [originalName];
  let activeIngredients = [originalName];
  let confidence = 0.3;
  let sources: string[] = [];

  // Extract generic name from answer
  const genericMatch = answer.match(/generic name[:\s]*([^,.]+)/i);
  if (genericMatch) {
    genericName = genericMatch[1].trim();
    confidence += 0.3;
  }

  // Extract active ingredients
  const ingredientMatch = answer.match(/active ingredient[s]?[:\s]*([^,.]+)/i);
  if (ingredientMatch) {
    activeIngredients = ingredientMatch[1].split(/[,+&]/).map(i => i.trim());
    confidence += 0.2;
  }

  // Extract brand names from results
  results.forEach((result: any) => {
    const content = result.content || '';
    const brandMatch = content.match(/brand name[s]?[:\s]*([^,.]+)/i);
    if (brandMatch) {
      const brands = brandMatch[1].split(/[,+&]/).map((b: string) => b.trim());
      brandNames = [...new Set([...brandNames, ...brands])];
    }
    if (result.url) {
      sources.push(result.url);
    }
  });

  if (results.length > 0) confidence += 0.2;

  return {
    originalName,
    genericName,
    brandNames,
    activeIngredients,
    confidence: Math.min(confidence, 1),
    sources
  };
}
