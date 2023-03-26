import Redis from "ioredis";
import { promisify } from "util";
import { ChatMessage } from "../..";
import { StorageService } from "./StorageService";

class RedisStorage implements StorageService<ChatMessage> {
	private readonly redisClient: Redis;

	constructor() {
		this.redisClient = new Redis({
			port: parseInt(process.env.REDIS_PORT || "6379"), // set default port to 6379
			host: process.env.REDIS_URL,
			password: process.env.REDIS_PASSWORD,
		});
	}

	// Utility function to generate Redis base key
	private getBaseKey(userId: string): string {
		return `user:${userId}`;
	}

	// Utility function to generate Redis keys for chat histories
	private getChatHistoryKey(userId: string): string {
		const baseKey = this.getBaseKey(userId);
		return `${baseKey}:chat_history`;
	}

	// Utility function to generate Redis keys for language configuration
	private getLanguageKey(userId: string): string {
		const baseKey = this.getBaseKey(userId);
		return `${baseKey}:language`;
	}

	public async getChatHistory(userId: string): Promise<ChatMessage[]> {
		const chatKey = this.getChatHistoryKey(userId);

		// Convert Redis `rpush` method to a Promise-based function using `promisify`
		const lrangeAsync = promisify(this.redisClient.lrange).bind(
			this.redisClient
		);

		// Get the messages from Redis
		const messages = await lrangeAsync(chatKey, 0, -1);

		// Parse the messages from string to object
		const parsedMessages: ChatMessage[] = messages!.map((message) =>
			JSON.parse(message)
		);

		return parsedMessages;
	}

	public async addChatMessages(
		userId: string,
		messages: ChatMessage[]
	): Promise<void> {
		const chatKey = this.getChatHistoryKey(userId);

		const rpushAsync = promisify(this.redisClient.rpush).bind(this.redisClient);

		// Stringify the ChatMessage objects
		const stringifiedMessages = messages.map((message) =>
			JSON.stringify(message)
		);

		// Push the ChatMessage objects to the end of the Redis chat history
		await rpushAsync(chatKey, ...(stringifiedMessages as []));
	}

	public async getLanguage(userId: string): Promise<string> {
		const languageKey = this.getLanguageKey(userId);

		return (
			(await this.redisClient.get(languageKey)) ??
			(process.env.defaultLanguage as string)
		);
	}

	async setLanguage(userId: string, newLanguageCode: string): Promise<void> {
		const languageKey = this.getLanguageKey(userId);
		await this.redisClient.set(languageKey, newLanguageCode);
	}
}

export default RedisStorage;
