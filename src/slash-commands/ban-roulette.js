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
    if (Math.random() < (5/6)) {

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
            await modLogsChannel.send(`${shooterName} got ${victimDisplay} banned following a /roulette shot.`)
          }
        } catch (err) {
          console.error(`[ROULETTE] Ban failed:\n`, err)
          await interaction.editReply(`Tried to ban ${victimDisplay} but something broke. :(`)
        }
      } else {

        // LOST!
        
        try {
          const timeoutMs = 24 * 60 * 60 * 1000 // 24 hours
          const brokenStreak = userStats.currentStreak
          await interaction.member.timeout(timeoutMs, 'Self-shot from the ban roulette!')
          userStats.totalTimeouts += 1
          userStats.currentStreak = 0
          await userStats.save()
          
          console.log(`[ROULETTE] Timed out ${shooterName} due to a ban roulette fail.`)
          await interaction.editReply(`## 💥 *Bang!*
            \n**You shot yourself**. Enjoy your 24-hour timeout!
            \n**${brokenStreak}**-kills streak lost!
            `)

            if (modLogsChannel) {
              await modLogsChannel.send(`${shooterName} has been timed out for 24 hours due to a /roulette fail.`)
            }
          } catch (err) {
            console.error(`[ROULETTE] Timeout failed:\n`, err)
            
            const brokenStreak = userStats.currentStreak
            userStats.currentStreak = 0
            await userStats.save()
            
            await interaction.editReply(`You were supposed to shoot yourself, but you were saved by an internal error or by my lack of permissions. Lucky you... But you still lost your streak of **${brokenStreak}**.`)
          }
        }
      } catch (fatalError) {
        console.error(`[ROULETTE] Fatal execution error:\n`, fatalError)
        await interaction.editReply("The roulette jammed! (Database or Discord API error).").catch(console.error)
      }
    }
      
export default banRoulette