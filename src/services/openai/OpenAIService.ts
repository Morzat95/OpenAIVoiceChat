import { Configuration, OpenAIApi } from "openai";

export class OpenAiService {
	openai: any;

	constructor(apiKey: string) {
		const configuration = new Configuration({
			apiKey: apiKey,
		});
		this.openai = new OpenAIApi(configuration);
	}

	async generateText(prompt: string) {
		const response = await this.openai.createCompletion({
			prompt: prompt,
			model: "text-davinci-003",
			temperature: 0,
			max_tokens: 300,
			best_of: 3,
		});
		return response.data.choices[0].text;
	}
}
