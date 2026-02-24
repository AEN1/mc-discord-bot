require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const mineflayer = require("mineflayer");
const mongoose = require("mongoose");

/* =========================
   DATABASE CONNECT
========================= */

if(process.env.MONGO_URI){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=> console.log("MongoDB bağlı"))
    .catch(console.error);
}

/* =========================
   DISCORD BOT
========================= */

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

/* =========================
   MINECRAFT BOT CORE
========================= */

let mcBot;

function connectMinecraft(){

    if(mcBot) return;

    mcBot = mineflayer.createBot({
        host: process.env.MC_HOST,
        port: parseInt(process.env.MC_PORT),
        username: process.env.MC_USERNAME,
        auth: "offline",
        version: false
    });

    mcBot.on("spawn", ()=>{
        console.log("Minecraft bot sunucuya bağlandı");
    });

    mcBot.on("chat", (username, message)=>{

        const channel = client.channels.cache.find(c=>c.name === "chat");

        if(channel){
            channel.send(`[MC] ${username}: ${message}`);
        }

        smartAntiCheat(username, message);

    });

    mcBot.on("end", ()=>{
        console.log("Minecraft bot koptu, yeniden bağlanıyor...");
        setTimeout(connectMinecraft, 5000);
    });

    mcBot.on("error", console.error);
}

/* =========================
   SMART ANTICHEAT CORE
========================= */

let suspiciousPlayers = new Map();

function flagPlayer(name){

    let count = suspiciousPlayers.get(name) || 0;
    count++;

    suspiciousPlayers.set(name, count);

    if(count >= 3 && mcBot){
        mcBot.chat(`/ban ${name} Hile şüphesi (SMART Protection)`);
        suspiciousPlayers.delete(name);

        console.log("Auto ban:", name);
    }
}

function smartAntiCheat(username, message){

    let risk = 0;

    if(message.includes("sus")) risk++;
    if(message.includes("speed")) risk++;
    if(message.includes("hack")) risk++;

    if(risk >= 2){
        flagPlayer(username);
    }
}

/* =========================
   DISCORD COMMANDS
========================= */

client.on("messageCreate", async message=>{

    if(message.author.bot) return;

    if(message.content === "!baglan"){
        connectMinecraft();
        message.reply("Minecraft bot bağlanıyor...");
    }

    if(message.content === "!ticket"){
        message.reply("🎫 BoxPvP Ticket sistemi aktif.");
    }

    if(message.content.startsWith("!say ")){
        if(mcBot){
            let text = message.content.slice(5);
            mcBot.chat(text);
        }
    }

});

/* =========================
   BOT START
========================= */

client.once("ready", ()=>{
    console.log(`Discord bot aktif: ${client.user.tag}`);
    connectMinecraft();
});

/* =========================
   GLOBAL PROTECTION
========================= */

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

/* =========================
   LOGIN
========================= */

client.login(process.env.TOKEN);
