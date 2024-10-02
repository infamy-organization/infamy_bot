import { fetchDataFromAPI } from "./utils.js";

export const slashCommandFunctions = {
  ping: ping,
  my_team: myTeam,
  get_team: getTeam,
  assign_role: assignRole,
};

function ping(interaction) {
  return "Pong!!!";
}

async function myTeam(interaction) {
  const [tournament_id, game] = interaction.options._hoistedOptions;
  const discord_id = interaction.user.id;
  let username = interaction.user.globalName
    ? interaction.user.globalName
    : interaction.user.username;

  const API_URL = `${process.env.DISCORD_API}?tournament_id=${tournament_id.value}&game=${game.value}&discord_id=${discord_id}&func=my_team`;
  console.log(API_URL);
  const data = await fetchDataFromAPI(API_URL);
  const discordData = data?.data;
  console.log(discordData);

  let message;

  if (data.uploaded_successfully) {
    const team = discordData?.recent_team?.map((player) => {
      return `${player?.player_name} --- ${player?.infamy_score} --- ${
        player?.is_player_in ? "In" : "Out"
      }`;
    });

    message = `
Tournament Id: ${tournament_id.value}
Game: ${game.value}
Discord User: ${username}
Placement: ${discordData?.placement}
Infamy score: ${discordData?.infamy_score}
  
--------------------------------------------
Pro Player Name --- Infamy Score --- In/Out
--------------------------------------------
${team.join("\n")}
--------------------------------------------
`;
    return message;
  }

  return data.message;
}

async function getTeam(interaction) {
  const [tournament_id, discord_member, game] =
    interaction.options._hoistedOptions;

  let username = discord_member.user.globalName
    ? discord_member.user.globalName
    : discord_member.user.username;

  const API_URL = `${process.env.DISCORD_API}?tournament_id=${tournament_id.value}&game=${game.value}&discord_id=${discord_member.value}&func=my_team`;
  console.log(API_URL);
  const data = await fetchDataFromAPI(API_URL);
  const discordData = data?.data;
  console.log(discordData);

  let message;

  if (data.uploaded_successfully) {
    const team = discordData?.recent_team?.map((player) => {
      return `${player?.player_name} --- ${player?.infamy_score} --- ${
        player?.is_player_in ? "In" : "Out"
      }`;
    });

    message = `
Tournament Id: ${tournament_id.value}
Game: ${game.value}
Discord User: ${username}
Placement: ${discordData?.placement}
Infamy score: ${discordData?.infamy_score}
  
--------------------------------------------
Pro Player Name --- Infamy Score --- In/Out
--------------------------------------------
${team.join("\n")}
--------------------------------------------
`;
    return message;
  }

  return data.message;
}

async function assignRole(interaction) {
  const { options, member } = interaction;
  const [discord_member, role] = options._hoistedOptions;

  console.log("---------------------------------");
  console.log("---------------------------------");
  console.log(discord_member);
  console.log("---------------------------------");
  console.log(member.roles.cache);
  console.log("---------------------------------");

  const fetched_member = await interaction.guild.members.fetch(
    "1010586282075885609"
  );

  console.log("---------------------------------");

  var roler = fetched_member.roles.cache.find(
    (role) => role.name === "role name"
  );

  if (!role) return;
  fetched_member.guild.roles.add(roler);
  console.log(fetched_member.roles.cache);

  console.log("---------------------------------");
  console.log("---------------------------------");
  console.log("---------------------------------");
  return "Invalid member or role.";
  // await reaction.fetch();

  if (!discord_member || !role) {
    return "Invalid member or role.";
  }

  try {
    await member.roles.add(role);
    return `${member.user.tag} has been assigned the role "${role.name}".`;
  } catch (error) {
    console.error(error);
    return "I was unable to assign the role. Please check my permissions and role hierarchy.";
  }
}
