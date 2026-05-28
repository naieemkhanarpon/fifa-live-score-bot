import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const API_KEY = process.env.API_KEY;

// 🔥 prevent duplicate updates
let sent = new Map();

// ⚽ get live matches
async function getMatches() {
  try {
    const res = await axios.get(
      "https://v3.football.api-sports.io/fixtures?live=all",
      {
        headers: {
          "x-apisports-key": API_KEY
        },
        timeout: 10000
      }
    );

    return res.data.response || [];
  } catch (error) {
    console.log("❌ API Error:", error.message);
    return [];
  }
}

// 📩 safe telegram send
async function send(msg) {
  try {
    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHANNEL_ID,
        text: msg
      },
      { timeout: 7000 }
    );

    console.log("✅ Message sent");
  } catch (error) {
    console.log("❌ Telegram failed:", error.response?.data || error.message);
  }
}

// ⚽ main bot logic
async function runBot() {
  console.log("🔍 Checking live matches...");

  const matches = await getMatches();

  if (!matches.length) {
    console.log("No live matches right now");
    return;
  }

  for (const m of matches) {
    const home = m.teams.home.name;
    const away = m.teams.away.name;

    const hg = m.goals.home ?? 0;
    const ag = m.goals.away ?? 0;

    const minute = m.fixture.status.elapsed ?? "Live";

    // 🔥 unique key (prevents spam)
    const key = `${home}-${away}`;

    const lastScore = sent.get(key);

    if (lastScore !== `${hg}-${ag}`) {
      sent.set(key, `${hg}-${ag}`);

      const msg =
`⚽ FIFA LIVE SCORE

${home} ${hg} - ${ag} ${away}

⏱ ${minute}' Minute

🔥 Auto Update`;

      await send(msg);
    }
  }
}

// 🚀 start bot
runBot();

setInterval(runBot, 30000); // 30 sec interval (stable)

// 🧠 safety logs
process.on("uncaughtException", (err) => {
  console.log("CRASH:", err.message);
});

console.log("🤖 Bot is running...");
