const ffmpeg = require("fluent-ffmpeg");

export class AudioConverter {
	public async convertToRaw(
		inputFile: string,
		outputFile: string
	): Promise<void> {
		return new Promise((resolve) => {
			ffmpeg()
				.input(inputFile)
				.outputFormat("s16le")
				.audioCodec("pcm_s16le")
				.audioFrequency(16000)
				.on("end", () => {
					resolve();
				})
				.save(outputFile);
		});
	}
}
