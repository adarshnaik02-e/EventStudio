// Minimal ambient declarations for the Web Speech API (not in TS DOM lib).
interface SpeechRecognitionResultShape {
  readonly length: number;
  item(index: number): { transcript: string };
  [index: number]: { transcript: string };
}

interface SpeechRecognitionEvent extends Event {
  readonly results: {
    readonly length: number;
    item(index: number): SpeechRecognitionResultShape;
    [index: number]: SpeechRecognitionResultShape;
  };
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare const SpeechRecognition: { new (): SpeechRecognition };

interface Window {
  SpeechRecognition?: { new (): SpeechRecognition };
  webkitSpeechRecognition?: { new (): SpeechRecognition };
}
