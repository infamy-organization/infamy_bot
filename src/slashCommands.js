import { fetchDataFromAPI } from "./utils.js";

export const slashCommandFunctions = {
  ping: ping,
  my_team: myTeam,
  get_team: getTeam,
  assign_role: assignRole,
  remove_role: removeRole,
  cleanse_lurkers: cleanseLurkers,
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

async function removeRole(interaction) {
  console.log("Started Role assignment.");
  const { options } = interaction;
  const [discord_member, role] = options._hoistedOptions;

  if (!discord_member || !role) {
    return "Invalid member or role.";
  }

  try {
    // Fetch the member by their ID if needed, but in most cases, the discord_member is enough
    const fetched_member = await interaction.guild.members.fetch(
      discord_member.value
    );

    // Check if the role exists and is valid
    const fetched_role = interaction.guild.roles.cache.get(role.value);

    if (!fetched_role) {
      return `Role ${role.value} not found.`;
    }

    // Add the role to the member
    await fetched_member.roles.remove(fetched_role);
    console.log("Role successfully removed.");

    return `${fetched_member.user.tag} has been removed the role "${fetched_role.name}".`;
  } catch (error) {
    console.error(error);
    return "I was unable to remove the role. Please check my permissions and role hierarchy.";
  }
}

async function assignRole(interaction) {
  console.log("Started Role assignment.");
  const { options } = interaction;
  const [discord_member, role] = options._hoistedOptions;

  if (!discord_member || !role) {
    return "Invalid member or role.";
  }

  try {
    // Fetch the member by their ID if needed, but in most cases, the discord_member is enough
    const fetched_member = await interaction.guild.members.fetch(
      discord_member.value
    );

    // Check if the role exists and is valid
    const fetched_role = interaction.guild.roles.cache.get(role.value);

    if (!fetched_role) {
      return `Role ${role.value} not found.`;
    }

    // Add the role to the member
    await fetched_member.roles.add(fetched_role);
    console.log("Role successfully added.");

    return `${fetched_member.user.tag} has been assigned the role "${fetched_role.name}".`;
  } catch (error) {
    console.error(error);
    return "I was unable to assign the role. Please check my permissions and role hierarchy.";
  }
}

async function cleanseLurkers(interaction) {
  console.log("Started Lurkers Cleansing.");
  const members = await interaction.guild.members.fetch();
  const gameRoles = [
    "1292062316514250804", // The Big Shitter
    "1290998862500069436", // Infamous
  ];
  let numberOfLurkers = 0;

  const lurkerRoleId = "1302950113098072064";

  for (let member of members) {
    let memberId = member[1].user.id;

    // Fetch the member by their ID if needed, but in most cases, the discord_member is enough
    const fetched_member = await interaction.guild.members.fetch(memberId);
    const memberRoles = fetched_member.roles.cache;
    const roleIds = memberRoles.map((role) => role.id);
    let hasAGameRole = roleIds.some((element) => gameRoles.includes(element));

    if (roleIds.includes(lurkerRoleId) && hasAGameRole) {
      // Check if the role exists and is valid
      const fetched_role = interaction.guild.roles.cache.get(lurkerRoleId);

      if (!fetched_role) {
        return `Role ${role.value} not found.`;
      }

      // Add the role to the member
      await fetched_member.roles.remove(fetched_role);
      console.log("Role successfully removed.");
      numberOfLurkers++;
    }
  }

  return `${numberOfLurkers} Lurker roles have been removed.`;
}
