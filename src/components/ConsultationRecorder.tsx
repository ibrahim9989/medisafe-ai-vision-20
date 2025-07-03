
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConsultationRecorderProps {
  patientId?: string;
  onTranscriptComplete?: (data: any) => void;
  onConsultationComplete?: (consultationData: any) => void;
}

const ConsultationRecorder: React.FC<ConsultationRecorderProps> = ({
  patientId,
  onTranscriptComplete,
  onConsultationComplete
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [lastTranscript, setLastTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
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
      
      mediaRecorder.start(1000);
      setIsRecording(true);
      toast.success('🎤 Recording started - speak now!');
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      toast.success('🛑 Recording stopped');
    }
  };

  const processRecording = async () => {
    if (audioChunksRef.current.length === 0) {
      toast.error('No audio recorded. Please record some audio first.');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Preparing audio...');

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      console.log('🎵 Audio blob created, size:', audioBlob.size);

      if (audioBlob.size === 0) {
        throw new Error('No audio data recorded');
      }

      setProcessingStatus('Converting audio to base64...');
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      console.log('📝 Base64 audio length:', base64Audio.length);

      setProcessingStatus('Getting doctor profile...');
      const { data: doctorProfile, error: doctorError } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (doctorError || !doctorProfile) {
        throw new Error('Doctor profile not found. Please complete your profile setup.');
      }

      setProcessingStatus('🤖 Processing with AI...');
      console.log('🚀 Calling consultation-transcript function...');

      const { data, error } = await supabase.functions.invoke('consultation-transcript', {
        body: {
          audio: base64Audio,
          doctor_id: doctorProfile.id,
          patient_id: patientId
        }
      });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error(error.message || 'Failed to process consultation');
      }

      console.log('✅ Consultation transcript result:', data);

      const consultationData = {
        transcript: data.transcript,
        summary: data.summary,
        diagnosis: data.diagnosis,
        diagnosisDetails: data.diagnosis_details || '',
        underlyingConditions: data.underlying_conditions || '',
        chiefComplaint: data.chief_complaint,
        actionItems: data.action_items,
        followUpInstructions: data.follow_up_instructions,
        analysisData: data.analysis_data
      };

      // Store the transcript for display
      setLastTranscript(data.transcript || 'No transcript generated');

      // Call both callbacks if they exist
      if (onTranscriptComplete) {
        console.log('📤 Calling onTranscriptComplete...');
        onTranscriptComplete(consultationData);
      }

      if (onConsultationComplete) {
        console.log('📤 Calling onConsultationComplete with enhanced data:', consultationData);
        onConsultationComplete(consultationData);
      }

      toast.success('✅ Consultation processed successfully!');

    } catch (error) {
      console.error('💥 Error processing consultation:', error);
      toast.error(`Failed to process consultation: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
      audioChunksRef.current = [];
    }
  };

  return (
    <Card className="border-0 bg-white/40 backdrop-blur-xl shadow-lg shadow-gray-900/5 rounded-xl lg:rounded-2xl ring-1 ring-white/20">
      <CardHeader className="pb-4 lg:pb-6">
        <CardTitle className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 rounded-xl opacity-20 blur-lg"></div>
            <div className="relative p-2 lg:p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
              <Mic className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </div>
          </div>
          <span className="text-lg lg:text-xl font-medium text-gray-900 tracking-wide">Voice Consultation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 lg:space-y-6 p-4 lg:p-6 pt-0">
        <div className="text-center">
          <p className="text-gray-600 mb-4 text-sm lg:text-base">
            Record your consultation to automatically extract patient info, diagnosis, underlying conditions, and treatment plans
          </p>
          
          <div className="flex justify-center space-x-4 mb-4">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
              } text-white shadow-lg`}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-5 w-5 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
            
            <Button
              onClick={processRecording}
              disabled={isRecording || isProcessing || audioChunksRef.current.length === 0}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg transition-all duration-300"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 mr-2" />
                  Process Recording
                </>
              )}
            </Button>
          </div>
          
          {processingStatus && (
            <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg mb-4">
              {processingStatus}
            </div>
          )}

          {lastTranscript && (
            <div className="text-left bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-medium text-gray-700 mb-2">Last Transcript:</h4>
              <p className="text-sm text-gray-600">{lastTranscript}</p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 lg:p-6 rounded-xl border border-green-100">
          <h4 className="font-medium text-green-900 mb-3 text-sm lg:text-base">Voice Recognition Features</h4>
          <div className="text-xs lg:text-sm text-green-800 space-y-2">
            <div>• Automatically extracts patient information (name, age, gender)</div>
            <div>• Identifies diagnosis and underlying conditions</div>
            <div>• Captures vital signs and symptoms</div>
            <div>• Extracts medications and treatment plans</div>
            <div>• Fills consultation notes and recommendations</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsultationRecorder;
