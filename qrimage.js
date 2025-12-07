import express from "express";

const app = express();
const port = process.env.PORT || 3000;

export function startServer() {
  app.get("/", (req, res) => {
    res.sendFile("./public/qrnew.png", { root: "." });
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
