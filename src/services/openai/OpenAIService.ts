import { Configuration, OpenAIApi } from "openai";
import { ChatMessage } from "../..";

export class OpenAiService {
	openai: any;

	constructor(apiKey: string) {
		const configuration = new Configuration({
			apiKey: apiKey,
		});
		this.openai = new OpenAIApi(configuration);
	}

	async generateText(messages: ChatMessage[]): Promise<ChatMessage> {
		const response = await this.openai.createChatCompletion({
			messages: messages,
			model: "gpt-3.5-turbo",
			max_tokens: 300,
		});
		return response.data.choices[0].message;
	}
}
