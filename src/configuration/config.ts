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
	languages: [
		[
			{ text: "English (United States)", callback_data: "en-US" },
			{ text: "Español (Argentina)", callback_data: "es-AR" },
		],
		[
			{ text: "Português (Brasil)", callback_data: "pt-BR" },
			{ text: "中文 (普通话中国大陆)", callback_data: "cmn-Hans-CN" },
		],
		[
			{ text: "Français (France)", callback_data: "fr-FR" },
			{ text: "Deutsch (Deutschland)", callback_data: "de-DE" },
		],
		[
			{ text: "Italiano (Italia)", callback_data: "it-IT" },
			{ text: "日本語", callback_data: "ja-JP" },
		],
		[
			{ text: "한국어", callback_data: "ko-KR" },
			{ text: "Nederlands (Nederland)", callback_data: "nl-NL" },
		],
		[
			{ text: "Polski (Polska)", callback_data: "pl-PL" },
			{ text: "Русский (Россия)", callback_data: "ru-RU" },
		],
		[
			{ text: "ไทย (ประเทศไทย)", callback_data: "th-TH" },
			{ text: "Türkçe (Türkiye)", callback_data: "tr-TR" },
		],
		[
			{ text: "العربية (المملكة العربية السعودية)", callback_data: "ar-SA" },
			{ text: "Tiếng Việt (Việt Nam)", callback_data: "vi-VN" },
		],
	],
};
