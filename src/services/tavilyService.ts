const TAVILY_API_KEY = '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';
const TAVILY_ENDPOINT = 'https://api.tavily.com/search';

export interface MedicineResolution {
  originalName: string;
  genericName: string;
  brandNames: string[];
  activeIngredients: string[];
  confidence: number;
  sources: string[];
}

export interface ADRValidation {
  drugCombination: string;
  predictedADR: string;
  validated: boolean;
  confidence: number;
  sources: string[];
  additionalInfo: string;
}

class TavilyService {
  private cache = new Map<string, MedicineResolution>();

  async resolveMedicineName(medicineName: string): Promise<MedicineResolution> {
    console.log('TavilyService: Starting resolution for:', medicineName);
    
    // Check cache first
    const cacheKey = medicineName.toLowerCase().trim();
    if (this.cache.has(cacheKey)) {
      console.log('TavilyService: Found in cache:', cacheKey);
      return this.cache.get(cacheKey)!;
    }

    try {
      console.log('TavilyService: Making API request to Tavily...');
      const options = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TAVILY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "query": `${medicineName} generic name active ingredient pharmaceutical`,
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

      console.log('TavilyService: Request options:', {
        ...options,
        headers: { ...options.headers, 'Authorization': 'Bearer [HIDDEN]' }
      });

      const response = await fetch(TAVILY_ENDPOINT, options);
      console.log('TavilyService: Response status:', response.status);
      console.log('TavilyService: Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('TavilyService: API error response:', errorText);
        throw new Error(`Tavily API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('TavilyService: API response data:', data);
      
      const resolution = this.parseMedicineResolution(medicineName, data);
      console.log('TavilyService: Parsed resolution:', resolution);
      
      // Cache the result
      this.cache.set(cacheKey, resolution);
      return resolution;
    } catch (error) {
      console.error('TavilyService: Error resolving medicine name:', error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('TavilyService: Network error - check CORS or connectivity');
        throw new Error('Network error: Unable to connect to medicine database. Please check your internet connection.');
      }
      
      // Return fallback resolution with error indication
      console.log('TavilyService: Returning fallback resolution');
      return {
        originalName: medicineName,
        genericName: medicineName,
        brandNames: [medicineName],
        activeIngredients: [medicineName],
        confidence: 0.3,
        sources: []
      };
    }
  }

  async validateADRPrediction(drugCombination: string, predictedADR: string): Promise<ADRValidation> {
    try {
      const options = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TAVILY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "query": `${drugCombination} adverse drug reaction interaction "${predictedADR}" clinical study`,
          "topic": "general",
          "search_depth": "advanced",
          "chunks_per_source": 5,
          "max_results": 5,
          "include_answer": true,
          "include_raw_content": true,
          "days": 365,
          "include_domains": ["pubmed.ncbi.nlm.nih.gov", "drugs.com", "rxlist.com", "medscape.com"]
        })
      };

      const response = await fetch(TAVILY_ENDPOINT, options);
      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseADRValidation(drugCombination, predictedADR, data);
    } catch (error) {
      console.error('Error validating ADR prediction:', error);
      return {
        drugCombination,
        predictedADR,
        validated: false,
        confidence: 0,
        sources: [],
        additionalInfo: 'Validation failed - API unavailable'
      };
    }
  }

  private parseMedicineResolution(originalName: string, data: any): MedicineResolution {
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
      sources.push(result.url);
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

  private parseADRValidation(drugCombination: string, predictedADR: string, data: any): ADRValidation {
    const answer = data.answer || '';
    const results = data.results || [];
    
    let validated = false;
    let confidence = 0;
    let sources: string[] = [];
    let additionalInfo = '';

    // Check if the answer contains confirmation of the ADR
    const adrKeywords = predictedADR.toLowerCase().split(/[\s,]+/);
    const matchingKeywords = adrKeywords.filter(keyword => 
      answer.toLowerCase().includes(keyword)
    );

    if (matchingKeywords.length > 0) {
      validated = true;
      confidence = Math.min(matchingKeywords.length / adrKeywords.length, 1);
    }

    // Extract additional information
    if (answer.length > 100) {
      additionalInfo = answer.substring(0, 200) + '...';
    }

    results.forEach((result: any) => {
      sources.push(result.url);
    });

    return {
      drugCombination,
      predictedADR,
      validated,
      confidence,
      sources,
      additionalInfo
    };
  }

  clearCache() {
    this.cache.clear();
  }
}

export const tavilyService = new TavilyService();
