// import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";

export async function generateVoice(text, voiceId) {
  try {
    const outputPath = `./tmp/voice_${Date.now()}.mp3`;

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.6, similarity_boost: 0.55, speed: 0.8 },
      },
      {
        responseType: "arraybuffer",
        headers: {
          "xi-api-key": process.env.ELEVEN_LABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
      }
    );

    fs.writeFileSync(outputPath, response.data);
    return outputPath;
  } catch (err) {
    console.error("ElevenLabs TTS Error:", err.response?.data || err);
    return null;
  }
}
