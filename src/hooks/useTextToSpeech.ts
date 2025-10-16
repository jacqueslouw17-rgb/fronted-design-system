import { useCallback, useEffect, useRef, useState } from 'react';

interface VoiceConfig {
  lang?: string;
  voiceName?: string;
  rate?: number;
  pitch?: number;
}

export const useTextToSpeech = (config?: VoiceConfig) => {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      // Load voices
      const loadVoices = () => {
        const availableVoices = synthRef.current?.getVoices() || [];
        setVoices(availableVoices);
      };

      loadVoices();
      
      // Some browsers load voices asynchronously
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void, onWordBoundary?: (index: number) => void) => {
    if (!synthRef.current) {
      console.error('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    synthRef.current.cancel();
    setCurrentWordIndex(0);

    const words = text.split(' ');
    let wordIndex = 0;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = config?.rate || 0.9;
    utterance.pitch = config?.pitch || 1.0;
    utterance.volume = 1.0;

    // Set language and voice based on config
    if (config?.lang) {
      utterance.lang = config.lang;
    }

    // Find and set specific voice if requested
    if (config?.voiceName && voices.length > 0) {
      const selectedVoice = voices.find(voice => 
        voice.name.toLowerCase().includes(config.voiceName!.toLowerCase()) ||
        voice.lang.toLowerCase().includes(config.voiceName!.toLowerCase())
      );
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    // Track word boundaries
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        wordIndex++;
        setCurrentWordIndex(wordIndex);
        if (onWordBoundary) {
          onWordBoundary(wordIndex);
        }
      }
    };

    utterance.onend = () => {
      setCurrentWordIndex(0);
      if (onEnd) onEnd();
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [config, voices]);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setCurrentWordIndex(0);
    }
  }, []);

  return { speak, stop, currentWordIndex };
};
