interface FHIRConfig {
  clientId: string;
  scope: string;
  redirectUri: string;
  iss: string; // FHIR server base URL
}

interface FHIRTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  patient?: string;
}

export class FHIRService {
  private config: FHIRConfig;
  private accessToken: string | null = null;

  constructor(config: FHIRConfig) {
    this.config = config;
  }

  // Generate authorization URL for Epic OAuth
  generateAuthUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope,
      state: this.generateState(),
      aud: this.config.iss
    });

    return `${this.config.iss}/oauth2/authorize?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string, state: string): Promise<FHIRTokenResponse> {
    if (!this.validateState(state)) {
      throw new Error('Invalid state parameter');
    }

    const response = await fetch(`${this.config.iss}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri,
        client_id: this.config.clientId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const tokenData: FHIRTokenResponse = await response.json();
    this.accessToken = tokenData.access_token;
    return tokenData;
  }

  // Get patient data
  async getPatient(patientId: string): Promise<any> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${this.config.iss}/Patient/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/fhir+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch patient: ${response.statusText}`);
    }

    return response.json();
  }

  // Get patient observations (vitals, lab results, etc.)
  async getObservations(patientId: string, category?: string): Promise<any> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    let url = `${this.config.iss}/Observation?patient=${patientId}`;
    if (category) {
      url += `&category=${category}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/fhir+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch observations: ${response.statusText}`);
    }

    return response.json();
  }

  // Get patient medications
  async getMedications(patientId: string): Promise<any> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${this.config.iss}/MedicationStatement?patient=${patientId}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/fhir+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch medications: ${response.statusText}`);
    }

    return response.json();
  }

  // Get patient allergies
  async getAllergies(patientId: string): Promise<any> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${this.config.iss}/AllergyIntolerance?patient=${patientId}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/fhir+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch allergies: ${response.statusText}`);
    }

    return response.json();
  }

  // Get patient conditions
  async getConditions(patientId: string): Promise<any> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${this.config.iss}/Condition?patient=${patientId}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/fhir+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch conditions: ${response.statusText}`);
    }

    return response.json();
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private validateState(state: string): boolean {
    // In a real app, you'd store the state in sessionStorage and validate it
    // For now, just check if it exists
    return state && state.length > 0;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }
}

// Default configuration for Epic sandbox
export const createEpicFHIRService = () => {
  return new FHIRService({
    clientId: 'your-app-client-id', // Replace with actual client ID
    scope: 'patient/Patient.read patient/Observation.read patient/MedicationStatement.read patient/AllergyIntolerance.read patient/Condition.read',
    redirectUri: `${window.location.origin}/fhir/callback`,
    iss: 'https://fhir.epic.com/interconnect-fhir-oauth' // Epic sandbox
  });
};