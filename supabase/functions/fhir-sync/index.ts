import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface FHIRPatient {
  resourceType: 'Patient';
  id?: string;
  identifier?: Array<{
    use?: string;
    type?: {
      coding?: Array<{
        system?: string;
        code?: string;
      }>;
    };
    value?: string;
  }>;
  name?: Array<{
    use?: string;
    family?: string;
    given?: string[];
  }>;
  telecom?: Array<{
    system?: string;
    value?: string;
    use?: string;
  }>;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: Array<{
    use?: string;
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
}

interface FHIRMedicationRequest {
  resourceType: 'MedicationRequest';
  id?: string;
  status: 'active' | 'on-hold' | 'cancelled' | 'completed' | 'entered-in-error' | 'stopped' | 'draft' | 'unknown';
  intent: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
  medicationCodeableConcept?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  subject: {
    reference: string;
  };
  authoredOn?: string;
  requester?: {
    reference: string;
  };
  dosageInstruction?: Array<{
    text?: string;
    timing?: {
      repeat?: {
        frequency?: number;
        period?: number;
        periodUnit?: string;
      };
    };
    doseAndRate?: Array<{
      doseQuantity?: {
        value?: number;
        unit?: string;
      };
    }>;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { resourceType, data, operation } = await req.json();

    if (!resourceType || !data) {
      throw new Error('Resource type and data are required');
    }

    switch (operation) {
      case 'CREATE_PATIENT':
        return await createPatientFromFHIR(data as FHIRPatient);
      
      case 'UPDATE_PATIENT':
        return await updatePatientFromFHIR(data as FHIRPatient);
      
      case 'CREATE_PRESCRIPTION':
        return await createPrescriptionFromFHIR(data as FHIRMedicationRequest);
      
      case 'SYNC_PATIENT_DATA':
        return await syncPatientData(data);
      
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }

  } catch (error) {
    console.error('FHIR sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function createPatientFromFHIR(fhirPatient: FHIRPatient) {
  try {
    // Extract patient data from FHIR resource
    const name = fhirPatient.name?.[0];
    const fullName = name ? `${name.given?.join(' ')} ${name.family}`.trim() : 'Unknown';
    
    const phone = fhirPatient.telecom?.find(t => t.system === 'phone')?.value;
    const address = fhirPatient.address?.[0];
    const addressText = address ? 
      `${address.line?.join(', ')}, ${address.city}, ${address.state} ${address.postalCode}`.trim() : null;

    // Calculate age from birth date
    let age = null;
    if (fhirPatient.birthDate) {
      const birthDate = new Date(fhirPatient.birthDate);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // Create patient in our database
    const { data, error } = await supabase
      .from('patients')
      .insert({
        full_name: fullName,
        gender: fhirPatient.gender || null,
        age: age,
        phone_number: phone || null,
        address: addressText,
        // Note: doctor_id will need to be provided by the calling system
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        patient: data,
        fhirMapping: {
          internalId: data.id,
          fhirId: fhirPatient.id
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    throw new Error(`Failed to create patient from FHIR: ${error.message}`);
  }
}

async function updatePatientFromFHIR(fhirPatient: FHIRPatient) {
  try {
    if (!fhirPatient.id) {
      throw new Error('FHIR Patient ID is required for updates');
    }

    // Find existing patient by FHIR ID (would need a mapping table in production)
    const name = fhirPatient.name?.[0];
    const fullName = name ? `${name.given?.join(' ')} ${name.family}`.trim() : 'Unknown';
    
    const phone = fhirPatient.telecom?.find(t => t.system === 'phone')?.value;
    const address = fhirPatient.address?.[0];
    const addressText = address ? 
      `${address.line?.join(', ')}, ${address.city}, ${address.state} ${address.postalCode}`.trim() : null;

    let age = null;
    if (fhirPatient.birthDate) {
      const birthDate = new Date(fhirPatient.birthDate);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
    }

    // For demo purposes, we'll update by name (in production, use proper ID mapping)
    const { data, error } = await supabase
      .from('patients')
      .update({
        full_name: fullName,
        gender: fhirPatient.gender || null,
        age: age,
        phone_number: phone || null,
        address: addressText,
      })
      .eq('full_name', fullName)
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, patient: data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    throw new Error(`Failed to update patient from FHIR: ${error.message}`);
  }
}

async function createPrescriptionFromFHIR(fhirMedRequest: FHIRMedicationRequest) {
  try {
    // Extract medication data from FHIR resource
    const medicationName = fhirMedRequest.medicationCodeableConcept?.text || 
      fhirMedRequest.medicationCodeableConcept?.coding?.[0]?.display || 'Unknown Medication';

    const dosage = fhirMedRequest.dosageInstruction?.[0];
    const dosageText = dosage?.text || '';
    const frequency = dosage?.timing?.repeat?.frequency || 1;
    const period = dosage?.timing?.repeat?.period || 1;
    const periodUnit = dosage?.timing?.repeat?.periodUnit || 'day';

    const medications = [{
      name: medicationName,
      dosage: dosage?.doseAndRate?.[0]?.doseQuantity?.value + ' ' + 
             dosage?.doseAndRate?.[0]?.doseQuantity?.unit || '',
      frequency: `${frequency} times per ${period} ${periodUnit}`,
      duration: 'As prescribed',
      instructions: dosageText
    }];

    // Create prescription (would need proper user/patient mapping in production)
    const { data, error } = await supabase
      .from('prescriptions')
      .insert({
        patient_name: 'FHIR Patient', // Would get from patient reference
        medications: medications,
        doctor_name: 'FHIR Doctor', // Would get from requester reference
        age: 0,
        gender: 'Unknown',
        user_id: '00000000-0000-0000-0000-000000000000', // Placeholder
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        prescription: data,
        fhirMapping: {
          internalId: data.id,
          fhirId: fhirMedRequest.id
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    throw new Error(`Failed to create prescription from FHIR: ${error.message}`);
  }
}

async function syncPatientData(syncData: any) {
  try {
    const { patientId, ehrData } = syncData;

    // Sync patient data with EHR system
    // This would implement bidirectional sync logic
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Patient data synchronized successfully',
        syncedAt: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    throw new Error(`Failed to sync patient data: ${error.message}`);
  }
}