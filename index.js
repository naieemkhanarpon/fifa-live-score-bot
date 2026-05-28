import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const API_KEY = process.env.API_KEY;

let sent = new Set();

// 🔥 Get live matches
async function getMatches() {
  try {
    const res = await axios.get(
      "https://v3.football.api-sports.io/fixtures?live=all",
      {
        headers: {
          "x-apisports-key": API_KEY
        }
      }
    );

    return res.data.response || [];
  } catch (error) {
    console.log("API Error:", error.message);
    return [];
  }
}

// 📩 Send message to Telegram
async function send(msg) {
  try {
    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHANNEL_ID,
        text: msg
      }
    );
  } catch (error) {
    console.log("Telegram Error:", error.message);
  }
}

// ⚽ Main bot function
async function runBot() {
  console.log("Checking live matches...");

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

    const key = `${home}-${away}-${hg}-${ag}`;

    if (!sent.has(key)) {
      sent.add(key);

      const msg =
`⚽ FIFA LIVE SCORE

${home} ${hg} - ${ag} ${away}

⏱ ${minute}' Minute

🔥 Auto Update`;

      await send(msg);
      console.log("Message sent:", key);
    }
  }
}

// 🚀 Start bot immediately
runBot();

// 🔁 Repeat every 60 seconds
setInterval(runBot, 60000);

console.log("Bot is running... 🚀");
