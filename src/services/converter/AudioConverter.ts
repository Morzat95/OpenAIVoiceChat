const ffmpeg = require("fluent-ffmpeg");

export class AudioConverter {
	private inputFile: string;
	private outputFile: string;

	constructor(inputFile: string, outputFile: string) {
		this.inputFile = inputFile;
		this.outputFile = outputFile;
	}

	public async convertToRaw(): Promise<void> {
		return new Promise((resolve) => {
			ffmpeg()
				.input(this.inputFile)
				.outputFormat("s16le")
				.audioCodec("pcm_s16le")
				.audioFrequency(16000)
				.on("end", () => {
					resolve();
				})
				.save(this.outputFile);
		});
	}
}
