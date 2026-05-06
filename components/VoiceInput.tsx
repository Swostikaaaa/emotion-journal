'use client';

// React hooks for state, refs, and side effects
import { useState, useRef, useEffect } from 'react';
// Icons for microphone on/off states
import { Mic, MicOff } from 'lucide-react';

// Props expected by the VoiceInput component
interface VoiceInputProps {
  onTranscript: (text: string) => void;    // Sends incremental voice text to parent
  isListening: boolean;                    // Whether mic is currently active (controlled by parent)
  setIsListening: (value: boolean) => void; // Tells parent to update listening state
}

export default function VoiceInput({ onTranscript, isListening, setIsListening }: VoiceInputProps) {
  // Holds the Web Speech API recognition instance so we can stop it later
  const recognitionRef = useRef<any>(null);
  // Stores the entire recognized text of the current session – used to calculate the delta (new characters)
  const accumulatedTextRef = useRef<string>('');
  // Error message to display to the user (e.g., permission denied)
  const [error, setError] = useState<string | null>(null);
  // Detect iOS devices (speech recognition works poorly there)
  const [isIOS, setIsIOS] = useState(false);

  // Detect iOS using the user agent string
  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);
  }, []);

  // Starts voice recognition (microphone)
  const startListening = async () => {
    // Warn iOS users about limitations
    if (isIOS) {
      setError('Voice input on iOS has limitations. Use desktop Chrome/Safari for the best experience.');
      return;
    }

    // Request microphone permission; catch denial early
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (permError) {
      setError('Microphone permission denied. Please allow microphone access.');
      return;
    }

    // Check if browser supports the Speech Recognition API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Your browser does not support speech recognition. Try Chrome, Edge, or Safari.');
      return;
    }

    // Reset the accumulated text for this new session
    accumulatedTextRef.current = '';

    // Get the correct constructor (webkit prefix for Chrome, standard for others)
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    // Configure recognition: continuous listening, return interim results, English language
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Buffers that persist across multiple `onresult` calls (thanks to closure)
    let finalTranscript = '';
    let interimTranscript = '';

    // Called whenever the recognizer has new text (words are being recognised)
    recognition.onresult = (event: any) => {
      interimTranscript = '';
      // Build the full recognised text from the event
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      const currentFullText = finalTranscript + interimTranscript;
      // Compute the text that is *new* since the last time we sent anything
      const previousText = accumulatedTextRef.current;
      let deltaText = '';
      if (currentFullText.length > previousText.length) {
        deltaText = currentFullText.slice(previousText.length);
      }
      // If there is any new text, send it to the parent and update the reference
      if (deltaText) {
        onTranscript(deltaText);
        accumulatedTextRef.current = currentFullText;
      }
    };

    // Handle errors (no speech, permission blocked, etc.)
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

    // Called when recognition stops (either by the user or automatically)
    recognition.onend = () => {
      setIsListening(false);
    };

    // Start listening
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    setError(null);
  };

  // Stops the current voice recognition session
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Render the microphone button and status messages
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
      {isListening && (
        <span className="text-sm text-white/80 animate-pulse">🎙️ Recording... (click mic to stop)</span>
      )}
      {error && <span className="text-xs text-red-500">{error}</span>}
      {isIOS && !error && (
        <span className="text-xs text-orange-600">
          ⚠️ On iPhone, voice input may be limited.
        </span>
      )}
    </div>
  );
}