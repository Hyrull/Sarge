import path from 'path'
import fs from 'node:fs/promises'
import incrementCount from '../utils/incrementCount.js'

const easterEggsPath = path.join(import.meta.dirname, '../../data/eastereggs.json')
const nsfwBanProtectionRole = process.env.NSFW_PROTECTED_ROLE_ID 
const modLogsChannelId = process.env.MOD_LOGS_CHANNEL

// THIS IS NOT A NSFW COMMAND!!
// Nor does it do anything nsfw.
// This is a joke command than bans the user using it,
// unless they have a role that protects them.
// I have a very silly community.


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
  if (interaction.member.roles.cache.has(nsfwBanProtectionRole)) {
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

export {
  checkEasterEggs,
  handleNsfwBan
}