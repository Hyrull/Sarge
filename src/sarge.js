import 'dotenv/config'
import { Client, IntentsBitField, EmbedBuilder, MessageFlags } from 'discord.js'
import http from 'http'
import mongoose from 'mongoose'

import { getSettings } from './utils/settingsManager.js'
import fetchAndAnnounceGiveaways from './utils/giveawayFetcher.js'
import startReminderDaemon from './utils/reminderDaemon.js'
import RouletteStats from './models/rouletteStats.js'
import messageCreateListener from './listeners/messageCreate.js'

import remindMe from './slash-commands/remindme.js'
import youtubeSearchCommand from './slash-commands/youtube.js'
import toggleFeatures from './slash-commands/feature-toggle.js'
// import { secretRuleCheck } from './secret.js'
import discordStatus from './slash-commands/discordStatus.js'
import featuresCommand from './slash-commands/features.js'
import quotesCommand from './slash-commands/quotes.js'
import pingCommand from './slash-commands/ping.js'
import eventCommand from './slash-commands/event.js'
import feedbackNotice from './slash-commands/feedback.js'
import gptSearch from './slash-commands/gpt-search.js'
import { checkEasterEggs, handleNsfwBan } from './slash-commands/nsfw.js'
import movieSearchCommand from './slash-commands/movie-search.js'
import gameSearch from './slash-commands/gameSearch.js'
import banRoulette from './slash-commands/ban-roulette.js'
import banRouletteStats from './slash-commands/ban-roulette-stats.js'

const greetingsVideo = './data/greetings.mp4'

const client = new Client ({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessageReactions,
  ]
})

//////////////////////////////////////////////////////////////////////////////////

const startTime = Date.now()
console.log(`Bot started at: ${new Date(startTime).toISOString()}`)

function getTimeAndDate() {
  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  const time = now.toLocaleTimeString()
  return `${date} @ ${time}`
}

// start
async function setup() {
  // Let's login to MongoDB
  await mongoose.connect(process.env.MONGODB_LOGIN)
  .then(() => console.log('Connected to MongoDB!'))
  .catch((err) => console.log('Connection to MongoDB failed! Error: ', err))
  
  // Now let's login to Discord
    try {
      client.login(process.env.TOKEN)
    } catch (err) {
      console.error('Error: failed to login to Discord - invalid Token?.')
    }

    // Announce giveaways every hour
    setInterval(() => {
      fetchAndAnnounceGiveaways(client)
    }, 60 * 60 * 1000) // 1 hour 
}

client.on('clientReady', (c) => {
  console.log(`${c.user.tag} is up! ID: ${c.user.id}`)
  
    client.user.setPresence ({
    activities: [{
      name: "Squeak!",
      type: 4 // "custom"
    }],
    status: 'online'
  })
})

//////////////////////    CRON JOBS     /////////////////////////////////

// Free someone from /roulette timeout
setInterval(async () => {
  try {
    const now = new Date()
    // Find everyone whose release time has passed
    const ghosts = await RouletteStats.find({ graveyardRelease: { $lte: now } })

    for (const ghost of ghosts) {
      const guild = client.guilds.cache.get(ghost.guildId)
      if (!guild) continue

      const member = await guild.members.fetch(ghost.userId).catch(() => null)
      if (member) {
        await member.roles.remove('900129282838384682').catch(console.error)
      }

      // Clear their release time so we don't fetch them again
      ghost.graveyardRelease = null
      await ghost.save()
    }
  } catch (err) {
    console.error('[GRAVEYARD CRON] Failed to process resurrections:', err)
  }
}, 60 * 1000)

// Reminder Daemon
  startReminderDaemon(client)

/////////////////////////////////////////////////////////////////////

// Custom slash commands
client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
      let settings = null
        if (interaction.guild) {
        settings = await getSettings(interaction.guild.id);
        }
      
      if(interaction.commandName === "version") {

        const embed = new EmbedBuilder()
        .setColor('#009dff')
        .setTitle("Sarge's latest version")
        .setDescription(`I am currently in **v1.13.1**.\nLast update: July 31st, 2026`)
        .addFields(
          {name : "What's new?", value: '[Changelog](https://github.com/Hyrull/Sarge/blob/main/changelog.txt)'}
        )
        .setFooter({ text: 'Sarge is developed by Hyrul', iconURL: 'https://i.imgur.com/15fnxws.png'})

      await interaction.reply({ embeds: [embed] })
      }

      // if(interaction.commandName === "secret-test") {
      //   secretRuleCheck(interaction)
      //   // command is in secret.js, which isn't public. Sorry, no cheating by checking the code!
      // }

      if (interaction.commandName === "features") {
        featuresCommand(interaction, settings)
      }


      if (interaction.commandName === "french-snake-count") {
        try {
          const embed = new EmbedBuilder()
            .setColor('009dff')
            .setTitle('French snake count')
            .setDescription(`I have reacted a snake to "french" **${settings.frenchSnakeCount}** times!`)

          await interaction.reply({ embeds: [embed] })
        } catch (err) {
          console.error('Error:', err)
        }
      }

      if (interaction.commandName === "american-snake-count") {
        try {
          const embed = new EmbedBuilder()
            .setColor('009dff')
            .setTitle('American snake count')
            .setDescription(`I have reacted a snake to "american" **${settings.americanSnakeCount}** times!`)

          await interaction.reply({ embeds: [embed] })
        } catch (err) {
          console.error('Error:', err)
        }
      }

      if (interaction.commandName === "discord-status") {
        discordStatus(interaction, client)
      }

      if(interaction.commandName === "quotes") {
        quotesCommand(interaction)
      }

      if(interaction.commandName === 'ping') {
        pingCommand(interaction, startTime)
      }

      if(interaction.commandName === "greetings") {
        interaction.reply({files: [greetingsVideo]})
      }
      
      if(interaction.commandName === "event") {
        eventCommand(interaction)
      }
      
      if(interaction.commandName === "youtube") {
        await interaction.deferReply()
        await youtubeSearchCommand(interaction)
      }

      if(interaction.commandName === "roulette") {
        const wantsStats = interaction.options.getBoolean('stats')
        if (wantsStats) {
          await banRouletteStats(interaction)
        } else {
          await banRoulette(interaction)
        }
        return
      }

      if(interaction.commandName === "question") {
        const lv40Role = '518962130372919317'

        // Fetching VIP list from .env
        const vipList = process.env.SARGE_VIPS ? process.env.SARGE_VIPS.split(',').map(id => id.trim()) : [];
        // If we're on the guild - check if they're Lv.40. If it's in DMs, check if they're a VIP.
        const hasAccess = interaction.guild
          ? interaction.member.roles.cache.has(lv40Role) || vipList.includes(interaction.user.id)
          : vipList.includes(interaction.user.id) // In DMs, only VIPs get access


        if (hasAccess) {
          await interaction.deferReply()
          const answer = await gptSearch(interaction)
          await interaction.editReply(answer)
        } else {
          await interaction.reply({ content: `You don't have access to this command.`, flags: MessageFlags.Ephemeral })
        }
      }
      
      if(interaction.commandName === "nsfw") {
        const eggTriggered = await checkEasterEggs(interaction.member.id, interaction)
        if (!eggTriggered) {
          console.log(`${interaction.member.user.tag} used the /nsfw command and has no easter egg...`)
          handleNsfwBan(interaction.member, interaction)
        }
      }



      if (interaction.commandName === "toggle") {
        await toggleFeatures(interaction.options, interaction)
      }

      if (interaction.commandName === 'feedback') {
        const timeAndDate = getTimeAndDate()
        feedbackNotice(client, interaction, timeAndDate)
      }

      if (interaction.commandName === "movie") {
        await movieSearchCommand(interaction)
      }

      if (interaction.commandName === "game") {
        await gameSearch(interaction)
      }

      if (interaction.commandName === 'remindme') {
        await remindMe(interaction)
        return
      }
    }
  }
)



// Mainly funny joke stuff there.
client.on('messageCreate', (msg) => messageCreateListener(msg, client))

setup()

http.createServer((req, res) => {
  res.writeHead(200)
  res.end('Sarge is running!')
}).listen(8300, '0.0.0.0', () => {
  console.log('Health check server listening on port 8300')
})

export { client }