export interface StorageService<T> {
	getChatHistory(userId: string): Promise<T[]>;
	addChatMessages(userId: string, messages: T[]): Promise<void>;
	getLanguage(userId: string): Promise<string>;
	setLanguage(userId: string, newLanguageCode: string): Promise<void>;
}
