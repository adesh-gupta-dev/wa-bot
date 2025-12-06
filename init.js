export const initMessage = async (message) => {
  if (message.type === "chat") {
    return true;
  } else {
    return false;
  }
};
export const stopBot = async (message) => {
  if (message.from === "918303591732@c.us") {
    return message.body === "/admin" ? true : false;
    return message.body === "/start" ? false : true;
  } else if (message.body === "/stop" || message.body === "/start") {
    message.reply(
      "\n you are not *authorized for this*\n 🤖 To stop or start the bot, please contact the admin."
    );
    return null;
  }
};
