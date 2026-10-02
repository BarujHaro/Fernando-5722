import express from "express";
import cors from "cors";
import snailpayRoutes from "./routes/snailpay.routes.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "SnailPay backend funcionando"
  });
});

app.use("/api/snailpay", snailpayRoutes);

app.listen(PORT, () => {
  console.log(`Backend ejecutándose en http://localhost:${PORT}`);
});