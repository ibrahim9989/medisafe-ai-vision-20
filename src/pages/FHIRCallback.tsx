import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createEpicFHIRService } from '@/services/fhirService';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const FHIRCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [patientData, setPatientData] = useState<any>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        toast({
          title: "Authorization Failed",
          description: `Error: ${error}`,
          variant: "destructive",
        });
        return;
      }

      if (!code || !state) {
        setStatus('error');
        toast({
          title: "Invalid Callback",
          description: "Missing authorization code or state parameter",
          variant: "destructive",
        });
        return;
      }

      try {
        const fhirService = createEpicFHIRService();
        const tokenResponse = await fhirService.exchangeCodeForToken(code, state);
        
        // Store token securely (in a real app, use secure storage)
        sessionStorage.setItem('fhir_access_token', tokenResponse.access_token);
        
        // Fetch patient data if available
        if (tokenResponse.patient) {
          const patient = await fhirService.getPatient(tokenResponse.patient);
          setPatientData(patient);
        }

        setStatus('success');
        toast({
          title: "FHIR Authorization Successful",
          description: "Successfully connected to Epic FHIR server",
        });

        // Redirect after a short delay
        setTimeout(() => {
          navigate('/home', { state: { fhirConnected: true, patientData } });
        }, 2000);

      } catch (error) {
        console.error('FHIR callback error:', error);
        setStatus('error');
        toast({
          title: "Connection Failed",
          description: "Failed to complete FHIR authorization",
          variant: "destructive",
        });
      }
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  const handleRetry = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
            
            {status === 'loading' && 'Connecting to FHIR...'}
            {status === 'success' && 'FHIR Connected!'}
            {status === 'error' && 'Connection Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <p className="text-muted-foreground">
              Processing your FHIR authorization...
            </p>
          )}
          
          {status === 'success' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Successfully connected to Epic FHIR server.
              </p>
              
              {patientData && (
                <div className="p-3 bg-muted rounded-md text-left">
                  <h4 className="font-medium text-sm">Patient Connected:</h4>
                  <p className="text-sm text-muted-foreground">
                    {patientData.name?.[0]?.given?.join(' ')} {patientData.name?.[0]?.family}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ID: {patientData.id}
                  </p>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground">
                Redirecting you back to the application...
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                There was an error connecting to the FHIR server. Please try again.
              </p>
              
              <Button onClick={handleRetry} variant="outline">
                Return to App
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FHIRCallback;