const fsPromises = require('fs').promises

const toggleFeatures = async (frenchSnakeOption, gorfilOption, modList, interaction, configPath) => {
  const replies = []
  if (!modList.includes(interaction.user.id)) {
    interaction.reply('This feature can only be used by a bot moderator.')
    return }

  if (frenchSnakeOption !== undefined) {
    try {
      const data = await fsPromises.readFile(configPath, 'utf8')
      const config = JSON.parse(data)
      frenchSnake = frenchSnakeOption
      config['french-react'] = frenchSnakeOption
      await fsPromises.writeFile(configPath, JSON.stringify(config, null, 2))
      replies.push(`Feature "french snake" set to ${frenchSnake}.`)      
    } catch (err) {
       console.log('Error: Could not write to config file', err)
    }
  }

  if (gorfilOption !== undefined) {
    try {
      const data = await fsPromises.readFile(configPath, 'utf8')
      const config = JSON.parse(data)
      gorfilReact = gorfilOption
      config['gorfil-react'] = gorfilOption
      await fsPromises.writeFile(configPath, JSON.stringify(config, null, 2))
      } catch (err) {
        console.log('Error: Could not write to config file', err)
      }
    replies.push(`Feature "gorfil react" set to ${gorfilOption}.`)
  }

  if (replies.length === 0) {
    interaction.reply('Please select a feature to toggle on or off.')
  } else {
    interaction.reply(replies.join('\n'))
  }
}

module.exports = { toggleFeatures }