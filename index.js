import axios from "axios";
import dotenv from "dotenv";
import cron from "node-cron";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const API_KEY = process.env.API_KEY;

let sent = new Set();

async function getMatches() {
  const res = await axios.get(
    "https://v3.football.api-sports.io/fixtures?live=all",
    {
      headers: { "x-apisports-key": API_KEY }
    }
  );
  return res.data.response;
}

async function send(msg) {
  await axios.post(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      chat_id: CHANNEL_ID,
      text: msg
    }
  );
}

cron.schedule("*/1 * * * *", async () => {
  const matches = await getMatches();

  for (const m of matches) {
    const key = `${m.teams.home.name}-${m.teams.away.name}-${m.goals.home}-${m.goals.away}`;

    if (!sent.has(key)) {
      sent.add(key);

      const msg =
`⚽ LIVE SCORE

${m.teams.home.name} ${m.goals.home} - ${m.goals.away} ${m.teams.away.name}

⏱ ${m.fixture.status.elapsed}'`;

      await send(msg);
    }
  }
});

console.log("Bot running...");
