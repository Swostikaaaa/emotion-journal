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
    // Request microphone permission
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (permError) {
      setError('Microphone permission denied. Please allow microphone access.');
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Your browser does not support speech recognition. Try Chrome, Edge, or Safari.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;        // Keep listening until stopped
    recognition.interimResults = true;    // Show text as you speak
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      // Send the combined text (final + interim) to the parent
      onTranscript(finalTranscript + interimTranscript);
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
    setIsListening(true);
    setError(null);
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
      {isListening && <span className="text-sm text-white/80 animate-pulse">🎙️ Recording... (click mic to stop)</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
