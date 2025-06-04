
import React, { useEffect, useState } from 'react';
import { resolveMedicine, MedicineResolution } from '../services/tavilyService';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import MedicineResolutionCard from './MedicineResolutionCard';

interface MedicineResolverProps {
  medicineName: string;
  onResolutionChange: (resolution: MedicineResolution | null) => void;
}

const MedicineResolver = ({ medicineName, onResolutionChange }: MedicineResolverProps) => {
  const [resolution, setResolution] = useState<MedicineResolution | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveWithDelay = setTimeout(async () => {
      if (medicineName.trim().length > 2) {
        setLoading(true);
        setError(null);
        
        try {
          const result = await resolveMedicine(medicineName);
          setResolution(result);
          onResolutionChange(result);
        } catch (err) {
          console.error('Medicine resolution error:', err);
          setError('Unable to resolve medicine information');
          setResolution(null);
          onResolutionChange(null);
        } finally {
          setLoading(false);
        }
      } else {
        setResolution(null);
        onResolutionChange(null);
      }
    }, 1000);

    return () => clearTimeout(resolveWithDelay);
  }, [medicineName, onResolutionChange]);

  if (!medicineName.trim()) return null;

  return (
    <div className="mt-3 space-y-3">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/40 backdrop-blur-sm rounded-lg p-3">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Resolving medicine information...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50/80 backdrop-blur-sm rounded-lg p-3 border border-red-100">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {resolution && !loading && (
        <MedicineResolutionCard 
          medicineName={medicineName}
          resolution={resolution}
        />
      )}

      {!resolution && !loading && !error && medicineName.trim().length > 2 && (
        <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50/80 backdrop-blur-sm rounded-lg p-3 border border-yellow-100">
          <AlertCircle className="h-4 w-4" />
          <span>No medicine information found. Please check the spelling.</span>
        </div>
      )}
    </div>
  );
};

export default MedicineResolver;
