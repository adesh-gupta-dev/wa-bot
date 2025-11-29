import { Client } from "whatsapp-web.js";
import LocalAuth from "whatsapp-web.js/src/authStrategies/LocalAuth.js";
import generateQR from "./qrgenrator.js";
import { initMessage } from "./init.js";
import profession from "./profession.js";
import responseByAI from "./utils/gemini.js";

const client = new Client({
  puppeteer: { args: ["--no-sandbox", "--disable-setuid-sandbox"] },
  authStrategy: new LocalAuth(),
});

// ⭐ MULTI-USER MEMORY
const userSessions = {};
const SESSION_TIME = 5 * 60 * 1000; // 5 minutes

// 📌 QR Code Handler
client.on("qr", (qr) => {
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

  if (!(await initMessage(message))) return;
  if (userId === "status@broadcast") return;

  // Fetch username
  let userName = "";
  await message.getChat().then((chat) => {
    userName = chat.name;
  });

  // ⭐ Initialize Session If Not Exists
  if (!userSessions[userId]) {
    userSessions[userId] = {
      userName: userName || "User",
      profession: null,
      girlfriendMode: false,
      girlfriendName: null,
      waitingForProfession: false,
      waitingForName: false,
      timer: null,
    };
  }

  const session = userSessions[userId];

  // Reset Session Timer
  clearTimeout(session.timer);
  session.timer = setTimeout(() => {
    session.profession = null;
    session.waitingForProfession = false;

    message.reply(`⏳ Your session expired.  
Please choose your profession again using **/profession**`);
  }, SESSION_TIME);

  //  💞 Toggle Girlfriend Mode
  if (message.body === "/gf") {
    session.girlfriendMode = !session.girlfriendMode;

    if (session.girlfriendMode) {
      session.waitingForName = true;
      return message.reply(
        `💖 Girlfriend mode enabled!\n\nEnter a name for your AI GF:`
      );
    }

    return message.reply("❌ Girlfriend mode disabled");
  }

  // 💞 Save Girlfriend Name
  if (session.waitingForName) {
    session.girlfriendName = message.body.trim();
    session.waitingForName = false;

    return message.reply(`💖 Name saved: *${session.girlfriendName}*`);
  }

  // 🧑‍💼 Profession Menu
  if (message.body === "/p" || message.body === "/profession") {
    session.waitingForProfession = true;
    profession(message, null); // show list
    return;
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

  // ⛔ No Profession & Not in Girlfriend Mode
  if (!session.profession && !session.girlfriendMode) {
    return message.reply(
      `⚠ Please set your profession using:\n👉 */profession*`
    );
  }

  // 🔥 AI Reply (Main Logic)
  const reply = await responseByAI(
    message.body ?? "", // default value
    session.userName ?? "User", // default
    session.profession ?? "none", // default
    session.girlfriendMode ?? false,
    session.girlfriendName ?? ""
  );

  message.reply(reply);
});

// Start Bot
client.initialize();
