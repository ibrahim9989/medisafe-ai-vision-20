import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, MessageCircle } from 'lucide-react';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { PrescriptionData } from './PrescriptionForm';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
    console.log('=== VOICE COMMAND PROCESSING START ===');
    console.log('Processing voice command:', transcript);
    console.log('Current prescription data before update:', prescriptionData);
    
    // Add user message to conversation
    setConversationHistory(prev => [...prev, {
      type: 'user',
      text: transcript,
      timestamp: new Date()
    }]);

    try {
      // Use Gemini to intelligently parse the voice command
      console.log('Calling parse-voice-command function...');
      const { data, error } = await supabase.functions.invoke('parse-voice-command', {
        body: { 
          transcript: transcript.trim(),
          currentData: prescriptionData
        }
      });

      if (error) {
        console.error('Voice command parsing error:', error);
        speakResponse("Sorry, I had trouble understanding that command. Please try again.");
        toast({
          title: "Voice Command Error",
          description: "Failed to process voice command. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('Parsed voice command result:', data);

      // Apply the updates based on the parsed command
      if (data.action === 'update_field' && data.updates) {
        console.log('=== APPLYING FIELD UPDATES ===');
        const updatedData = { ...prescriptionData };
        console.log('Starting with prescription data:', updatedData);
        
        // Handle each field update with enhanced debugging
        Object.keys(data.updates).forEach(field => {
          console.log(`\n--- Processing field: ${field} ---`);
          console.log('Field value:', data.updates[field]);
          console.log('Field type:', typeof data.updates[field]);
          
          if (field === 'medications' && Array.isArray(data.updates.medications)) {
            console.log('=== MEDICATION HANDLING ===');
            console.log('New medications from voice:', data.updates.medications);
            console.log('Current medications in form:', updatedData.medications);
            
            // Simplified medication handling - always update the first medication slot
            const newMedications = [...updatedData.medications];
            
            data.updates.medications.forEach((voiceMed: any, index: number) => {
              console.log(`Processing voice medication ${index}:`, voiceMed);
              
              const medicationToAdd = {
                name: voiceMed.name || '',
                dosage: voiceMed.dosage || '',
                frequency: voiceMed.frequency || '',
                duration: voiceMed.duration || ''
              };
              
              console.log('Formatted medication:', medicationToAdd);
              
              // Simple logic: replace the first medication or add new one
              if (index === 0) {
                // Always put the first voice medication in the first slot
                newMedications[0] = medicationToAdd;
                console.log('Updated first medication slot');
              } else if (index < newMedications.length) {
                // Replace existing medication at this index
                newMedications[index] = medicationToAdd;
                console.log(`Updated medication slot ${index}`);
              } else {
                // Add new medication
                newMedications.push(medicationToAdd);
                console.log('Added new medication slot');
              }
            });
            
            updatedData.medications = newMedications;
            console.log('Final medications array:', updatedData.medications);
            
          } else {
            // Handle all other fields with validation
            console.log(`=== UPDATING FIELD: ${field} ===`);
            console.log('Available fields in updatedData:', Object.keys(updatedData));
            
            if (field in updatedData) {
              const oldValue = (updatedData as any)[field];
              (updatedData as any)[field] = data.updates[field];
              console.log(`✅ Updated ${field}: "${oldValue}" → "${data.updates[field]}"`);
            } else {
              console.warn(`❌ Field ${field} not found in prescription data structure`);
              console.log('Available fields:', Object.keys(updatedData));
            }
          }
        });

        console.log('=== FINAL UPDATE ===');
        console.log('Updated prescription data:', updatedData);
        console.log('Calling onPrescriptionChange...');
        
        // Force update the form state
        onPrescriptionChange(updatedData);
        
        console.log('Form update completed');
        
        // Show success message
        toast({
          title: "Voice Command Processed",
          description: data.response || "Information updated successfully",
        });
        
        // Try to speak response
        speakResponse(data.response || "Updated successfully");
        
      } else if (data.action === 'help' || transcript.toLowerCase().includes('help')) {
        const helpMessage = `I can help you fill out prescriptions with voice commands. You can say things like: 
          Patient name is John Smith, 
          Age is 45, 
          Gender is female,
          Temperature is 101.2, 
          Blood pressure is 140 over 90, 
          Add medication amoxicillin 500mg three times daily for 7 days, 
          Clinical notes patient has kidney disease,
          Follow up on June 23rd 2025,
          or Diagnosis is acute bronchitis.`;
        speakResponse(helpMessage);
      } else {
        console.log('Unknown action or no updates:', data);
        speakResponse(data.response || "I didn't understand that command. Try saying 'help' to see what I can do.");
        
        toast({
          title: "Command Not Recognized",
          description: "Try being more specific or say 'help' for examples.",
          variant: "destructive"
        });
      }
      
      console.log('=== VOICE COMMAND PROCESSING END ===\n');
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      speakResponse("Sorry, I had trouble processing that command. Please try again.");
      
      toast({
        title: "Processing Error",
        description: "Unable to process voice command. Please try again.",
        variant: "destructive"
      });
    }
  };

  const speakResponse = (text: string) => {
    // Add assistant response to conversation first
    setConversationHistory(prev => [...prev, {
      type: 'assistant',
      text: text,
      timestamp: new Date()
    }]);
    
    // Try to speak, but don't block form updates if it fails
    try {
      speakText(text);
    } catch (error) {
      console.log('TTS failed, but continuing with form updates:', error);
    }
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
            <div>• "Gender is male" or "Gender is female"</div>
            <div>• "Temperature is 101.2 degrees"</div>
            <div>• "Blood pressure is 140 over 90"</div>
            <div>• "Add medication amoxicillin 500mg three times daily for 7 days"</div>
            <div>• "Diagnosis is acute bronchitis"</div>
            <div>• "Clinical notes patient has underlying kidney disease"</div>
            <div>• "Follow up date is next week" or specific date</div>
            <div>• "Help" - for more commands</div>
            <div className="text-purple-600 font-medium">✨ Enhanced with smarter parsing</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VoiceAssistant;
