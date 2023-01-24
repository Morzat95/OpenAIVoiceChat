export const config = {
	audioDownloader: {
		outputFile: "./downloadedAudios/audio-{{chatId}}.oga",
	},
	audioConverter: {
		inputFile: "./downloadedAudios/audio.oga",
		outputFile: "./convertedAudios/output-{{chatId}}.raw",
	},
	speechToTextService: {
		inputFile: "./convertedAudios/output.raw",
	},
};
