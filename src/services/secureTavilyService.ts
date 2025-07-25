
import { supabase } from '@/integrations/supabase/client';

export interface MedicineResolution {
  originalName: string;
  genericName: string;
  brandNames: string[];
  activeIngredients: string[];
  confidence: number;
  sources: string[];
}

class SecureTavilyService {
  private cache = new Map<string, MedicineResolution>();

  async resolveMedicineName(medicineName: string): Promise<MedicineResolution> {
    console.log('SecureTavilyService: Starting resolution for:', medicineName);
    
    // Input validation
    if (!medicineName || typeof medicineName !== 'string') {
      throw new Error('Invalid medicine name provided');
    }

    const sanitizedName = medicineName.trim().substring(0, 100);
    if (sanitizedName.length < 2) {
      throw new Error('Medicine name too short');
    }

    // Check cache first
    const cacheKey = sanitizedName.toLowerCase();
    if (this.cache.has(cacheKey)) {
      console.log('SecureTavilyService: Found in cache:', cacheKey);
      return this.cache.get(cacheKey)!;
    }

    try {
      console.log('SecureTavilyService: Making secure API request...');
      
      const { data, error } = await supabase.functions.invoke('tavily-medicine-resolver', {
        body: { medicineName: sanitizedName }
      });

      if (error) {
        console.error('SecureTavilyService: Edge function error:', error);
        throw new Error(`Medicine resolution failed: ${error.message}`);
      }

      if (data.error) {
        console.error('SecureTavilyService: API error:', data.error);
        throw new Error(data.error);
      }

      const resolution: MedicineResolution = {
        originalName: data.originalName || sanitizedName,
        genericName: data.genericName || sanitizedName,
        brandNames: data.brandNames || [sanitizedName],
        activeIngredients: data.activeIngredients || [sanitizedName],
        confidence: data.confidence || 0.3,
        sources: data.sources || []
      };

      console.log('SecureTavilyService: Received resolution:', resolution);
      
      // Cache the result
      this.cache.set(cacheKey, resolution);
      return resolution;

    } catch (error) {
      console.error('SecureTavilyService: Error resolving medicine name:', error);
      
      // Return fallback resolution
      return {
        originalName: sanitizedName,
        genericName: sanitizedName,
        brandNames: [sanitizedName],
        activeIngredients: [sanitizedName],
        confidence: 0.1,
        sources: []
      };
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

export const secureTavilyService = new SecureTavilyService();
