import { useCallback, useEffect, useRef, useState } from 'react';

export const useSpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAPISupported = typeof window !== 'undefined' && (("SpeechRecognition" in window) || ("webkitSpeechRecognition" in window));

  useEffect(() => {
    if (isAPISupported) {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += t + ' ';

            // Reset silence timer on final result
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
            }

            // Auto-stop after 1.5s of silence
            silenceTimerRef.current = setTimeout(() => {
              if (recognitionRef.current && isListening) {
                recognitionRef.current.stop();
              }
            }, 1500);
          } else {
            interimTranscript += t;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'aborted') {
          // Normal when we stop programmatically
          return;
        }
        if (event.error === 'no-speech') {
          setIsListening(false);
          return;
        }
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setError('Microphone access denied. Please enable it in your browser settings.');
        } else {
          setError('Speech recognition error. Please try again.');
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  const startListening = useCallback(async () => {
    // Don't start if already listening
    if (isListening) {
      return;
    }
    
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setError(null);
      setTranscript('');
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (err) {
      setError('Microphone access blocked. Please enable it in your browser settings.');
      console.error('Microphone permission error:', err);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isAPISupported,
  };
};
