export const config = {
	audioDownloader: {
		outputFile: "./downloadedAudios/audio.oga",
	},
	audioConverter: {
		inputFile: "./downloadedAudios/audio.oga",
		outputFile: "./convertedAudios/output.raw",
	},
	speechToTextService: {
		inputFile: "./convertedAudios/output.raw",
	},
};
