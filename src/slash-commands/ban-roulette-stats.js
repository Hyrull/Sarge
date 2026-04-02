import { EmbedBuilder } from 'discord.js'
import RouletteStats from '../models/rouletteStats.js'

const banRouletteStats = async (interaction) => {
  try {
    await interaction.deferReply() 
    
    const userId = interaction.user.id
    const guildId = interaction.guild.id
    const userName = interaction.user.globalName || interaction.user.username
    const avatarUrl = interaction.user.displayAvatarURL({ dynamic: true, size: 128 })

    const userStats = await RouletteStats.findOne({ guildId, userId })

    if (!userStats) {
      return interaction.editReply(`You haven't pulled the trigger yet, ${userName}. No stats to display.`)
    }

    // setting it to one if there's none
    let displayLevel = userStats.punishmentLevel || 1

    // we recalculate the timeout here. i don't want a cron job that actually refreshes it - waste of resources. we just refresh it on call
    if (userStats.lastTimeoutDate) {
      const msPassed = Date.now() - userStats.lastTimeoutDate.getTime()
      const decayAmount = Math.floor(msPassed / (1000 * 60 * 60 * 24 * 5)) // 5 days
      
      displayLevel = Math.max(1, displayLevel - decayAmount)
    }

    const nextMawLength = 8 * displayLevel

    const statsEmbed = new EmbedBuilder()
      .setColor('#8d8d8dff')
      .setTitle(`${userName}'s Roulette Record:`)
      // .setThumbnail(avatarUrl)
      .addFields(
        { name: 'Kills', value: `${userStats.totalKills}`, inline: true },
        { name: 'Current Streak', value: `${userStats.currentStreak}`, inline: true },
        { name: '\u200B', value: '\u200B', inline: true }, // Empty spacer column for layout
        { name: 'Maw Visits', value: `${userStats.totalTimeouts}`, inline: true },
        { name: 'Current Heat', value: `Level ${displayLevel}`, inline: true },
        { name: '\u200B', value: '\u200B', inline: true }, // Empty spacer column for layout
        { name: 'Next Sentence Length', value: `${nextMawLength} hours`, inline: false }
      )
      .setFooter({ text: 'The Maw hungers...' })

    await interaction.editReply({ embeds: [statsEmbed] })

  } catch (err) {
    console.error(`[ROULETTE STATS] Fatal error:\n`, err)
    await interaction.editReply("Failed to fetch the archives. Database might be down.").catch(console.error)
  }
}

export default banRouletteStats