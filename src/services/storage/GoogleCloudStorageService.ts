import { GetSignedUrlResponse, Storage } from "@google-cloud/storage";

export class GoogleCloudStorageService {
	private storage: Storage;
	private bucketName: string;

	constructor(bucketName: string) {
		this.storage = new Storage();
		this.bucketName = bucketName;
	}

	async uploadFile(
		localFile: string,
		remoteFileName: string
	): Promise<GetSignedUrlResponse> {
		const bucket = this.storage.bucket(this.bucketName);
		const remoteFile = bucket.file(remoteFileName);

		const options = {
			gzip: true,
			metadata: {
				cacheControl: "public, max-age=31536000",
			},
		};

		await bucket.upload(localFile, options);

		const config = {
			action: "read" as "read",
			expires: "03-09-2491",
		};

		const url = await remoteFile.getSignedUrl(config);

		return url;
	}
}

export default GoogleCloudStorageService;
