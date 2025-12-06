import { Client } from "whatsapp-web.js";
import LocalAuth from "whatsapp-web.js/src/authStrategies/LocalAuth.js";
import generateQR from "./qrgenrator.js";
import { initMessage, stopBot } from "./init.js";
import profession from "./profession.js";
import responseByAI from "./utils/gemini.js";
import gTTS from "gtts";
import fs from "fs";
import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";
import { generateVoice } from "./voiceGenration.js";
const { MessageMedia } = pkg;

const client = new Client({
  puppeteer: { args: ["--no-sandbox", "--disable-setuid-sandbox"] },
  authStrategy: new LocalAuth(),
});

// ⭐ MULTI-USER MEMORY
const userSessions = {};
const SESSION_TIME = 5 * 60 * 1000; // 5 minutes
let stop = false;
// 📌 QR Code Handler
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  generateQR(qr);

  console.log("QR RECEIVED");
});

// Ready Listener
client.once("ready", () => {
  console.log("Client is ready!");
});

// 📩 On Incoming Message
client.on("message", async (message) => {
  const userId = message.from;
  stop = userId === "918303591732@c.us" ? await stopBot(message) : stop;

  if (userId === "status@broadcast") return;

  // Fetch username
  let userName = "";
  await message.getChat().then((chat) => {
    userName = chat.name;
  });

  if (!(await initMessage(message))) return;
  console.log(`Message from ${userName} (${userId}): ${message.body}`);
  if (stop) {
    return message.reply(
      "🤖 Bot stopped. To restart, Ask for support and leave a message."
    );
  }
  // ⭐ Initialize Session If Not Exists
  if (!userSessions[userId]) {
    userSessions[userId] = {
      userName: userName || "User",
      profession: null,
      Mode: null,
      partnerName: null,
      waitingForProfession: false,
      waitingForName: false,
      timer: null,
      voice: false,
    };
  }

  const session = userSessions[userId];

  // Reset Session Timer
  clearTimeout(session.timer);
  session.timer = setTimeout(() => {
    session.profession = null;
    session.waitingForProfession = false;

    message.reply(`⏳ Your session expired.  
Please choose your profession again using */profession or /p* *\n/bhakti* `);
  }, SESSION_TIME);
  if (stop) {
    // stop = stopBot(message, userId);
    return message.reply(
      "🤖 Bot stopped. To restart, Ask for support and leave a message."
    );
  }
  // 🧑‍💼 Profession Menu
  if (message.body === "/p" || message.body === "/profession") {
    session.waitingForProfession = true;
    session.Mode = "PROFESSION";
    profession(message, null); // show list
    return;
  }

  //  💞 Toggle Girlfriend Mode
  if (message.body === "/gf") {
    session.Mode = session.Mode === "GF" ? null : "GF";

    if (session.Mode === "GF") {
      session.waitingForName = true;
      return message.reply(
        `💖 Girlfriend mode enabled!\n\nEnter a name for your AI GF:`
      );
    }

    return message.reply("❌ Girlfriend mode disabled");
  }
  //  💞 Toggle boyfriend Mode
  if (message.body === "/bf") {
    session.Mode = session.Mode === "BF" ? null : "BF";

    if (session.Mode === "BF") {
      session.waitingForName = true;
      return message.reply(
        `💖 Boyfriend mode enabled!\n\nEnter a name for your AI BF:`
      );
    }

    return message.reply("❌ Boyfriend mode disabled");
  }
  //  🕉️ Toggle Bhakti Mode
  if (message.body === "/bhakti") {
    session.Mode = session.Mode === "BHAKTI" ? null : "BHAKTI";

    if (session.Mode === "BHAKTI") {
      return message.reply(`🕉️ Bhakti mode enabled!:`);
    }
    return message.reply("❌ Bhakti mode disabled");
  }

  // 💞 Save Girlfriend Name
  if (session.waitingForName) {
    session.partnerName = message.body.trim();
    session.waitingForName = false;

    return message.reply(`💖 Name saved: *${session.partnerName}*`);
  }

  // Save Profession
  if (session.waitingForProfession) {
    if (!isNaN(message.body)) {
      session.profession = profession(message, Number(message.body));
      session.waitingForProfession = false;

      return message.reply("✅ Profession saved! You may continue chatting.");
    } else {
      return message.reply("❌ Invalid input. Please enter a number.");
    }
  }
  if (message.body === "/voice") {
    session.voice = !session.voice;
    return message.reply(
      `✅ Voice mode ${session.voice ? "enabled" : "disabled"}!`
    );
  }
  // ⛔ No Profession & Not in Girlfriend Mode
  if (!session.profession && session.Mode === null) {
    return message.reply(
      `⚠ Please set your profession using:\n👉 */profession or /p*\n*/bhakti*`
    );
  }
  // 🔥 AI Reply (Main Logic)
  const reply = await responseByAI(
    message.body ?? "", // default value
    session.userName ?? "User", // default
    session.profession ?? "none", // default
    session.Mode ?? null,
    session.partnerName ?? ""
  );

  //voice generation usinge ElevenLabs
  if (session.voice) {
    // Make sure tmp folder exists
    if (!fs.existsSync("./tmp")) {
      fs.mkdirSync("./tmp");
    }
    const audioFilePath = await generateVoice(
      reply,
      process.env.ELEVEN_LABS_GIRL_VOICE_ID // Example voice ID
    );
    if (audioFilePath) {
      // Send voice message
      const media = new MessageMedia(
        "audio/mpeg",
        fs.readFileSync(audioFilePath).toString("base64"),
        `${session.partnerName}_gf.mp3`
      );

      await message.reply(media);
      // Optionally, delete the temporary audio file after sending
      fs.unlinkSync(audioFilePath);
    }
  } else {
    message.reply(reply);
  }
  console.log(`me: ${reply}`);
});

// Start Bot
client.initialize();
