import { config } from "dotenv";
import { Client, GatewayIntentBits, Partials, Events } from "discord.js";
config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  const URL =
  "https://script.google.com/macros/s/AKfycbw8ouMZM03aafahjfTtan-vbAkITNM5ytHhJaF9zwzzV2CY7se5KIUc3LkD6D8J9p7M/exec"

  console.log(reaction.partial);
  // When a reaction is received, check if the structure is partial
  if (reaction.partial) {
    // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
    try {
      await reaction.fetch();
      getRoster();
    } catch (error) {
      console.error("Something went wrong when fetching the message:", error);
      // Return as `reaction.message.author` may be undefined/null
      return;
    }
  } else {
    getRoster();
  }

  async function getRoster() {
    let channelId = reaction.message.channelId;
    let discordId = reaction.message.author.id;
    let username = reaction.message.author.username;
    let team_tag = 1;

    let tags = {
      team_tag_1: [
        "824392685216333925",
        "964945101098995742",
        "967304940336869376",
        "966846358772408330",
      ],
      team_tag_2: [
        "1217510268993536100",
        "1021137568366084176",
        "1008063321724944465",
        "964945101098995742",
      ],
    };

    if (reaction.emoji.name !== "🤖") {
      console.log(`${reaction.emoji.name} is not the correct reaction`);
      return;
    }

    // if (
    //   !tags.team_tag_2.includes(channelId) &&
    //   !tags.team_tag_1.includes(channelId)
    // ) {
    //   console.log(`Channel ${channelId} is not the correct channel`);
    //   return;
    // }

    // if (tags.team_tag_1.includes(channelId)) {
    //   team_tag = 1;
    // }

    // if (tags.team_tag_2.includes(channelId)) {
    //   team_tag = 2;
    // }
    team_tag = 1;

    const API_URL = `${URL}?message_content=${encodeURIComponent(
      reaction.message.content
    )}&channel_id=${team_tag}&discord_id=${discordId}&username=${username}`;
    console.log(API_URL);
    const data = await fetchDataFromAPI(API_URL);
    console.log(data);

    if (data["uploaded_successfully"] === false) {
      reaction.message.reactions.cache
        ?.get("🤖")
        ?.remove()
        ?.catch((error) => console.error("Failed to remove reactions:", error));
      reaction.message.react("❌");
    } else {
      reaction.message.reactions.cache
        ?.get("🤖")
        ?.remove()
        ?.catch((error) => console.error("Failed to remove reactions:", error));
      reaction.message.react("✅");
    }
  }
});

async function fetchDataFromAPI(url, options = "") {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.text();
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error("Received data is not JSON:", data);
      return "";
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null; // Or handle the error differently
  }
}

client.login(process.env.TOKEN);
// Hi