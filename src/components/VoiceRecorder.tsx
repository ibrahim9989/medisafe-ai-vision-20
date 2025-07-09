
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onTranscriptionComplete: (data: {
    transcription: string;
    analysis: any;
  }) => void;
}

const VoiceRecorder = ({ onTranscriptionComplete }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      console.log('🎤 Starting recording...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        processAudio();
      };

      mediaRecorder.start(1000); // Collect data every 1 second
      setIsRecording(true);
      
      toast({
        title: "🎤 Recording Started",
        description: "Speak clearly for best transcription results",
      });
      
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please check microphone permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('⏹️ Stopping recording...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async () => {
    if (chunksRef.current.length === 0) {
      console.error('❌ No audio data to process');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('🔄 Processing audio...');
      
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Audio = (reader.result as string).split(',')[1];
          
          console.log('📤 Sending audio for transcription...');
          
          const { data, error } = await supabase.functions.invoke('voice-transcription', {
            body: { audio: base64Audio }
          });

          if (error) {
            console.error('❌ Supabase function error:', error);
            throw error;
          }

          if (data) {
            console.log('✅ Transcription received:', data);
            
            onTranscriptionComplete({
              transcription: data.transcription,
              analysis: data.analysis
            });
            
            toast({
              title: "🎉 Transcription Complete",
              description: "Audio has been transcribed and analyzed successfully!",
            });
          }
          
        } catch (error) {
          console.error('❌ Error in reader.onloadend:', error);
          toast({
            title: "Processing Error",
            description: "Failed to process audio. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.readAsDataURL(audioBlob);
      
    } catch (error) {
      console.error('❌ Error processing audio:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process audio. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {!isRecording ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={startRecording}
          disabled={isProcessing}
          className="flex items-center space-x-2"
        >
          <Mic className="h-4 w-4" />
          <span>Start Recording</span>
        </Button>
      ) : (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={stopRecording}
          className="flex items-center space-x-2 animate-pulse"
        >
          <Square className="h-4 w-4" />
          <span>Stop Recording</span>
        </Button>
      )}
      
      {isProcessing && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
