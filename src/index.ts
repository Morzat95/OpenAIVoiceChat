import { SpeechToTextService } from "./services/speechToText/SpeechToTextService";
import { GoogleSpeechToTextService } from "./services/speechToText/GoogleSpeechToTextService";
import { GoogleCloudStorageService } from "./services/storage/GoogleCloudStorageService";
import { AudioConverter } from "./services/converter/AudioConverter";
import { OpenAiService } from "./services/openai/OpenAIService";
import { AudioDownloader } from "./services/downloader/AudioDownloader";
import { config } from "./configuration/config";
import * as dotenv from "dotenv";
const TelegramBot = require("node-telegram-bot-api");

dotenv.config();

const audioDownloader = new AudioDownloader();
const speechToTextService: SpeechToTextService = new GoogleSpeechToTextService(
	process.env.GOOGLE_APPLICATION_CREDENTIALS as string
);
const storageService = new GoogleCloudStorageService(
	process.env.STORAGE_SERVICE_NAME as string
);
const audioConverter = new AudioConverter(
	config.audioConverter.inputFile,
	config.audioConverter.outputFile
);
const openAiService = new OpenAiService(process.env.OPENAI_API_KEY as string);
const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, { polling: true });

// TODO: pinnear mensaje
// Matches "/about [whatever]"
bot.onText(/\/about/, (msg: { chat: { id: any } }) => {
	// 'msg' is the received Message from Telegram
	// 'match' is the result of executing the regexp above on the text content
	// of the message

	const chatId = msg.chat.id;
	// const resp = match[1]; // the captured "whatever"
	const resp = `You can find more info about the bot in https://github.com/Morzat95/OpenAIVoiceChat`; // the captured "whatever"

	// send back the matched "whatever" to the chat
	bot.sendMessage(chatId, resp);
});

bot.on("voice", async (msg: { chat: { id: any }; voice: { file_id: any } }) => {
	const chatId = msg.chat.id;

	// Get the file_id of the audio message
	const file_id = msg.voice.file_id;

	// Use the Telegram Bot API to get the file path for the audio message
	const file_path = await bot.getFileLink(file_id);

	// Download the audio file
	const localFilePath = "./downloadedAudios/audio.oga";
	// await downloadAudio(file_path, localFilePath);
	await audioDownloader.download(file_path, config.audioDownloader.outputFile);

	// Convert the audio file to a format supported by Google Cloud Speech to Text Service
	await audioConverter.convertToRaw();

	// Upload the audio file to the Cloud Storage Service
	// const [fileUrl] = await storageService.uploadFile(localFilePath, "audio.oga");

	// Use the speech-to-text service to transcribe the audio message
	// const transcription = await speechToTextService.transcribe(fileUrl);
	// const transcription = await speechToTextService.transcribe(
	// 	"gs://my-test-bucket20230120/audio.oga"
	// );
	const transcription = await speechToTextService.transcribe(
		config.speechToTextService.inputFile
	);

	bot.sendMessage(chatId, `Me dijiste: ${transcription}`);

	// // Translate the transcription to the desired language
	// const translation = await translateText(transcription, 'es');

	// Make the request to the OpenAI API
	const response = await openAiService.generateText(transcription);

	// Send the response to the chat
	bot.sendMessage(chatId, response);
});
