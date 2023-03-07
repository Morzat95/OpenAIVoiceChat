import * as speech from "@google-cloud/speech";
import * as fs from "fs";
import { SpeechToTextService } from "./SpeechToTextService";

export class GoogleSpeechToTextService implements SpeechToTextService {
	client: any;
	apiKey: string;

	constructor(apiKey: string) {
		this.client = new speech.SpeechClient({
			keyFilename: apiKey,
		});
		this.apiKey = apiKey;
	}

	async transcribe(audioFile: string, languageCode: string): Promise<string> {
		const audioBytes = fs.readFileSync(audioFile).toString("base64");

		const audio = {
			content: audioBytes,
		};
		const config = {
			encoding: "LINEAR16",
			sampleRateHertz: 16000,
			languageCode: languageCode,
		};
		const request = {
			audio: audio,
			config: config,
		};

		const [response] = await this.client.recognize(request);
		const transcription = response.results
			.map(
				(result: { alternatives: { transcript: any }[] }) =>
					result.alternatives[0].transcript
			)
			.join("\n");
		return transcription;
	}
}
