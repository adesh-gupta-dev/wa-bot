import { Client } from "whatsapp-web.js";
import LocalAuth from "whatsapp-web.js/src/authStrategies/LocalAuth.js";
import qrcode from "qrcode-terminal";
import { initMessage } from "./init.js";
import profession from "./profession.js";
import responseByAI from "./utils/gemini.js";
import fs from "fs";

const client = new Client({
  puppeteer: { args: ["--no-sandbox", "--disable-setuid-sandbox"] },
  authStrategy: new LocalAuth(),
});

// ⭐ MULTI-USER STORAGE ⭐
const userSessions = {};
const SESSION_TIME = 5 * 60 * 1000; // 5 minutes
// save qr in image file
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  fs.writeFileSync("qr.png", qr);
});

client.once("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (message) => {
  const userId = message.from;
  console.log(userId.substring(2, 12) + ": " + message.body);

  if (!(await initMessage(message))) return;

  let user = "";
  await message.getChat().then((chat) => {
    user = chat.name;
  });
  // 🧠 Initialize session if not exists
  if (!userSessions[userId]) {
    userSessions[userId] = {
      userName: user,
      profession: null,
      girlfriendMode: false,
      girlfriendName: null,
      waitingForprofession: false,
      waitingForName: false,
      timer: null,
    };
  }

  const session = userSessions[userId];

  // ❌ Block number
  // if (userId.substring(2, 12).includes("7307867916")) {
  //   return message.reply("you are not allowed to chat with me");
  // }

  if (userId === "status@broadcast") return;

  // 🔄 Reset session timer every message
  clearTimeout(session.timer);
  session.timer = setTimeout(() => {
    session.profession = null;
    session.waitingForprofession = false;
    message.reply("⏳ Session expired. Please select your profession again.");
  }, SESSION_TIME);
  if (message.body.includes("/gf")) {
    session.girlfriendMode = !session.girlfriendMode;
    session.waitingForName = true;

    console.log(session.girlfriendMode);
    return message.reply(
      `Girlfriend mode is now ${
        session.girlfriendMode ? "enabled" : "disabled"
      }.\n\n\nEnter Name For AI Girlfriend👇👇`
    );
  } // 🧑‍💼 Request profession
  else if (
    message.body.includes("/p") ||
    message.body.includes("/profession")
  ) {
    session.waitingForprofession = true;
    session.profession = profession(message, null);
    return;
  }
  if (session.waitingForName) {
    session.girlfriendName = message.body.toUpperCase().trim();
    console.log(session.girlfriendName);
    session.waitingForName = false;
    return message.reply(`NAME SAVED : ${session.girlfriendName}`);
  }
  // 🧑‍💼 Inside profession selection
  if (session.waitingForprofession) {
    if (!isNaN(message.body)) {
      session.profession = profession(message, Number(message.body));
      session.waitingForprofession = false;

      return message.reply("Profession saved! You may continue chatting.");
    }
    return message.reply("Please send a valid number.");
  }

  // ❗Profession not selected
  if (!session.profession && !session.girlfriendMode) {
    return message.reply(
      'Please select your profession first by sending "/profession" or "/p"'
    );
  }

  if (!session.userName || session.userName === "User") {
    session.userName = "User";
  }
  // 🧠 Normal conversation
  const res = await responseByAI(
    message.body,
    session.userName,
    session.profession,
    session.girlfriendMode,
    session.girlfriendName
  );

  message.reply(res);
});

client.initialize();
