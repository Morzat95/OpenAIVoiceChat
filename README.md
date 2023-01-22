# OpenAIVoiceChat

This project uses GPT-3 to respond to voice messages sent by users in Telegram, converting the audio to text before sending it to the model for processing. The model's response is then sent back to the Telegram chat with the user.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js 12 or higher
- npm 6 or higher
- A Telegram bot and bot token
- A Google Cloud Platform account and project with the Google Speech-to-Text and Google Cloud Storage APIs enabled
- A OpenAI API Key
- ffmpeg

### Installing

1. Clone the repository

```
git clone https://github.com/Morzat95/OpenAIVoiceChat.git
```

2. Install the dependencies

```
npm install
```

3. Create a `.env` file in the root of the project and add the following environment variables:

```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google_application_credentials.json
GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id
GOOGLE_CLOUD_STORAGE_BUCKET=your_google_cloud_storage_bucket
OPENAI_API_KEY=your_openai_api_key
```

4. Run the project

```
npm start
```

## Built With

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Telegraf.js](https://telegraf.js.org/)
- [@google-cloud/speech](https://www.npmjs.com/package/@google-cloud/speech)
- [@google-cloud/storage](https://www.npmjs.com/package/@google-cloud/storage)
- [fluent-ffmpeg](https://www.npmjs.com/package/fluent-ffmpeg)
- [openai](https://www.npmjs.com/package/openai)

## Authors

- **Morzat95** - [Morzat95](https://github.com/Morzat95)
- **CHAT-GPT-3** - (most of the code and even this file were created by the AI 🤖😎)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
