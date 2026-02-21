const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");
const axios = require("axios");

// =================== AYARLAR ===================
const LOG_CHANNEL_ID = "1474866248507461887"; 
// ===============================================

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Bot aktif!"));
app.listen(PORT, () => console.log("Web server çalışıyor:", PORT));

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// =================== BOT READY ===================
client.once("ready", () => {
  console.log(`Bot aktif: ${client.user.tag}`);

  // Aternos ping (5 dakikada bir)
  setInterval(async () => {
    try {
      await axios.get("https://aternos.org/go/");
      console.log("Aternos ping atıldı.");
    } catch (err) {
      console.log("Ping hatası:", err.message);
    }
  }, 300000);
});

// =================== HATA YAKALAMA ===================

process.on("unhandledRejection", async (reason) => {
  console.log("🔥 Unhandled Rejection:", reason);

  const channel = client.channels.cache.get(LOG_CHANNEL_ID);
  if (channel) {
    channel.send(`🔥 **Unhandled Rejection:**\n\`\`\`${reason}\`\`\``);
  }
});

process.on("uncaughtException", async (err) => {
  console.log("💥 Uncaught Exception:", err);

  const channel = client.channels.cache.get(LOG_CHANNEL_ID);
  if (channel) {
    channel.send(`💥 **Uncaught Exception:**\n\`\`\`${err}\`\`\``);
  }
});

process.on("warning", (warning) => {
  console.log("⚠️ Warning:", warning.name, warning.message);
});

// =================== LOGIN ===================
client.login(process.env.TOKEN);
