// Interface for Speech to Text service
export interface SpeechToTextService {
	transcribe(audioFile: string): Promise<string>;
}
