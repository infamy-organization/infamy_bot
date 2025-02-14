import { config } from "dotenv";
import { Client, GatewayIntentBits, Partials, Events } from "discord.js";
import { slashCommandFunctions } from "./slashCommands.js";
import { fetchDataFromAPI } from "./utils.js";
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

  const slashCommandFunc = slashCommandFunctions?.[interaction.commandName];

  if (!slashCommandFunc) return;

  await interaction.deferReply();
  const message = await slashCommandFunc(interaction);
  await interaction.editReply(message);
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
      let team_tag = 1;
      let discordId = reaction.message.author.id;
      let content = encodeURIComponent(reaction.message.content);
      let username = reaction.message.author.globalName
        ? reaction.message.author.globalName
        : reaction.message.author.username;

      const gameEndPoint = {
        "r6 siege": "r6_create_team",
        valorant: "valorant_create_team",
        overwatch: "overwatch_create_team",
      };

      let messageContent = reaction.message.content;
      messageContent = messageContent.split("\n");
      let gameName = messageContent[0].toLowerCase().trim();
      const func = gameEndPoint[gameName];

      if (tags.team_tag_2.includes(channelId)) {
        team_tag = 2;
      }

      const API_URL = `${process.env.DISCORD_API}?message_content=${content}&channel_id=${team_tag}&discord_id=${discordId}&username=${username}&func=${func}`;
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
      console.log("Something went wrong when fetching the message:", error);
      return;
    }
  }
});

client.login(process.env.TOKEN);

async function sendPrivateMessage(reaction, user, message) {
  const messageUser = reaction.message.author;
  message = `Message for ${
    messageUser.globalName || messageUser.username
  }:\n\n${message}`;

  try {
    if (messageUser?.id === user?.id) {
      await messageUser.send(message);
    } else {
      await messageUser.send(message);
      await user.send(message);
    }
  } catch (error) {
    console.error(
      `Failed to send DM to ${messageUser.username}: ${error.message}`
    );
  }
}

function sendReaction(reaction, emoji) {
  // reaction.message.reactions.cache
  //   ?.get("🤖")
  //   ?.remove()
  //   ?.catch((error) => console.error("Failed to remove reactions:", error));

  reaction.message.reactions
    .removeAll()
    .catch((error) => console.error("Failed to clear reactions:", error));
  try {
    reaction.message.react(emoji);
  } catch (error) {
    console.error("Failed to react:", error);
  }
}
