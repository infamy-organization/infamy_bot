import { configDotenv } from "dotenv";
//import dotenv
configDotenv();
import { REST, Routes, ApplicationCommandOptionType } from "discord.js";

const commands = [
  {
    name: "my_team",
    description: "Returns a user team based on tournament_id",
    options: [
      {
        name: "tournament_id",
        description: "The tournament Id for a game",
        type: ApplicationCommandOptionType.Integer,
        required: true,
      },
      {
        name: "game",
        description: "The game you want to check",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          { name: "Valorant", value: "valorant" },
          { name: "R6 siege", value: "r6 siege" },
          { name: "Overwatch", value: "overwatch" },
        ],
      },
    ],
  },
  {
    name: "ping",
    description: "Returns Pong!",
  },
  {
    name: "get_team",
    description:
      "Returns a user team based on tournament_id, username, and game",
    options: [
      {
        name: "tournament_id",
        description: "The tournament Id for a game",
        type: ApplicationCommandOptionType.Integer,
        required: true,
      },
      {
        name: "discord_member",
        description: "The discord member you want to see",
        type: ApplicationCommandOptionType.Mentionable,
        required: true,
      },
      {
        name: "game",
        description: "The game you want to check",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          { name: "Valorant", value: "valorant" },
          { name: "R6 siege", value: "r6 siege" },
          { name: "Overwatch", value: "overwatch" },
        ],
      },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");
    // await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
