const fsPromises = require('fs').promises

const toggleFeatures = async (frenchSnakeOption, gorfilOption, crazyOption, crazyOddsSet, modList, interaction, configPath) => {
  const replies = []
  const logLine = []

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
      logLine.push(`User ${interaction.user.globalName}[${interaction.user.id}] set "French snake" to ${frenchSnake}.`)    
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
    logLine.push(`User ${interaction.user.globalName}[${interaction.user.id}] set "Gorfil reactions" to ${gorfilReact}.`)
  }

  if (crazyOption !== undefined) {
    try {
      const data = await fsPromises.readFile(configPath, 'utf8')
      const config = JSON.parse(data)
      crazyReact = crazyOption
      config['crazy'] = crazyOption
      await fsPromises.writeFile(configPath, JSON.stringify(config, null, 2))
      } catch (err) {
        console.log('Error: Could not write to config file', err)
      }
    replies.push(`Feature "crazy react" set to ${crazyOption}.`)
    logLine.push(`User ${interaction.user.globalName}[${interaction.user.id}] set "Crazy React" to ${crazyReact}.`)
  }

  if (crazyOddsSet !== undefined) {
    try {
      const data = await fsPromises.readFile(configPath, 'utf8')
      const config = JSON.parse(data)
      crazyOdds = crazyOddsSet
      config['crazy-odds'] = crazyOddsSet
      await fsPromises.writeFile(configPath, JSON.stringify(config, null, 2))
      } catch (err) {
        console.log('Error: Could not write to config file', err)
      }
    replies.push(`Feature "crazy react" set to ${crazyOddsSet}% chance of happening.`)
    logLine.push(`User ${interaction.user.globalName}[${interaction.user.id}] set "Crazy Odds" to ${crazyOddsSet}.`)
  }

  if (replies.length === 0) {
    interaction.reply('Please select a feature to toggle on or off.')
    return('Toggle called, but no option selected.')
  } else {
    interaction.reply(replies.join('\n'))
    return (logLine.join(' '))
  }
}

module.exports = { toggleFeatures }