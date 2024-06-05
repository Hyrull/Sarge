require('dotenv').config()
const { Client, IntentsBitField, Embed, EmbedBuilder, InteractionCollector } = require('discord.js')
const { config } = require('dotenv')
const internal = require('stream')
const fs = require('fs')
const fsPromises = require('fs').promises


const { secretRuleCheck } = require('./secret');
const { youtubeSearchCommand } = require('./slash-commands/youtube')

const client = new Client ({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessageReactions,
  ]
})



let customModerators = []
let frenchSnake = true
let gorfilReact = true
const configPath = './config.json'

function getTimeAndDate() {
  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  const time = now.toLocaleTimeString()
  return `${date} | ${time}`
}

function addToLogs(data) {
  const timeAndDate = getTimeAndDate()
  const logMessage = `${timeAndDate} | ${data}`
  fsPromises.appendFile('./logs/logs.txt', logMessage + '\n', (err) => {
    if (err) {
      console.error('Error logging:', err)
    }
  })
}

async function incrementSnakeCount() {
  try {
    const data = await fsPromises.readFile(configPath, 'utf8')
    const config = JSON.parse(data)
    config['frenchSnake-count'] += 1
    await fsPromises.writeFile(configPath, JSON.stringify(config, null, 2))
  } catch (err) {
    console.error('Error:', err)
  }
}


// Modlist fetch
async function fetchCustomModerators() {
  const fileContent = await fsPromises.readFile(configPath, 'utf8')
  const configData = JSON.parse(fileContent)
  customModerators = configData.moderators;
  console.log('Custom moderators ID:', customModerators)
}

// start
async function setup() {
    await fetchCustomModerators()
    client.login(process.env.TOKEN)
}

client.on('ready', (c) => {
  console.log(`${c.user.tag} is up! ID: ${c.user.id}`)
})


// Custom slash commands
client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
      if(interaction.commandName === "version") {

        const embed = new EmbedBuilder()
        .setColor('009dff')
        .setTitle("Sarge's latest version")
        .setDescription(`I am currently in **v.1.5[dev]**.\nLast update: **June 4th, 2024**`)
        .addFields(
          {name : "What's new?", value: '[Changelog](https://github.com/Hyrull/Immersive-Quotes/blob/main/changelog.txt)'}
        )
        .setFooter({ text: 'Sarge is developed by Hyrul', iconURL: 'https://imgur.com/15fnxws.png'})

      await interaction.reply({ embeds: [embed] })
      }

      if(interaction.commandName === "status") {
        let frenchSnakeCurrentStatus = ''
        let gorfilReactCurrentStatus = ''
        if (frenchSnake) {frenchSnakeCurrentStatus = 'Enabled'} else {frenchSnakeCurrentStatus = 'Disabled'}
        if (gorfilReact) {gorfilReactCurrentStatus = 'Enabled'} else {gorfilReactCurrentStatus = 'Disabled'}

        const embed = new EmbedBuilder()
        .setColor('009dff')
        .setTitle('Current features status')
        .setDescription(`Here's the current status for the two react features.`)
        .addFields(
          {name : 'French snake reaction', value: frenchSnakeCurrentStatus},
          {name : 'Gorfil react status', value: gorfilReactCurrentStatus}
        )

      await interaction.reply({ embeds: [embed] })

      }

      if(interaction.commandName === "french-snake-count") {
        try {
          const data = await fsPromises.readFile(configPath, 'utf8')
          const config = JSON.parse(data)
          const count = config['frenchSnake-count']
          // interaction.reply(`I have reacted a snake to "french" ${count} times!`)

          const embed = new EmbedBuilder()
            .setColor('009dff')
            .setTitle('French snake count')
            .setDescription(`I have reacted a snake to "french" **${count}** times!`)
            // .setFooter({ text: 'Sarge developed by Hyrul', iconURL: 'https://imgur.com/15fnxws.png'})

          await interaction.reply({ embeds: [embed] })
        } catch (err) {
          console.error('Error:', err)
        }
      }

      if(interaction.commandName === "quotes") {
        const embed = new EmbedBuilder()
        .setColor('009dff')
        .setTitle('Quotes thread')
        .setDescription(`You can access the quotes by looking at the threads list in [immersive-chat](https://discord.com/channels/512393440726745120/512402168217731072), or by clicking the link below.`)
        .addFields(
          {name : 'Direct link', value: '[Quotes Thread](https://discord.com/channels/512393440726745120/1224432486134714389)'}
        )

      await interaction.reply({ embeds: [embed] })
      }

      if(interaction.commandName === "secret-test") {
        secretRuleCheck(interaction)
      }

      if(interaction.commandName === "youtube") {
        youtubeSearchCommand(interaction)
      }

      
      if (interaction.commandName === "toggle") {
        const frenchSnakeOption = interaction.options.get('french-snake')?.value
        const gorfilOption = interaction.options.get('gorfil')?.value
        const replies = []
        const logLine = []
        
        if (!customModerators.includes(interaction.user.id)) {
          interaction.reply('This feature can only be used by a bot moderator.')
          return
        }
        if (frenchSnakeOption !== undefined) {
          frenchSnake = frenchSnakeOption
          replies.push(`Feature "french snake" set to ${frenchSnake}.`)
          logLine.push(`User ${interaction.user.globalName}[${interaction.user.id}] set "French snake" to ${frenchSnake}.`)
        }
        if (gorfilOption !== undefined) {
          gorfilReact = gorfilOption
          replies.push(`Feature "Gorfil react" set to ${gorfilReact}.`)
          logLine.push(`User ${interaction.user.globalName}[${interaction.user.id}] set "Gorfil reactions" to ${gorfilReact}.`)
        }

        if (replies.length === 0) {
          interaction.reply('Please select a feature to toggle on or off.')
        } else {
          interaction.reply(replies.join('\n'))
          addToLogs(logLine.join(' '))
        }
      }
    }
  }
)



// Custom commands goes here.
// Only standalone, misc. and funny stuff for now just to get a hang of discord.js.
client.on('messageCreate', async (message) => {
  if(message.author.bot) return;
  const lowerCaseContent = message.content.toLowerCase()
    
  if (lowerCaseContent.includes('<:gorfil:1209654573871013888>') && gorfilReact) {
    message.react(message.guild.emojis.cache.get('1209654573871013888'))
  }

  if (lowerCaseContent.includes('french') && frenchSnake) {
    message.react('🐍')
    incrementSnakeCount()
  }

  if (lowerCaseContent.includes('good bot')) {
    message.react('🩵')
  }

  // YouTube Search
  if (lowerCaseContent.startsWith('$youtube')) {
    const query = lowerCaseContent.slice('$youtube '.length)

    if (query.length > 0) {
      let answer = await search(query, opts)
      if (answer.results && answer.results.length > 0) {
        message.reply(answer.results[0].link)
        addToLogs(`${message.author.displayName}[${message.author.id}] searched for '${query}'. Returned the following link: ${answer.results[0].link} ("${answer.results[0].title}" by ${answer.results[0].channelTitle})`)
      } else {
        message.reply('No search results found.')
      }
    } else {
      message.reply('Please input a search.')
    }
  }

  // MOD-ONLY COMMANDS
  // $toggle
  if (lowerCaseContent === '$toggle' && customModerators.includes(message.author.id)) {
    message.reply("It's now a slash command. Feel free to use /toggle and select what feature to set to true and false.")
  }
})

setup()
