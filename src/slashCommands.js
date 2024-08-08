export const slashCommandFunctions = {
  ping: ping,
  my_team: myTeam,
};

function ping(interaction) {
  return "Pong!!!";
}

async function myTeam(interaction) {
  const [tournament_id] = interaction.options._hoistedOptions;
  const channel_id = interaction.channelId;
  const discord_id = interaction.user.id;

  const API_URL = `${process.env.DISCORD_API}?tournament_id=${tournament_id.value}&game=${channel_id}&discord_id=${discord_id}&func=`;
  console.log(API_URL);

  //   const data = await fetchDataFromAPI(API_URL);
  //   console.log(data);
  return `${tournament_id.value}`;
}
