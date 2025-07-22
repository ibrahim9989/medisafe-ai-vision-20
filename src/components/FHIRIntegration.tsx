import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { createEpicFHIRService } from '@/services/fhirService';
import { 
  Database, 
  User, 
  Heart, 
  Pill, 
  AlertTriangle, 
  Activity,
  CheckCircle,
  ExternalLink 
} from 'lucide-react';

const FHIRIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fhirService] = useState(() => createEpicFHIRService());
  const { toast } = useToast();

  useEffect(() => {
    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      handleOAuthCallback(code, state);
    }
  }, []);

  const handleOAuthCallback = async (code: string, state: string) => {
    setLoading(true);
    try {
      const tokenResponse = await fhirService.exchangeCodeForToken(code, state);
      setIsConnected(true);
      
      // Fetch patient data if patient ID is available
      if (tokenResponse.patient) {
        await fetchPatientData(tokenResponse.patient);
      }

      toast({
        title: "FHIR Connected",
        description: "Successfully connected to Epic FHIR server",
      });

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('OAuth callback error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to FHIR server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const connectToEpic = () => {
    const authUrl = fhirService.generateAuthUrl();
    window.location.href = authUrl;
  };

  const fetchPatientData = async (patientId: string) => {
    try {
      const [patient, observations, medications, allergies, conditions] = await Promise.all([
        fhirService.getPatient(patientId),
        fhirService.getObservations(patientId, 'vital-signs'),
        fhirService.getMedications(patientId),
        fhirService.getAllergies(patientId),
        fhirService.getConditions(patientId)
      ]);

      setPatientData({
        patient,
        observations,
        medications,
        allergies,
        conditions
      });
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast({
        title: "Data Fetch Failed",
        description: "Failed to fetch patient data from FHIR server",
        variant: "destructive",
      });
    }
  };

  const formatPatientName = (patient: any) => {
    if (!patient?.name?.[0]) return 'Unknown Patient';
    const name = patient.name[0];
    const given = name.given?.join(' ') || '';
    const family = name.family || '';
    return `${given} ${family}`.trim();
  };

  const formatObservationValue = (observation: any) => {
    if (observation.valueQuantity) {
      return `${observation.valueQuantity.value} ${observation.valueQuantity.unit}`;
    }
    if (observation.valueString) {
      return observation.valueString;
    }
    return 'No value';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Epic SMART on FHIR Integration
          </CardTitle>
          <CardDescription>
            Connect to Epic's FHIR server to access patient data securely
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="space-y-4">
              <Alert>
                <ExternalLink className="h-4 w-4" />
                <AlertDescription>
                  This will redirect you to Epic's authorization server to grant access to patient data.
                  Make sure you have appropriate permissions and patient consent.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={connectToEpic} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Connecting...' : 'Connect to Epic FHIR'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Connected to Epic FHIR</span>
                <Badge variant="secondary">Active</Badge>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setIsConnected(false)}
                size="sm"
              >
                Disconnect
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {patientData && (
        <div className="space-y-6">
          {/* Patient Demographics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-sm">{formatPatientName(patientData.patient)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Gender</label>
                  <p className="text-sm capitalize">{patientData.patient.gender || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Birth Date</label>
                  <p className="text-sm">{patientData.patient.birthDate || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID</label>
                  <p className="text-sm font-mono">{patientData.patient.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vital Signs */}
          {patientData.observations?.entry?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Vital Signs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patientData.observations.entry.slice(0, 5).map((entry: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {entry.resource.code?.coding?.[0]?.display || 'Unknown Observation'}
                      </span>
                      <span className="text-sm">
                        {formatObservationValue(entry.resource)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Medications */}
          {patientData.medications?.entry?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patientData.medications.entry.slice(0, 5).map((entry: any, index: number) => (
                    <div key={index} className="space-y-1">
                      <div className="font-medium text-sm">
                        {entry.resource.medicationCodeableConcept?.coding?.[0]?.display || 'Unknown Medication'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Status: {entry.resource.status || 'Unknown'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Allergies */}
          {patientData.allergies?.entry?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Allergies & Intolerances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patientData.allergies.entry.map((entry: any, index: number) => (
                    <div key={index} className="space-y-1">
                      <div className="font-medium text-sm">
                        {entry.resource.code?.coding?.[0]?.display || 'Unknown Allergen'}
                      </div>
                      <Badge variant={entry.resource.clinicalStatus?.coding?.[0]?.code === 'active' ? 'destructive' : 'secondary'}>
                        {entry.resource.clinicalStatus?.coding?.[0]?.display || 'Unknown Status'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conditions */}
          {patientData.conditions?.entry?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Medical Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patientData.conditions.entry.slice(0, 5).map((entry: any, index: number) => (
                    <div key={index} className="space-y-1">
                      <div className="font-medium text-sm">
                        {entry.resource.code?.coding?.[0]?.display || 'Unknown Condition'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Onset: {entry.resource.onsetDateTime || 'Unknown'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default FHIRIntegration;