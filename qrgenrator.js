import QRCode from "qrcode";

const generateQR = async (qr) => {
  try {
    await QRCode.toFile("./public/qrnew.png", qr, {
      color: {
        dark: "#000000",
        light: "#ddefe6ff",
      },
    });

    console.log("QR image saved successfully!");
  } catch (err) {
    console.error("QR generation error:", err);
  }
};

export default generateQR;
