
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, MessageCircle } from 'lucide-react';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { PrescriptionData } from './PrescriptionForm';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface VoiceAssistantProps {
  prescriptionData: PrescriptionData;
  onPrescriptionChange: (data: PrescriptionData) => void;
  className?: string;
}

const VoiceAssistant = ({ prescriptionData, onPrescriptionChange, className }: VoiceAssistantProps) => {
  const [showTranscript, setShowTranscript] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'assistant';
    text: string;
    timestamp: Date;
  }>>([]);

  const processVoiceCommand = async (transcript: string) => {
    // Add user message to conversation
    setConversationHistory(prev => [...prev, {
      type: 'user',
      text: transcript,
      timestamp: new Date()
    }]);

    try {
      // Use Gemini to intelligently parse the voice command
      const { data, error } = await supabase.functions.invoke('parse-voice-command', {
        body: { 
          transcript: transcript,
          currentData: prescriptionData
        }
      });

      if (error) {
        console.error('Voice command parsing error:', error);
        speakResponse("Sorry, I had trouble understanding that command.");
        return;
      }

      console.log('Parsed voice command:', data);

      // Apply the updates based on the parsed command
      if (data.action === 'update_field' && data.updates) {
        const updatedData = { ...prescriptionData };
        
        // Apply field updates
        Object.keys(data.updates).forEach(field => {
          if (field in updatedData) {
            (updatedData as any)[field] = data.updates[field];
          }
        });

        onPrescriptionChange(updatedData);
        speakResponse(data.response || "Updated successfully");
      } else if (data.action === 'add_medication' && data.updates?.medication) {
        const newMedications = [...prescriptionData.medications];
        const emptyIndex = newMedications.findIndex(med => !med.name);
        
        if (emptyIndex !== -1) {
          newMedications[emptyIndex] = {
            ...newMedications[emptyIndex],
            name: data.updates.medication.name || '',
            dosage: data.updates.medication.dosage || '',
            frequency: data.updates.medication.frequency || '',
            duration: data.updates.medication.duration || ''
          };
        } else {
          newMedications.push({
            name: data.updates.medication.name || '',
            dosage: data.updates.medication.dosage || '',
            frequency: data.updates.medication.frequency || '',
            duration: data.updates.medication.duration || ''
          });
        }
        
        onPrescriptionChange({
          ...prescriptionData,
          medications: newMedications
        });
        
        speakResponse(data.response || "Medication added successfully");
      } else if (data.action === 'help' || transcript.toLowerCase().includes('help')) {
        const helpMessage = `I can help you fill out prescriptions with voice commands. You can say things like: 
          Patient name is John Smith, 
          Age is 45, 
          Temperature is 101.2, 
          Blood pressure is 140 over 90, 
          Add medication amoxicillin 500mg, 
          or Diagnosis is acute bronchitis.`;
        speakResponse(helpMessage);
      } else {
        speakResponse(data.response || "I didn't understand that command. Try saying 'help' to see what I can do.");
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      speakResponse("Sorry, I had trouble processing that command.");
    }
  };

  const speakResponse = (text: string) => {
    // Add assistant response to conversation
    setConversationHistory(prev => [...prev, {
      type: 'assistant',
      text: text,
      timestamp: new Date()
    }]);
    
    speakText(text);
  };

  const {
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speakText,
    stopSpeaking
  } = useVoiceAssistant({
    onTranscript: processVoiceCommand,
    voiceId: 'EXAVITQu4vr4xnSDxMaL' // Sarah voice
  });

  return (
    <Card className={cn(
      "border-0 bg-white/40 backdrop-blur-xl shadow-lg rounded-xl lg:rounded-2xl ring-1 ring-white/20 relative overflow-hidden",
      className
    )}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-purple-50/10 rounded-xl lg:rounded-2xl pointer-events-none"></div>
      
      <div className="relative p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl opacity-20 blur-lg"></div>
              <div className="relative p-2 lg:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <MessageCircle className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
              </div>
            </div>
            <span className="text-lg lg:text-xl font-medium text-gray-900 tracking-wide">AI Voice Assistant</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTranscript(!showTranscript)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            {showTranscript ? 'Hide' : 'Show'} Transcript
          </Button>
        </div>

        {/* Voice Controls */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing || isSpeaking}
            className={cn(
              "relative px-6 py-6 rounded-full min-w-[80px] min-h-[80px] transition-all duration-300",
              isListening 
                ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            )}
          >
            {isListening ? (
              <MicOff className="h-8 w-8 text-white" />
            ) : (
              <Mic className="h-8 w-8 text-white" />
            )}
          </Button>

          <Button
            onClick={isSpeaking ? stopSpeaking : undefined}
            disabled={!isSpeaking}
            variant="outline"
            className={cn(
              "px-4 py-4 rounded-full",
              isSpeaking && "bg-green-50 border-green-300 text-green-700"
            )}
          >
            {isSpeaking ? (
              <VolumeX className="h-6 w-6" />
            ) : (
              <Volume2 className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Status Indicators */}
        <div className="text-center mb-4">
          {isListening && (
            <div className="text-red-600 font-medium flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span>Listening...</span>
            </div>
          )}
          {isProcessing && (
            <div className="text-blue-600 font-medium flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <span>Processing speech...</span>
            </div>
          )}
          {isSpeaking && (
            <div className="text-green-600 font-medium flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span>Speaking...</span>
            </div>
          )}
          {!isListening && !isProcessing && !isSpeaking && (
            <div className="text-gray-500">Click the microphone to start</div>
          )}
        </div>

        {/* Live Transcript */}
        {showTranscript && (
          <div className="space-y-3">
            {transcript && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-700 mb-1">Latest Command:</div>
                <div className="text-blue-900">{transcript}</div>
              </div>
            )}

            {/* Conversation History */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {conversationHistory.slice(-5).map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-lg text-sm",
                    message.type === 'user'
                      ? "bg-gray-50 border border-gray-200 ml-4"
                      : "bg-purple-50 border border-purple-200 mr-4"
                  )}
                >
                  <div className={cn(
                    "font-medium mb-1",
                    message.type === 'user' ? "text-gray-700" : "text-purple-700"
                  )}>
                    {message.type === 'user' ? 'You:' : 'AI Assistant:'}
                  </div>
                  <div className={message.type === 'user' ? "text-gray-900" : "text-purple-900"}>
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice Commands Help */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">Smart Voice Commands:</div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>• "Patient name is John Smith"</div>
            <div>• "Age is 45" or "Age is forty-five"</div>
            <div>• "Temperature is 101.2 degrees"</div>
            <div>• "Blood pressure is 140 over 90"</div>
            <div>• "Add medication amoxicillin 500mg"</div>
            <div>• "Diagnosis is acute bronchitis"</div>
            <div>• "Help" - for more commands</div>
            <div className="text-purple-600 font-medium">✨ Powered by Gemini AI for smart recognition</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VoiceAssistant;
