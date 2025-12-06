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
        voice_settings: { stability: 0.8, similarity_boost: 0.95, speed: 0.75 },
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
// if (session.Mode === "GF") {
//   // Make sure tmp folder exists
//   if (!fs.existsSync("./tmp")) {
//     fs.mkdirSync("./tmp");
//   }

//   const audioFilePath = `./tmp/${userId}_gf.mp3`;
//   const gtts = new gTTS(reply, "hi");

//   // Convert gtts.save into a Promise
//   await new Promise((resolve, reject) => {
//     gtts.save(audioFilePath, (err) => {
//       if (err) {
//         console.error("Error generating voice message:", err);
//         return reject(err);
//       }
//       console.log("Voice message saved:", audioFilePath);
//       resolve();
//     });
//   });

//   // Send voice message
//   const media = new MessageMedia(
//     "audio/mpeg",
//     fs.readFileSync(audioFilePath).toString("base64"),
//     `${session.partnerName}_gf.mp3`
//   );

//   await message.reply(media);
//   // Optionally, delete the temporary audio file after sending
//   fs.unlinkSync(audioFilePath);
// } else {
// }
