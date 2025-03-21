const { ActivityType } = require('discord.js')

const discordStatus = (interaction, client) => {

  const newStatus = interaction.options.get('status').value
  const activityType = interaction.options.get('activity-type').value
  const presence = interaction.options.get('presence').value

  client.user.setPresence ({
    activities: [{
      name: newStatus,
      type: ActivityType[activityType]
    }],
    status: presence
  })

  interaction.reply({content: `Sarge's status updated!`, ephemeral: true})
}

module.exports = { discordStatus }