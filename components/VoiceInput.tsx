'use client';

// Import React hooks and the Mic/MicOff icons from lucide-react
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

// Define the props interface for the VoiceInput component
interface VoiceInputProps {
  onTranscript: (text: string) => void;    // Callback to send transcribed text to parent
  isListening: boolean;                    // External state indicating if listening is active
  setIsListening: (value: boolean) => void; // Function to update listening state
}

// Main component that handles voice recognition using the Web Speech API
export default function VoiceInput({ onTranscript, isListening, setIsListening }: VoiceInputProps) {
  // Ref to hold the recognition instance so we can stop it later
  const recognitionRef = useRef<any>(null);
  // State for displaying error messages to the user
  const [error, setError] = useState<string | null>(null);
  // State to detect if the user is on an iOS device (which has limited speech recognition support)
  const [isIOS, setIsIOS] = useState(false);

  // Detect iOS (iPhone, iPad, iPod) using user agent string
  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);
  }, []);

  // Function to start voice recognition
  const startListening = async () => {
    // Warn iOS users about limitations and exit early
    if (isIOS) {
      setError('Voice input on iOS has limitations. Use desktop Chrome/Safari for the best experience.');
      return;
    }

    // Request microphone permission explicitly to catch denial early
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (permError) {
      setError('Microphone permission denied. Please allow microphone access.');
      return;
    }

    // Check if the browser supports SpeechRecognition (webkit prefix for Chrome, standard for others)
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Your browser does not support speech recognition. Try Chrome, Edge, or Safari.');
      return;
    }

    // Get the appropriate SpeechRecognition constructor
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    // Configure recognition: continuous listening, return interim results, language English
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Buffer for the final transcript (accumulates across multiple results)
    let finalTranscript = '';

    // Handle results as they come from the speech recognizer
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      // Iterate over all result chunks from the event
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          // Add final chunks to the permanent buffer with a space
          finalTranscript += transcript + ' ';
        } else {
          // Build the current interim transcript
          interimTranscript += transcript;
        }
      }
      // Send the combined final + interim text to the parent component
      onTranscript(finalTranscript + interimTranscript);
    };

    // Handle any errors that occur during recognition
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access blocked. Please allow microphone in browser settings.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else {
        setError(`Error: ${event.error}`);
      }
      // Ensure the listening state is turned off on error
      setIsListening(false);
    };

    // When recognition ends naturally (or stopped), update the listening state
    recognition.onend = () => {
      setIsListening(false);
    };

    // Start the recognition engine
    recognition.start();
    // Store the recognition instance in the ref for later stopping
    recognitionRef.current = recognition;
    // Update the listening state to true
    setIsListening(true);
    // Clear any previous error messages
    setError(null);
  };

  // Function to stop voice recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();      // Stop the recognition service
      setIsListening(false);              // Update the listening state
    }
  };

  // Render the UI: a button with mic icon, plus status messages
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        className={`p-2 rounded-full transition ${
          isListening
            ? 'bg-red-500 text-white animate-pulse'   // Active recording style
            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' // Inactive style
        }`}
        title={isListening ? 'Stop recording' : 'Start voice input'}
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </button>
      {/* Show recording indicator only when listening */}
      {isListening && <span className="text-sm text-white/80 animate-pulse">🎙️ Recording... (click mic to stop)</span>}
      {/* Display error message if any */}
      {error && <span className="text-xs text-red-500">{error}</span>}
      {/* Extra hint for iOS users when no error is present */}
      {isIOS && !error && (
        <span className="text-xs text-orange-600">⚠️ On iPhone, voice input may be limited. Typing works well.</span>
      )}
    </div>
  );
}