
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcript: string, analysis: any) => void;
}

const VoiceRecorder = ({ onTranscriptionComplete }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      console.log('🎤 Starting voice recording...');
      
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
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = processAudio;

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      
      toast({
        title: "🎤 Recording Started",
        description: "Speak clearly into your microphone",
      });

    } catch (error) {
      console.error('❌ Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    console.log('⏹️ Stopping voice recording...');
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsProcessing(true);
      
      toast({
        title: "🔄 Processing Audio",
        description: "Transcribing and analyzing your recording...",
      });
    }
  };

  const processAudio = async () => {
    try {
      console.log('📝 Processing audio for transcription...');
      
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      console.log('Audio blob size:', audioBlob.size, 'bytes');

      if (audioBlob.size === 0) {
        throw new Error('No audio data recorded');
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Audio = (reader.result as string).split(',')[1];
          console.log('🚀 Calling voice-transcription function...');

          const { data, error } = await supabase.functions.invoke('voice-transcription', {
            body: { audio: base64Audio }
          });

          console.log('Function response:', { data, error });

          if (error) {
            console.error('Supabase function error:', error);
            throw new Error(error.message || 'Edge Function returned a non-2xx status code');
          }

          if (data?.transcript) {
            console.log('✅ Transcription successful');
            onTranscriptionComplete(data.transcript, data.analysis || {});
            
            toast({
              title: "✅ Transcription Complete",
              description: "Audio has been transcribed and analyzed successfully!",
            });
          } else {
            throw new Error('No transcript received from the service');
          }

        } catch (error) {
          console.error('Error in reader.onloadend:', error);
          toast({
            title: "Transcription Error",
            description: "Failed to process audio. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsProcessing(false);
        }
      };

      reader.onerror = () => {
        console.error('FileReader error');
        toast({
          title: "File Processing Error",
          description: "Failed to process audio file",
          variant: "destructive"
        });
        setIsProcessing(false);
      };

      reader.readAsDataURL(audioBlob);

    } catch (error) {
      console.error('❌ Error processing audio:', error);
      toast({
        title: "Processing Error",
        description: error.message || "Failed to process audio",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      {!isRecording && !isProcessing && (
        <Button
          type="button"
          onClick={startRecording}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
          size="sm"
        >
          <Mic className="h-4 w-4 mr-2" />
          Start Recording
        </Button>
      )}

      {isRecording && (
        <Button
          type="button"
          onClick={stopRecording}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white animate-pulse"
          size="sm"
        >
          <Square className="h-4 w-4 mr-2" />
          Stop Recording
        </Button>
      )}

      {isProcessing && (
        <Button
          type="button"
          disabled
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-not-allowed"
          size="sm"
        >
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Processing...
        </Button>
      )}

      {isRecording && (
        <div className="flex items-center space-x-2 text-red-600">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Recording...</span>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
