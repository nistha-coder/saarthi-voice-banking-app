
const textToSpeech = require('@google-cloud/text-to-speech');
const { TranslationServiceClient } = require('@google-cloud/translate').v3;

// GOOGLE PROJECT DETAILS
const projectId = process.env.GOOGLE_PROJECT_ID;
const location = 'global';

// init clients
const ttsClient = new textToSpeech.TextToSpeechClient();
const translateClient = new TranslationServiceClient();

// Allowed languages for translation + TTS
const supportedLanguages = ["en", "hi", "bn", "mr", "ta", "te", "kn", "gu", "pa", "ml"];

/**
 * POST /api/assistant/tts/speak
 * body: { text, language }
 */
exports.speak = async (req, res) => {
  try {
    let { text, language } = req.body;

    if (!text) return res.status(400).send("No text received.");

    // Default language = English
    if (!language || !supportedLanguages.includes(language)) {
      console.log("⚠ Invalid or missing language. Defaulting to English.");
      language = "en";
    }

    let finalText = text;

    // 1️⃣ TRANSLATION (only translate TO the selected language)
    if (language !== "en") {
      try {
        const request = {
          parent: `projects/${projectId}/locations/${location}`,
          contents: [text],
          mimeType: "text/plain",
          targetLanguageCode: language,
        };

        const [response] = await translateClient.translateText(request);
        finalText = response.translations[0].translatedText;
        console.log("Translated Text:", finalText);
      } catch (err) {
        console.error("🔴 Translation Failed:", err.details);
        // fallback to original text instead of breaking
        finalText = text;
      }
    }

    // 2️⃣ TTS VOICE MAP
    const voiceMap = {
      en: { languageCode: "en-US", name: "en-US-Neural2-C" },
      hi: { languageCode: "hi-IN", name: "hi-IN-Wavenet-A" },
      bn: { languageCode: "bn-IN", name: "bn-IN-Wavenet-A" },
      ta: { languageCode: "ta-IN", name: "ta-IN-Wavenet-A" },
      te: { languageCode: "te-IN", name: "te-IN-Wavenet-A" },
      kn: { languageCode: "kn-IN", name: "kn-IN-Wavenet-A" },
      mr: { languageCode: "mr-IN", name: "mr-IN-Wavenet-A" },
      gu: { languageCode: "gu-IN", name: "gu-IN-Wavenet-A" },
      pa: { languageCode: "pa-IN", name: "pa-IN-Wavenet-A" },
      ml: { languageCode: "ml-IN", name: "ml-IN-Wavenet-A" },
    };

    const selectedVoice = voiceMap[language] || voiceMap["en"];

    // 3️⃣ TTS REQUEST
    const requestTTS = {
      input: { text: finalText },
      voice: selectedVoice,
      audioConfig: { audioEncoding: "MP3", speakingRate: 1.0 },
    };

    const [ttsResponse] = await ttsClient.synthesizeSpeech(requestTTS);

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": ttsResponse.audioContent.length,
    });

    res.send(ttsResponse.audioContent);

  } catch (err) {
    console.error("TTS ERROR:", err);
    res.status(500).send("Internal Server Error");
  }
};


