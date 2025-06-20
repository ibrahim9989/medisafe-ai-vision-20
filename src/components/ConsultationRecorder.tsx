
import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Square, 
  FileText, 
  User, 
  Clock,
  Brain,
  Download,
  Save
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { usePrescriptions } from '@/hooks/usePrescriptions';

interface ConsultationData {
  transcript: string;
  summary: string;
  patientInfo: any;
  chiefComplaint: string;
  symptoms: string[];
  medicalHistory: any;
  physicalExam: any;
  diagnosis: string;
  treatmentPlan: any;
  followUp: any;
  actionItems: any;
  clinicalNotes: string;
  prescriptionData: any;
}

interface ConsultationRecorderProps {
  onConsultationComplete?: (data: ConsultationData) => void;
  onPrescriptionDataExtracted?: (prescriptionData: any) => void;
}

const ConsultationRecorder = ({ 
  onConsultationComplete, 
  onPrescriptionDataExtracted 
}: ConsultationRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { savePrescription } = usePrescriptions();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm' 
        });
        await processConsultation(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "🎤 Recording Started",
        description: "Consultation recording is now active. Speak naturally during the consultation.",
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please check microphone permissions.",
        variant: "destructive"
      });
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      toast({
        title: "🛑 Recording Stopped",
        description: "Processing consultation notes with AI...",
      });
    }
  }, [isRecording]);

  const processConsultation = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Convert audio to base64
      const reader = new FileReader();
      const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('Failed to convert audio'));
        reader.readAsDataURL(audioBlob);
      });

      // Process with AI
      const { data, error } = await supabase.functions.invoke('consultation-transcript', {
        body: { 
          audioData: base64Audio,
          patientId: null, // Will be filled when patient is selected
          doctorId: null   // Will be filled from user context
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        setConsultationData(data.data);
        onConsultationComplete?.(data.data);
        
        // Extract prescription data if available
        if (data.data.prescriptionData) {
          onPrescriptionDataExtracted?.(data.data.prescriptionData);
        }
        
        toast({
          title: "✅ Consultation Analysis Complete",
          description: "AI has processed the consultation and extracted key information.",
        });
      } else {
        throw new Error(data.error || 'Processing failed');
      }

    } catch (error) {
      console.error('Error processing consultation:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process consultation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const savePrescriptionFromConsultation = async () => {
    if (!consultationData?.prescriptionData) return;
    
    try {
      await savePrescription(consultationData.prescriptionData);
      toast({
        title: "✅ Prescription Saved",
        description: "Prescription has been created from consultation notes.",
      });
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast({
        title: "Save Error",
        description: "Failed to save prescription. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-medium">AI Consultation Recorder</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
              )}
              
              {isProcessing && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <span className="text-sm text-gray-600">Processing with AI...</span>
                </div>
              )}
            </div>
            
            {isRecording && (
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDuration(recordingDuration)}
                </Badge>
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-600">
            Click "Start Recording" to begin AI-powered consultation notes. 
            The AI will transcribe the conversation and extract medical information automatically.
          </p>
        </CardContent>
      </Card>

      {/* Consultation Results */}
      {consultationData && (
        <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Consultation Summary</span>
              </div>
              <div className="flex space-x-2">
                {consultationData.prescriptionData && (
                  <Button
                    onClick={savePrescriptionFromConsultation}
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-blue-600"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save Prescription
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
              <p className="text-gray-700 bg-white/60 p-3 rounded-lg">
                {consultationData.summary}
              </p>
            </div>

            {/* Patient Info */}
            {consultationData.patientInfo && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Patient Information
                </h4>
                <div className="bg-white/60 p-3 rounded-lg space-y-1">
                  {consultationData.patientInfo.name && (
                    <p><span className="font-medium">Name:</span> {consultationData.patientInfo.name}</p>
                  )}
                  {consultationData.patientInfo.age && (
                    <p><span className="font-medium">Age:</span> {consultationData.patientInfo.age}</p>
                  )}
                  {consultationData.patientInfo.gender && (
                    <p><span className="font-medium">Gender:</span> {consultationData.patientInfo.gender}</p>
                  )}
                </div>
              </div>
            )}

            {/* Chief Complaint & Symptoms */}
            {consultationData.chiefComplaint && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Chief Complaint</h4>
                <p className="text-gray-700 bg-white/60 p-3 rounded-lg">
                  {consultationData.chiefComplaint}
                </p>
              </div>
            )}

            {/* Diagnosis */}
            {consultationData.diagnosis && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Diagnosis</h4>
                <p className="text-gray-700 bg-white/60 p-3 rounded-lg">
                  {consultationData.diagnosis}
                </p>
              </div>
            )}

            {/* Treatment Plan */}
            {consultationData.treatmentPlan?.medications?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Medications</h4>
                <div className="space-y-2">
                  {consultationData.treatmentPlan.medications.map((med: any, index: number) => (
                    <div key={index} className="bg-white/60 p-3 rounded-lg">
                      <span className="font-medium">{med.name}</span> - 
                      {med.dosage} {med.frequency} for {med.duration}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Items */}
            {(consultationData.actionItems?.doctor?.length > 0 || consultationData.actionItems?.patient?.length > 0) && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Action Items</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {consultationData.actionItems.doctor?.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-blue-600 mb-2">For Doctor</h5>
                      <ul className="space-y-1">
                        {consultationData.actionItems.doctor.map((item: string, index: number) => (
                          <li key={index} className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {consultationData.actionItems.patient?.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-green-600 mb-2">For Patient</h5>
                      <ul className="space-y-1">
                        {consultationData.actionItems.patient.map((item: string, index: number) => (
                          <li key={index} className="text-sm text-gray-700 bg-green-50 p-2 rounded">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Full Transcript */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Full Transcript</h4>
              <div className="bg-white/60 p-3 rounded-lg max-h-48 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {consultationData.transcript}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsultationRecorder;
