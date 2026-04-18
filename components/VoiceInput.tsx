// components/VoiceInput.tsx
// A reusable microphone button component that uses the Web Speech API
// to convert speech to text in real time. It supports continuous listening
// and interim results (showing text as you speak).

'use client';

import { useState, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;  // Callback when transcript updates
  isListening: boolean;                  // Whether microphone is currently active
  setIsListening: (value: boolean) => void; // Setter for listening state
}

export default function VoiceInput({ onTranscript, isListening, setIsListening }: VoiceInputProps) {
  const recognitionRef = useRef<any>(null); // Hold recognition instance to allow stopping
  const [error, setError] = useState<string | null>(null);

  // Request microphone permission and start speech recognition
  const startListening = async () => {
    // Request explicit microphone permission
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (permError) {
      setError('Microphone permission denied. Please allow microphone access.');
      return;
    }

    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Your browser does not support speech recognition. Try Chrome, Edge, or Safari.');
      return;
    }

    // Use Web Speech API (webkit prefix for older browsers)
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;        // Keep listening until manually stopped
    recognition.interimResults = true;    // Show partial results as user speaks
    recognition.lang = 'en-US';

    let finalTranscript = ''; // Accumulate final (confirmed) words

    // Called whenever new speech is recognised
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
      // Send combined final + interim text to parent component (real‑time update)
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
      setIsListening(false); // Ensure button state resets when recognition stops
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    setError(null);
  };

  // Stop the recognition manually (user clicked the button again)
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
      {/* Status message while recording */}
      {isListening && <span className="text-sm text-white/80 animate-pulse">🎙️ Recording... (click mic to stop)</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}