let msgString = "";

export const profession = (message, num) => {
  const professions = [
    "software engineer",
    "lawyer",
    "teacher",
    "accountant",
    "mechanical engineer",
    "electrical engineer",
    "graphic designer",
    "marketing manager",
    "project manager",
    "data scientist",
    "web developer",
    "content writer",
    "python developer",
    "java developer",
    "js developer",
    "best career advisor",
    "partner",
  ];
  if (num === null) {
    msgString = "";
    message.reply("Please tell me your profession by sending any number:");

    for (let i = 0; i < professions.length; i++) {
      msgString += i + " ==> " + professions[i].toUpperCase() + "\n";
    }
    message.reply(msgString);
    return null;
  }

  if (num !== undefined || num !== null) {
    return professions[num];
  }
};

export default profession;
