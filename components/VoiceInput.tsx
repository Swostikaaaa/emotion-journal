'use client';

import { useState, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isListening: boolean;
  setIsListening: (value: boolean) => void;
}

export default function VoiceInput({ onTranscript, isListening, setIsListening }: VoiceInputProps) {
  const recognitionRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  const startListening = async () => {
    // Request microphone permission (required for iOS)
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (permError) {
      setError('Microphone permission denied. Please allow microphone access.');
      return;
    }

    // Check browser support
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      setError('Your browser does not support speech recognition. Try Chrome, Edge, or Safari.');
      return;
    }

    const recognition = new SpeechRecognition();
    // Use non‑continuous mode for iOS compatibility (stops automatically after a pause)
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access blocked. Please allow microphone in browser settings.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else {
        setError(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        className={`p-2 rounded-full transition ${
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
        }`}
        title={isListening ? 'Stop recording' : 'Start voice input'}
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </button>
      {isListening && <span className="text-sm text-white/80 animate-pulse">🎙️ Recording... (speak, then it stops automatically)</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}