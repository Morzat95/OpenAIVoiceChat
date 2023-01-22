const request = require("request");
import * as fs from "fs";

export class AudioDownloader {
	// Function to download the audio file
	async download(fileUrl: string, localFilePath: string) {
		return new Promise((resolve, reject) => {
			request(fileUrl)
				.pipe(fs.createWriteStream(localFilePath))
				.on("finish", () => {
					resolve(localFilePath);
				})
				.on("error", (error: any) => {
					reject(error);
				});
		});
	}
}
