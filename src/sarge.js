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
// import { secretRuleCheck } from './slash-commands/secret.js'
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

    // Announce giveaways every hour.
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
        await member.roles.remove(process.env.MAW_ROLE_ID).catch(console.error)
      }

      // Clear their release time so we don't fetch them again
      ghost.graveyardRelease = null
      await ghost.save()
    }
  } catch (err) {
    console.error('[GRAVEYARD CRON] Failed to process resurrections:', err)
  }
}, 60 * 1000)

// Reminder Daemon (for /reminderme)
  startReminderDaemon(client)

/////////////////////////////////////////////////////////////////////

// Custom slash commands
client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
      let settings = null

      // reading back-oustanding, i query my DB on every / command. Remind me to optimize this.
        if (interaction.guild) {
          settings = await getSettings(interaction.guild.id);
        }


      
      if(interaction.commandName === "version") {
        // Update this manually if you will, or just leave it as is if you wanna credit me or didn't change your fork.
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


      // /secret is a game where people need to find the secret rule, by trying out different strings.
      // The bot returns true or false depending on if the offered string passes the rule or not.
      // Users can try out different strings and deduct the final rule. Edit the rule in slash-commands/secret.js
      // Add secret.js to .gitignore if your code if you started the game and your code is open-source. users could peak. 

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
        // for bot mods to edit Sarge's discord status
        discordStatus(interaction, client)
      }

      if(interaction.commandName === "quotes") {
        // very specific to my own discord and you might as well disable this
        quotesCommand(interaction)
      }

      if(interaction.commandName === 'ping') {
        pingCommand(interaction, startTime)
      }

      if(interaction.commandName === "greetings") {
        // don't ask
        interaction.reply({files: [greetingsVideo]})
      }
      
      if(interaction.commandName === "event") {
        // adds or remove the 'event' role
        eventCommand(interaction)
      }
      
      if(interaction.commandName === "youtube") {
        // lookup youtube videos. features a way to browse through results
        await interaction.deferReply()
        await youtubeSearchCommand(interaction)
      }

      if(interaction.commandName === "roulette") {
        // genuinely 80% chance of banning a random unprotected user and 20% chance of timing you out for incremental lengths (default 8 hours)
        const wantsStats = interaction.options.getBoolean('stats')
        if (wantsStats) {
          await banRouletteStats(interaction)
        } else {
          await banRoulette(interaction)
        }
        return
      }

      if(interaction.commandName === "question") {

        // Googles the question. Fetches results. Uses GPT to summary the answer based off the source and its own knowledge.
        // Has context of the channel's history in which the command is used, meaning Sarge will answer on topic

        const allowanceRole = process.env.QUESTION_CLEARANCE_ROLE_ID // On my own discord: lv.40 role

        // Fetching VIP list from .env
        const vipList = process.env.SARGE_VIPS ? process.env.SARGE_VIPS.split(',').map(id => id.trim()) : []
        // If we're on the guild - check if they have the allowance role. If it's in DMs, check if they're a VIP.
        const hasAccess = interaction.guild
          ? interaction.member.roles.cache.has(allowanceRole) || vipList.includes(interaction.user.id)
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
        // F*cking bans the user using this command unless they're protected one way or another.
        const eggTriggered = await checkEasterEggs(interaction.member.id, interaction)
        if (!eggTriggered) {
          console.log(`${interaction.member.user.tag} used the /nsfw command and has no easter egg...`)
          handleNsfwBan(interaction.member, interaction)
        }
      }



      if (interaction.commandName === "toggle") {
        // toggle misc features off such as "crazy", "french snake" etc
        await toggleFeatures(interaction.options, interaction)
      }

      if (interaction.commandName === 'feedback') {
        // dms the bot admin with feedback
        const timeAndDate = getTimeAndDate()
        feedbackNotice(client, interaction, timeAndDate)
      }

      if (interaction.commandName === "movie") {
        // lookup any movie on TMDB. featuring a way to browse through results
        await movieSearchCommand(interaction)
      }

      if (interaction.commandName === "game") {
        // lookup any game on TGDB, featuring a way to browse through results
        await gameSearch(interaction)
      }

      if (interaction.commandName === 'remindme') {
        // pings the user about what they wanted to be reminded about, when they wanted to be reminded of it
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
  res.end(`${c.user.tag} is running!`)
}).listen(8300, '0.0.0.0', () => {
  console.log('Health check server listening on port 8300')
})

export { client }