import QRCode from "qrcode";

const generateQR = async (qr) => {
  let colordark = [
    "#013fe8ff",
    "#f120ceff",
    "#e89b01ff",
    "#a76b81ff",
    "#62b730ff",
  ];
  colordark.forEach((color) => {
    color = color;
  });

  try {
    await QRCode.toFile("./frontend/whatsapp_ai/public/qrnew.png", qr, {
      color: {
        dark: `${colordark.map(() => color)}`,
        light: "#ddefe6ff",
      },
    });

    console.log("QR image saved successfully!");
  } catch (err) {
    console.error("QR generation error:", err);
  }
};

export default generateQR;
