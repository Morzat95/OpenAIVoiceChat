import { SpeechToTextService } from "./services/speechToText/SpeechToTextService";
import { GoogleSpeechToTextService } from "./services/speechToText/GoogleSpeechToTextService";
import { GoogleCloudStorageService } from "./services/storage/GoogleCloudStorageService";
import { AudioConverter } from "./services/converter/AudioConverter";
import { OpenAiService } from "./services/openai/OpenAIService";
import { AudioDownloader } from "./services/downloader/AudioDownloader";
import { config } from "./configuration/config";
import * as dotenv from "dotenv";
import { Message, Update } from "node-telegram-bot-api";
const TelegramBot = require("node-telegram-bot-api");

dotenv.config();

const audioDownloader = new AudioDownloader();
const audioConverter = new AudioConverter();
const speechToTextService: SpeechToTextService = new GoogleSpeechToTextService(
	process.env.GOOGLE_APPLICATION_CREDENTIALS as string
);
const storageService = new GoogleCloudStorageService(
	process.env.STORAGE_SERVICE_NAME as string
);
const openAiService = new OpenAiService(process.env.OPENAI_API_KEY as string);
const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, { polling: true });

bot.onText(/\/start/, async (msg: Message) => {
	const firstBotMessage = await bot.sendMessage(
		msg.chat.id,
		`Hello! I am a Telegram bot designed to assist you with various tasks. My mission is to translate any of your voice messages so you can recieve a response from ChatGPT-3. You can find more info at https://github.com/Morzat95/OpenAIVoiceChat`
	);
	bot.pinChatMessage(msg.chat.id, firstBotMessage.message_id);
});

bot.on("text", async (msg: Message) => {
	// Get the text message sent by the user
	const userInput = msg.text;

	if (userInput !== undefined && !userInput.startsWith("/")) {
		const chatId = String(msg.chat.id);

		// Make the request to the OpenAI API
		const response = await openAiService.generateText(userInput);

		// Send the response to the chat
		bot.sendMessage(chatId, response);
	}
});

bot.on("voice", async (msg: Message) => {
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

	// Upload the audio file to the Cloud Storage Service
	// const [fileUrl] = await storageService.uploadFile(localFilePath, "audio.oga");

	// Use the speech-to-text service to transcribe the audio message
	// const transcription = await speechToTextService.transcribe(fileUrl);
	// const transcription = await speechToTextService.transcribe(
	// 	"gs://my-test-bucket20230120/audio.oga"
	// );
	const transcription = await speechToTextService.transcribe(
		convertedAudioFile
	);

	bot.sendMessage(chatId, `You told me: ${transcription}`);

	// // Translate the transcription to the desired language
	// const translation = await translateText(transcription, 'es');

	// Make the request to the OpenAI API
	const response = await openAiService.generateText(transcription);

	// Send the response to the chat
	bot.sendMessage(chatId, response);
});

function replaceTemplateString(template: string, chatId: string) {
	return template.replace("{{chatId}}", chatId);
}
