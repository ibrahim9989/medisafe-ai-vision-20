
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, MessageCircle, X, Minimize2 } from 'lucide-react';
import { useGlobalVoiceAgent } from '@/hooks/useGlobalVoiceAgent';
import { cn } from '@/lib/utils';

interface GlobalVoiceControlProps {
  className?: string;
}

const GlobalVoiceControl = ({ className }: GlobalVoiceControlProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  const {
    isListening,
    isProcessing,
    isSpeaking,
    lastCommand,
    startListening,
    stopListening,
    stopSpeaking
  } = useGlobalVoiceAgent();

  // Auto-expand when listening or processing
  useEffect(() => {
    if (isListening || isProcessing || isSpeaking) {
      setIsExpanded(true);
      setIsMinimized(false);
    }
  }, [isListening, isProcessing, isSpeaking]);

  if (isMinimized) {
    return (
      <div className={cn(
        "fixed bottom-6 right-6 z-50",
        className
      )}>
        <Button
          onClick={() => setIsMinimized(false)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 transition-all duration-300",
      className
    )}>
      <Card className={cn(
        "border-0 bg-white/90 backdrop-blur-xl shadow-xl ring-1 ring-white/20 transition-all duration-300",
        isExpanded ? "w-80" : "w-64"
      )}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg opacity-20 blur-lg"></div>
                <div className="relative p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
              </div>
              <span className="font-medium text-gray-900">Global Voice Agent</span>
            </div>
            
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Voice Controls */}
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing || isSpeaking}
              className={cn(
                "relative px-4 py-4 rounded-full min-w-[60px] min-h-[60px] transition-all duration-300",
                isListening 
                  ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              )}
            >
              {isListening ? (
                <MicOff className="h-6 w-6 text-white" />
              ) : (
                <Mic className="h-6 w-6 text-white" />
              )}
            </Button>

            <Button
              onClick={isSpeaking ? stopSpeaking : undefined}
              disabled={!isSpeaking}
              variant="outline"
              className={cn(
                "px-3 py-3 rounded-full",
                isSpeaking && "bg-green-50 border-green-300 text-green-700"
              )}
            >
              {isSpeaking ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Status */}
          <div className="text-center mb-3">
            {isListening && (
              <div className="text-red-600 font-medium flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Listening for commands...</span>
              </div>
            )}
            {isProcessing && (
              <div className="text-blue-600 font-medium flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <span className="text-sm">Processing command...</span>
              </div>
            )}
            {isSpeaking && (
              <div className="text-green-600 font-medium flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Speaking response...</span>
              </div>
            )}
            {!isListening && !isProcessing && !isSpeaking && (
              <div className="text-gray-500 text-sm">Ready for voice commands</div>
            )}
          </div>

          {/* Last Command */}
          {isExpanded && lastCommand && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs font-medium text-gray-700 mb-1">Last Command:</div>
              <div className="text-sm text-gray-900">{lastCommand}</div>
            </div>
          )}

          {/* Quick Help */}
          {isExpanded && (
            <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-xs font-medium text-purple-700 mb-1">Voice Commands:</div>
              <div className="text-xs text-purple-600 space-y-1">
                <div>• "Go home" - Navigate to homepage</div>
                <div>• "Download PDF" - Export documents</div>
                <div>• "Switch to history" - Change tabs</div>
                <div>• "Clear form" - Reset current form</div>
                <div>• "Fill prescription..." - Complete form with voice data</div>
                <div>• "Sign out" - Logout</div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default GlobalVoiceControl;
