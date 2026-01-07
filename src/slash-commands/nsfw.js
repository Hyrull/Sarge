const path = require('path')
const fs = require('fs').promises
const incrementCount = require('../utils/incrementCount')

const easterEggsPath = path.join(__dirname, '../../data/eastereggs.json')
const lv20Role = '518961929583198209'
const modLogsChannelId = '518821248768278528'





async function checkEasterEggs(memberId, interaction) {
  let easterEggTriggered = false
  try {
    const easterEggsData = await fs.readFile(easterEggsPath, 'utf8')
    const easterEggs = JSON.parse(easterEggsData)
    const easterEgg = easterEggs.find(egg => egg.id === memberId)

    if (easterEgg) {
      await interaction.reply(easterEgg.message)
      easterEggTriggered = true
    }
  } catch (err) {
    console.error('Error reading Easter eggs file:', err)
  }
  return easterEggTriggered
}





async function handleNsfwBan(member, interaction) {
  if (interaction.member.roles.cache.has(lv20Role)) {
    interaction.reply("You are above level 20, so I'm saving you. Lucky you...")
  } else {
    await interaction.guild.members.ban(member, { reason: 'Fell for the /nsfw command'})
    console.log(`[NSFW] Banned ${member} due to NSFW command usage.`)
    const nsfwBans = await incrementCount(interaction.guild.id, 'nsfwBans')

    switch (nsfwBans) {
      case 1: {
        await interaction.reply(`${member} is the ${nsfwBans}st person to fall!! HURRAY!`)
        break
      }
      case 2: {
        await interaction.reply(`${member} is the ${nsfwBans}nd person to fall...`)
        break
      }
      case 3: {
        await interaction.reply(`${member} is the ${nsfwBans}rd person to fall...`)
        break
      }
      default: {
        await interaction.reply(`${member} is the ${nsfwBans}th person to fall...`)
      }
    }

    const modLogsChannel = interaction.client.channels.cache.get(modLogsChannelId)
    if (modLogsChannel) {
      await modLogsChannel.send(`${member} has been banned for /nsfw usage.`)
    } else {
        console.error(`Channel with ID '${modLogsChannelId}' not found.`)
    }
  }
}

module.exports = {
  checkEasterEggs,
  handleNsfwBan
}