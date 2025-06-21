import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConsultationRecorderProps {
  patientId?: string;
  onTranscriptComplete?: (data: any) => void;
}

const ConsultationRecorder: React.FC<ConsultationRecorderProps> = ({
  patientId,
  onTranscriptComplete
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
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
      
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      toast.success('Recording started');
      
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
      toast.success('Recording stopped');
    }
  };

  const processRecording = async () => {
    if (audioChunksRef.current.length === 0) {
      toast.error('No audio recorded');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Preparing audio...');

    try {
      // Combine audio chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      console.log('Audio blob size:', audioBlob.size);

      if (audioBlob.size === 0) {
        throw new Error('No audio data recorded');
      }

      // Convert to base64
      setProcessingStatus('Converting audio...');
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      console.log('Base64 audio length:', base64Audio.length);

      // Get doctor profile for doctor_id
      setProcessingStatus('Getting doctor information...');
      const { data: doctorProfile, error: doctorError } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (doctorError || !doctorProfile) {
        throw new Error('Doctor profile not found. Please complete your profile setup.');
      }

      // Call the consultation transcript function
      setProcessingStatus('Transcribing audio with AI...');
      console.log('Calling consultation-transcript function...');
      
      const { data: result, error } = await supabase.functions.invoke('consultation-transcript', {
        body: {
          audioData: base64Audio,
          patientId: patientId,
          doctorId: doctorProfile.id
        }
      });

      console.log('Function result:', result);
      console.log('Function error:', error);

      if (error) {
        console.error('Function error details:', error);
        throw new Error(error.message || 'Failed to process consultation');
      }

      if (!result?.success) {
        console.error('Processing failed:', result);
        throw new Error(result?.error || 'Failed to process consultation');
      }

      setProcessingStatus('Analysis complete!');
      toast.success('Consultation processed successfully!');

      // Call the callback with the processed data
      if (onTranscriptComplete && result.data) {
        onTranscriptComplete(result.data);
      }

      // Clear the audio chunks
      audioChunksRef.current = [];

    } catch (error) {
      console.error('Error processing recording:', error);
      toast.error(`Processing failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          AI-Powered Consultation Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Start recording to automatically transcribe and analyze the consultation. 
          The AI will extract key information, symptoms, diagnosis, and create structured notes.
        </div>
        
        <div className="flex gap-3">
          {!isRecording ? (
            <Button 
              onClick={startRecording} 
              className="flex items-center gap-2"
              disabled={isProcessing}
            >
              <Mic className="h-4 w-4" />
              Start Recording
            </Button>
          ) : (
            <Button 
              onClick={stopRecording} 
              variant="destructive" 
              className="flex items-center gap-2"
            >
              <MicOff className="h-4 w-4" />
              Stop Recording
            </Button>
          )}

          {audioChunksRef.current.length > 0 && !isRecording && (
            <Button 
              onClick={processRecording} 
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Process & Analyze
                </>
              )}
            </Button>
          )}
        </div>

        {isProcessing && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">{processingStatus}</span>
            </div>
          </div>
        )}

        {isRecording && (
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Recording in progress...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsultationRecorder;
