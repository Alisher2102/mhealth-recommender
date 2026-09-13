import "dotenv/config";
import { createApp } from "./app.js";

const app = createApp();
const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`🚀 mHealth Recommender API listening on http://localhost:${port}`);
  console.log(`   Health check: http://localhost:${port}/health`);
});
