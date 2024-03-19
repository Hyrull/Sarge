require('dotenv').config()
const { Client, IntentsBitField, Embed, EmbedBuilder, InteractionCollector } = require('discord.js')
const internal = require('stream')

const client = new Client ({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessageReactions,
  ]
})
const fs = require('fs').promises
const search = require ('youtube-search')
let opts = {
  maxResults: 5,
  key: process.env.YT_SEARCH_API,
  type: 'video'
}

function getTimeAndDate() {
  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  const time = now.toLocaleTimeString()
  return `${date} | ${time}`
}

function addToLogs(data) {
  const timeAndDate = getTimeAndDate()
  const logMessage = `${timeAndDate} | ${data}`
  fs.appendFile('./logs/logs.txt', logMessage + '\n', (err) => {
    if (err) {
      console.error('Error logging:', err)
    }
  })
}

let customModerators = []
let frenchSnake = true
let gorfilReact = true
const configPath = './config.json'

// Modlist fetch
async function fetchCustomModerators() {
  const fileContent = await fs.readFile(configPath, 'utf8')
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
        interaction.reply('Bot v1.3.1 - March 19th, 2024')
      }

      if(interaction.commandName === "status") {
        interaction.reply(`Fr*nch-snake set as '${frenchSnake}', gorfil set as '${gorfilReact}'.`)
      }

      if(interaction.commandName === "youtube") {
        const query = interaction.options.get('query').value
        let answer = await search(query, opts)
        if (answer.results && answer.results.length > 0) {
          interaction.reply(answer.results[0].link)
          addToLogs(`User ${interaction.user.globalName}[${interaction.user.id}] searched for '${query}'. Returned the following link: ${answer.results[0].link} ("${answer.results[0].title}" by ${answer.results[0].channelTitle})"`)
        } else {
          interaction.reply('No search results found.')
        }
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
  }

  if (lowerCaseContent === 'good bot') {
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
