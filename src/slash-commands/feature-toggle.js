const { updateSettingsInCache } = require('../util/settingsManager')

const toggleFeatures = async (options, interaction) => {
  const replies = []
  const logLine = []
  const settingsMap = {
    frenchSnake: 'french-snake',
    englishTea: 'english-tea',
    gorfil: 'gorfil',
    crazy: 'crazy',
    crazyOdds: 'crazy-odds'
  }

    for (const [key, optionName] of Object.entries(settingsMap)) {
    const value = options.get(optionName)?.value
    if (value !== undefined) {
      await updateSettingsInCache(interaction.guildId, { [key]: value })
      replies.push(`Feature "${key}" set to ${value}.`)
      logLine.push(`User ${interaction.user.globalName}[${interaction.user.id}] set "${key}" to ${value}.`)
    }
  }

    if (replies.length === 0) {
      // Should never happen since Discord would prevent the command from being sent if it's empty
    await interaction.reply('Please select a feature to toggle on or off.')
    return 'Toggle called, but no option selected.'
  } else {
    await interaction.reply(replies.join('\n'))
    return logLine.join(' ')
  }

}

module.exports = { toggleFeatures }