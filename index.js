import { Client } from "whatsapp-web.js";
import LocalAuth from "whatsapp-web.js/src/authStrategies/LocalAuth.js";
import qrcode from "qrcode-terminal";
import { initMessage } from "./init.js";
import profession from "./profession.js";
import responseByAI from "./utils/gemini.js";

const client = new Client({
  puppeteer: { args: ["--no-sandbox", "--disable-setuid-sandbox"] },
  authStrategy: new LocalAuth(),
});

// GLOBAL VARIABLE — Store profession
let userProfession = null;
let waitingForProfession = false;
// Start
client.once("ready", () => {
  console.log("Client is ready!");
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("message", async (message) => {
  console.log(message.from.substring(2, 12) + ": " + message.body);
  if (!(await initMessage(message))) {
    return;
  }
  if (message.from === "status@broadcast") {
    return;
  }
  if (message.body.includes("/p") || message.body.includes("/profession")) {
    waitingForProfession = true;
    userProfession = profession(message, null);
    return;
  }
  if (waitingForProfession) {
    if (!isNaN(message.body)) {
      userProfession = profession(message, parseInt(message.body));
      waitingForProfession = false;

      message.reply("Profession saved! You may continue your chat now.");
      console.log("User Profession: " + userProfession);
      return;
    } else {
      message.reply("Please send a valid number.");
      return;
    }
  }
  if (userProfession === null) {
    message.reply(
      'Please select your profession first by sending "/profession or /p" command.'
    );
    return;
  }
  // 2) Profession already selected → normal conversation
  responseByAI(message.body, message.notifyName || "user", userProfession).then(
    (res) => {
      message.reply(res);
    }
  );
});

client.initialize();
