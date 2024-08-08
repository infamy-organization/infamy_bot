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
    ],
  },
  {
    name: "ping",
    description: "Returns Pong!",
  },
  {
    name: "my_placement",
    description:
      "Return their current placement on the leaderboard based on tournament_id",
    options: [
      {
        name: "tournament_id",
        description: "The tournament Id for a game",
        type: ApplicationCommandOptionType.Integer,
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");
    //   await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
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
