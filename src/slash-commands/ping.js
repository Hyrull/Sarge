const { MessageFlags } = require("discord.js");

const pingCommand = async (interaction, startTime) => {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral })
  const ping = interaction.client.ws.ping
  
  // Uptime
  const nowTime = Date.now()
  const uptimeMs = nowTime - startTime
  const formatUptime = (ms) => {
    const seconds = Math.floor(ms / 1000) % 60
    const minutes = Math.floor(ms / (1000 * 60)) % 60
    const hours = Math.floor(ms / (1000 * 60 * 60)) % 24
    const days = Math.floor(ms / (1000 * 60 *60 * 24))
    
    return `${days} day${days !== 1 ? 's' : ''}, ` +
    `${hours} hour${hours !== 1 ? 's' : ''}, ` +
    `${minutes} minute${minutes !== 1 ? 's' : ''}, ` +
    `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  
  const uptimeFormatted = formatUptime(uptimeMs)
  await interaction.editReply({ content: `*Pong! Latency: **${ping}**ms*\nUptime: ${uptimeFormatted}`, flags: MessageFlags.Ephemeral }) 
}

module.exports = { pingCommand }