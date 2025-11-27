export const initMessage = async (message) => {
  if (message.type === "chat") {
    return true;
  } else {
    return false;
  }
};
