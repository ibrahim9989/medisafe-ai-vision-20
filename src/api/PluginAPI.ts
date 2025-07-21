
import { supabase } from '@/integrations/supabase/client';

export interface FHIRPatient {
  resourceType: 'Patient';
  id: string;
  name: Array<{
    family: string;
    given: string[];
  }>;
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string;
  telecom?: Array<{
    system: 'phone' | 'email';
    value: string;
  }>;
  address?: Array<{
    line: string[];
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>;
}

export interface FHIRMedicationRequest {
  resourceType: 'MedicationRequest';
  id: string;
  status: 'active' | 'completed' | 'cancelled';
  subject: {
    reference: string; // Patient/[id]
  };
  medicationCodeableConcept: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  dosageInstruction: Array<{
    text: string;
    timing?: {
      repeat: {
        frequency: number;
        period: number;
        periodUnit: string;
      };
    };
    doseAndRate?: Array<{
      doseQuantity: {
        value: number;
        unit: string;
      };
    }>;
  }>;
}

export class PluginAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = window.location.origin) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}/api/plugins${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Patient Management
  async getPatient(patientId: string): Promise<FHIRPatient> {
    return this.makeRequest(`/patient/${patientId}`);
  }

  async createPatient(patient: Partial<FHIRPatient>): Promise<FHIRPatient> {
    return this.makeRequest('/patient', {
      method: 'POST',
      body: JSON.stringify(patient),
    });
  }

  async updatePatient(patientId: string, updates: Partial<FHIRPatient>): Promise<FHIRPatient> {
    return this.makeRequest(`/patient/${patientId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Prescription Management
  async createPrescription(prescription: {
    patientId: string;
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }>;
    doctorName: string;
  }): Promise<{ id: string; fhirResource: FHIRMedicationRequest }> {
    return this.makeRequest('/prescription', {
      method: 'POST',
      body: JSON.stringify(prescription),
    });
  }

  async analyzePrescription(prescriptionData: {
    medications: Array<any>;
    patientId?: string;
    patientAge?: number;
    patientConditions?: string[];
  }): Promise<{
    drugInteractions: Array<any>;
    adverseReactions: Array<any>;
    dosageValidation: Array<any>;
    recommendations: Array<any>;
  }> {
    return this.makeRequest('/prescription/analyze', {
      method: 'POST',
      body: JSON.stringify(prescriptionData),
    });
  }

  // Medical Image Interpretation
  async interpretMedicalImage(imageData: {
    imageUrl: string;
    imageType: string;
    patientContext?: string;
    urgency?: 'low' | 'medium' | 'high';
  }): Promise<{
    findings: string;
    recommendations: string;
    confidence: number;
    urgency?: string;
    urgencyReason?: string;
  }> {
    return this.makeRequest('/medical-image/interpret', {
      method: 'POST',
      body: JSON.stringify(imageData),
    });
  }

  // Voice Processing
  async processVoiceCommand(command: string): Promise<{
    action: string;
    parameters: any;
    response: string;
  }> {
    return this.makeRequest('/voice/command', {
      method: 'POST',
      body: JSON.stringify({ command }),
    });
  }

  async transcribeAudio(audioData: string): Promise<{
    transcript: string;
    confidence: number;
  }> {
    return this.makeRequest('/voice/transcribe', {
      method: 'POST',
      body: JSON.stringify({ audioData }),
    });
  }

  // FHIR Integration
  async syncWithFHIR(fhirData: any): Promise<void> {
    return this.makeRequest('/fhir/sync', {
      method: 'POST',
      body: JSON.stringify(fhirData),
    });
  }

  async getFHIRResource(resourceType: string, resourceId: string): Promise<any> {
    return this.makeRequest(`/fhir/${resourceType}/${resourceId}`);
  }

  // Analytics and Reporting
  async getUsageAnalytics(timeframe: '7d' | '30d' | '90d' = '30d'): Promise<{
    totalRequests: number;
    prescriptionsCreated: number;
    imagesAnalyzed: number;
    voiceCommands: number;
    errors: number;
  }> {
    return this.makeRequest(`/analytics?timeframe=${timeframe}`);
  }

  // Health Check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    services: {
      database: boolean;
      ai: boolean;
      storage: boolean;
    };
  }> {
    return this.makeRequest('/health');
  }
}

export default PluginAPI;
