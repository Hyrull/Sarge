require('dotenv').config()
const { Client, IntentsBitField, EmbedBuilder, MessageFlags } = require('discord.js')
const http = require('http')
const mongoose = require('mongoose')
const { getSettings, updateSettingsInCache } = require('./utils/settingsManager')

const { youtubeSearchCommand } = require('./slash-commands/youtube')
const { toggleFeatures } = require('./slash-commands/feature-toggle')
// const { secretRuleCheck } = require('./secret')
const { discordStatus } = require('./slash-commands/discordStatus')
const { featuresCommand } = require('./slash-commands/features')
const { quotesCommand } = require('./slash-commands/quotes')
const { pingCommand } = require('./slash-commands/ping')
const { eventCommad } = require('./slash-commands/event')
const { feedbackNotice } = require('./slash-commands/feedback')
const { gptSearch } = require('./slash-commands/gpt-search')
const { default: messageCreateListener } = require('./listeners/messageCreate')
const { checkEasterEggs, handleNsfwBan } = require('./slash-commands/nsfw')

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
}

client.on('ready', (c) => {
  console.log(`${c.user.tag} is up! ID: ${c.user.id}`)
})


/////////////////////////////////////////////////////////////////////

// Custom slash commands
client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
      const settings = await getSettings(interaction.guild.id)
      
      if(interaction.commandName === "version") {

        const embed = new EmbedBuilder()
        .setColor('009dff')
        .setTitle("Sarge's latest version")
        .setDescription(`I am currently in **v.1.8.2**.\nLast update: June 11th, 2025`)
        .addFields(
          {name : "What's new?", value: '[Changelog](https://github.com/Hyrull/Sarge/blob/main/changelog.txt)'}
        )
        .setFooter({ text: 'Sarge is developed by Hyrul', iconURL: 'https://imgur.com/15fnxws.png'})

      await interaction.reply({ embeds: [embed] })
      }

      // if(interaction.commandName === "secret-test") {
      //   secretRuleCheck(interaction)
      //   // command is in secret.js, which isn't public. Sorry, no cheating by checking the code!
      // }

      if(interaction.commandName === "features") {
        featuresCommand(interaction, settings)
      }


      if(interaction.commandName === "french-snake-count") {
        try {
          const embed = new EmbedBuilder()
            .setColor('009dff')
            .setTitle('French snake count')
            .setDescription(`I have reacted a snake to "french" **${settings.frenchSnakeCount}** times!`)
            // .setFooter({ text: 'Sarge developed by Hyrul', iconURL: 'https://imgur.com/15fnxws.png'})

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
        eventCommad(interaction)
      }
      
      if(interaction.commandName === "youtube") {
        await interaction.deferReply()
        await youtubeSearchCommand(interaction)
      }
      
      if(interaction.commandName === "question") {
        const lv40Role = '518962130372919317'

        // Since this command uses OpenAI tokens thus actual money, I'm locking it behind a level 40 role.
        if (interaction.member.roles.cache.has(lv40Role)) {
          await interaction.deferReply()
          const answer = await gptSearch(interaction)
          await interaction.editReply({ content: answer })
        } else {
          await interaction.reply({ content: 'You need to be level 40 or more to use this command.', flags: MessageFlags.Ephemeral })
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

module.exports = { client }