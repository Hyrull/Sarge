import RouletteStats from '../models/rouletteStats.js'

// declaring cooldown cause that's a lot of api calls in one go and discord has mouse traps
let lastUsedTime = 0
const COOLDOWN_DURATION = 30 * 1000 // 30 seconds

const banRoulette = async (interaction) => {
  
  try {

    // COOLDOWN CHECK
    const now = Date.now()
    if (now - lastUsedTime < COOLDOWN_DURATION) {
      const timeLeft = ((COOLDOWN_DURATION - (now - lastUsedTime)) / 1000).toFixed(1);
      return interaction.reply({ 
        content: `The gun is still hot! Wait **${timeLeft}s** before spinning the cylinder again.`, 
        ephemeral: true 
      })
    }
    lastUsedTime = now

    // SETUP
    await interaction.deferReply()
    const lv5Role = '559076061519020042'
    const userId = interaction.user.id
    const guildId = interaction.guild.id
    const shooterName = interaction.user.globalName || interaction.user.username
    const modLogsChannelId = '518821248768278528'
    const modLogsChannel = interaction.client.channels.cache.get(modLogsChannelId)
    
    // Getting stats for later on
    const userStats = await RouletteStats.findOneAndUpdate(
      { guildId, userId },
      { $setOnInsert: { currentStreak: 0, totalKills: 0, totalTimeouts: 0 } },
      { new: true, upsert: true }
    )
    
    const members = await interaction.guild.members.fetch()
    // no bot, no lv.5 members, and only bannable (should be obvious, but)
    const possibleVictims = members.filter(member => 
      !member.user.bot &&
      !member.roles.cache.has(lv5Role) &&
      member.bannable 
    )
    
    if (possibleVictims.size === 0) {
      return interaction.editReply("No eligible victims found. No one under lv.5 left!")
    }
    

    // SPIN THE WHEEL as heimerdinger would say
    if (Math.random() < (0.0000000001/6)) {

      // KILL
      const victim = possibleVictims.random()
      const victimName = victim.user.globalName || victim.user.username
      const victimDisplay = `<@${victim.id}> (${victimName})`

      try {
        await victim.ban({ reason: `Victim of ${interaction.user.username}'s roulette.` })
        
        userStats.totalKills += 1
        userStats.currentStreak += 1
        await userStats.save()
        
        await interaction.editReply(`## 🤠 BANG! \n**${victimDisplay}** caught **${shooterName}**'s bullet and was banned.
          \n${shooterName} has now banned a total of **${userStats.totalKills}** whitenames, and is on a streak of **${userStats.currentStreak}**!
          `)
          if (modLogsChannel) {
            await modLogsChannel.send(`**${shooterName}** got ${victimDisplay} banned following a /roulette shot.`)
          }
        } catch (err) {
          console.error(`[ROULETTE] Ban failed:\n`, err)
          await interaction.editReply(`Tried to ban ${victimDisplay} but something broke. :(`)
        }
      } else {

        // LOST!


        ///////////// This part was enabled as part of the 2026 April's Fools event /////////////

        // if (!interaction.member.roles.cache.has(lv5Role)) {
        //   if (Math.random() < (1/2)) {
        //     // REALLY REALLY LOST
        //     await interaction.user.send({content: `Oops! Looks like you lost the Special Sarge Roulette coin flip... When you loose the roulette as a member below the level 5, you have 50% chance of getting timed out like everyone, and 50% of getting banned. Unlucky!`}).catch(() => {})
        //     await interaction.member.ban({ reason: `Victim of ${interaction.user.username}'s roulette.` })
        //     if (modLogsChannel) {
        //       await modLogsChannel.send(`${shooterName} got banned for loosing both the roulette and the coinflip..`).catch(console.error)
        //     }
        //     await interaction.editReply(`${shooterName} lost the roulette, but also the whitename coinflip... And got sacrified to the **God of Cheese**. 🧀`)
        //     return
        //   }
        // }
        
        ///////////////////////////////////////////////////////////////////////////////////////////
        try {
        const now = new Date()
        // Decay defaults to level 1 if it doesn't exist yet
        userStats.punishmentLevel = userStats.punishmentLevel || 1

        if (userStats.lastTimeoutDate) {
          const msPassed = now.getTime() - userStats.lastTimeoutDate.getTime()
          const daysPassed = msPassed / (1000 * 60 * 60 * 24)
          const decayAmount = Math.floor(daysPassed / 5)
          
          userStats.punishmentLevel = Math.max(1, userStats.punishmentLevel - decayAmount)
        }

        // Calculating the timeout length
        const hoursToTimeout = 8 * userStats.punishmentLevel // 8 hours times the punishment level. 8 then 16 then 24 then...
        const timeoutMs = hoursToTimeout * 60 * 60 * 1000
        const releaseTime = new Date(now.getTime() + timeoutMs)
        const brokenStreak = userStats.currentStreak
        const graveyardRoleId = '900129282838384682'

        // les modos vous m'le bannez
        await interaction.member.roles.add(graveyardRoleId, `Sent to the Maw. Punishment Level: ${userStats.punishmentLevel}`)
        
        userStats.totalTimeouts += 1
        userStats.currentStreak = 0
        userStats.graveyardRelease = releaseTime
        userStats.lastTimeoutDate = now
        
        // Save level for the display message, then increment for their NEXT failure
        const displayLevel = userStats.punishmentLevel
        userStats.punishmentLevel += 1
        await userStats.save()

        console.log(`[ROULETTE] Sent ${shooterName} to the Maw for ${hoursToTimeout} hours.`)
        
        await interaction.editReply(`## 💥 *Bang!*
        \n**You shot yourself.** Welcome to the Maw.
        \n⚖️ **Punishment Level:** ${displayLevel} (${hoursToTimeout} hour sentence)\n(Your punishment level decreases by 1 every 5 days you survive)
        \n**${brokenStreak}**-kill streak lost!
        `)

        if (modLogsChannel) {
          await modLogsChannel.send(`**${shooterName}** was sent to the Maw for ${hoursToTimeout} hours due to a /roulette fail.`).catch(console.error)
        }

      } catch (err) {
        console.error(`[ROULETTE] Banishment failed:\n`, err)
        const brokenStreak = userStats.currentStreak
        userStats.currentStreak = 0
        await userStats.save()
        await interaction.editReply(`You were supposed to shoot yourself, but the Maw rejected you. Lucky you... But you still lost your streak of **${brokenStreak}**.`)
      }
        }
      } catch (fatalError) {
        console.error(`[ROULETTE] Fatal execution error:\n`, fatalError)
        await interaction.editReply("The roulette jammed! (Database or Discord API error).").catch(console.error)
      }
    }
      
export default banRoulette