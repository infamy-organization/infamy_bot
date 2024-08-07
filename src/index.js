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
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const tags = {
  team_tag_1: [
    "824392685216333925",
    "964945101098995742",
    "967304940336869376",
    "966846358772408330",
    "1233953402451529758",
  ],
  team_tag_2: [
    "1217510268993536100",
    "1021137568366084176",
    "1008063321724944465",
    "964945101098995742",
    "1233953402451529758",
  ],
};

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
  if (reaction.emoji.name !== "🤖") {
    console.log(`${reaction.emoji.name} is not the correct reaction`);
    return;
  }

  const channelId = reaction.message.channelId;

  if (
    !tags.team_tag_2.includes(channelId) &&
    !tags.team_tag_1.includes(channelId)
  ) {
    console.log(`Channel ${channelId} is not the correct channel`);
    return;
  }

  // When a reaction is received, check if the structure is partial
  if (reaction.partial) {
    try {
      await reaction.fetch();
      getRoster();
    } catch (error) {
      sendReaction(reaction, "⚠️");
      console.error("Something went wrong when fetching the message:", error);
      return;
    }
  } else {
    getRoster();
  }

  async function getRoster() {
    try {
      let discordId = reaction.message.author.id;
      let content = encodeURIComponent(reaction.message.content);
      let username = reaction.message.author.globalName
        ? reaction.message.author.globalName
        : reaction.message.author.username;
      let team_tag = 1;

      if (tags.team_tag_2.includes(channelId)) {
        team_tag = 2;
      }

      const API_URL = `${process.env.DISCORD_API}?message_content=${content}&channel_id=${team_tag}&discord_id=${discordId}&username=${username}`;
      console.log(API_URL);

      const data = await fetchDataFromAPI(API_URL);
      console.log(data);

      if (data["uploaded_successfully"] === false) {
        sendReaction(reaction, "❌");
        sendPrivateMessage(reaction, user, data["message"]);
      } else {
        sendReaction(reaction, "✅");
        sendPrivateMessage(reaction, user, data["message"]);
      }
    } catch (error) {
      sendReaction(reaction, "⚠️");
      console.error("Something went wrong when fetching the message:", error);
      return;
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

function sendPrivateMessage(reaction, user, message) {
  const messageUser = reaction.message.author;

  if (messageUser?.id === user?.id) {
    messageUser.send(message);
    return;
  }

  messageUser.send(message);
  user.send(message);
}

function sendReaction(reaction, emoji) {
  // reaction.message.reactions.cache
  //   ?.get("🤖")
  //   ?.remove()
  //   ?.catch((error) => console.error("Failed to remove reactions:", error));

  reaction.message.reactions
    .removeAll()
    .catch((error) => console.error("Failed to clear reactions:", error));
  reaction.message.react(emoji);
}
