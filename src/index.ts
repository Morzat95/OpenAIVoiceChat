import { SpeechToTextService } from "./services/speechToText/SpeechToTextService";
import { GoogleSpeechToTextService } from "./services/speechToText/GoogleSpeechToTextService";
import { AudioConverter } from "./services/converter/AudioConverter";
import { OpenAiService } from "./services/openai/OpenAIService";
import { AudioDownloader } from "./services/downloader/AudioDownloader";
import { config } from "./configuration/config";
import * as dotenv from "dotenv";
import { CallbackQuery, Message } from "node-telegram-bot-api";
import * as fs from "fs";
import RedisStorage from "./services/storage/RedisStorage";
import { StorageService } from "./services/storage/StorageService";
const TelegramBot = require("node-telegram-bot-api");

dotenv.config();

const audioDownloader = new AudioDownloader();
const audioConverter = new AudioConverter();
const speechToTextService: SpeechToTextService = new GoogleSpeechToTextService(
	process.env.GOOGLE_APPLICATION_CREDENTIALS as string
);
const openAiService = new OpenAiService(process.env.OPENAI_API_KEY as string);
const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, { polling: true });

// Redis configuration
const storageService: StorageService<ChatMessage> = new RedisStorage();

export interface ChatMessage {
	role: string;
	content: string;
}

bot.onText(/\/start/, async (msg: Message) => {
	const firstBotMessage = await bot.sendMessage(
		msg.chat.id,
		`Hello! I am a Telegram bot designed to assist you with various tasks. My mission is to translate any of your voice messages so you can recieve a response from ChatGPT-3. You can find more info at https://github.com/Morzat95/OpenAIVoiceChat\n\nYou can configure the language with the /language command`
	);
	bot.pinChatMessage(msg.chat.id, firstBotMessage.message_id);
});

bot.onText(/\/language/, (msg: Message) => {
	bot.sendMessage(msg.chat.id, "Please select a language", {
		reply_markup: {
			inline_keyboard: config.languages,
		},
	});
});

bot.on("callback_query", (callbackQuery: CallbackQuery) => {
	const languageCode = `${callbackQuery.data}`;
	bot.answerCallbackQuery(callbackQuery.id).then(async () => {
		await storageService.setLanguage(
			callbackQuery.from.id.toString(),
			languageCode
		);
		const languageName = config.languages
			.flatMap((languageGroup) => languageGroup)
			.filter((language) => language.callback_data === languageCode)
			.map((language) => language.text);
		bot.sendMessage(callbackQuery.from.id, `You selected ${languageName}`);
	});
});

bot.on("text", async (msg: Message) => {
	if (msg.from?.id) {
		// Get the text message sent by the user
		const userInput = msg.text;

		if (userInput !== undefined && !userInput.startsWith("/")) {
			const chatId = String(msg.chat.id);

			// Get the messages from Storage
			const chatHistory: ChatMessage[] = await storageService.getChatHistory(
				msg.from?.id.toString()
			);

			// Add the user message to the history
			chatHistory.push({
				role: "user",
				content: userInput,
			});

			// Make the request to the OpenAI API
			const response = await openAiService.generateText(chatHistory);

			// Add the response message to the history
			chatHistory.push(response);

			// Save last 2 messages
			storageService.addChatMessages(
				msg.from?.id.toString(),
				chatHistory.slice(-2)
			);

			// Send the response to the chat
			bot.sendMessage(chatId, response.content, { parse_mode: "Markdown" });
		}
	}
});

bot.on("voice", async (msg: Message) => {
	if (msg.from?.id) {
		const chatId = String(msg.chat.id);

		// Get the file_id of the audio message
		const file_id = msg.voice?.file_id;

		// Use the Telegram Bot API to get the file path for the audio message
		const file_path = await bot.getFileLink(file_id);

		// Download the audio file
		const downloadedAudioFile = replaceTemplateString(
			config.audioDownloader.outputFile,
			chatId
		);
		await audioDownloader.download(file_path, downloadedAudioFile);

		// Convert the audio file to a format supported by Google Cloud Speech to Text Service
		const convertedAudioFile = replaceTemplateString(
			config.audioConverter.outputFile,
			chatId
		);
		await audioConverter.convertToRaw(downloadedAudioFile, convertedAudioFile);

		// Use the speech-to-text service to transcribe the audio message
		const languageCode = await storageService.getLanguage(
			msg.from?.id.toString()
		);

		const transcription = await speechToTextService.transcribe(
			convertedAudioFile,
			languageCode
		);

		bot.sendMessage(chatId, `You told me: ${transcription}`);

		// Delete the audio files no longer needed
		[downloadedAudioFile, convertedAudioFile].forEach((file) =>
			fs.unlink(file, (error) => {
				if (error) console.error(error);
			})
		);

		// Get the messages from Storage
		const chatHistory = await storageService.getChatHistory(
			msg.from?.id.toString()
		);

		// Add the user message to the history
		chatHistory.push({
			role: "user",
			content: transcription,
		});

		// Make the request to the OpenAI API
		const response = await openAiService.generateText(chatHistory);

		// Add the response message to the history
		chatHistory.push(response);

		// Save last 2 messages
		storageService.addChatMessages(
			msg.from?.id.toString(),
			chatHistory.slice(-2)
		);

		// Send the response to the chat
		bot.sendMessage(chatId, response.content, { parse_mode: "Markdown" });
	}
});

function replaceTemplateString(template: string, chatId: string) {
	return template.replace("{{chatId}}", chatId);
}
