require('dotenv').config()
const { Client, IntentsBitField, EmbedBuilder, MessageFlags } = require('discord.js')
const fsPromises = require('fs').promises

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

let adminId = ''
let customModerators = []
let frenchSnake = true
let englishTea = true
const englishKeywords = ['british', 'english']
let gorfilReact = true
let crazyReact = true
let crazyOdds = 10
const configPath = './config.json'
const easterEggsPath = './data/eastereggs.json'
const startTime = Date.now()
console.log(`Bot started at: ${new Date(startTime).toISOString()}`)

async function fetchCurrentConfig() {
  try {
    const data = await fsPromises.readFile(configPath, 'utf8')
    const readableData = JSON.parse(data)
    frenchSnake = readableData['french-react']
    englishTea = readableData['tea-react']
    gorfilReact = readableData['gorfil-react']
    crazyReact = readableData['crazy']
    crazyOdds = readableData['crazy-odds']

  } catch(err) {
    console.error('Error: failed to read config file.')
  }
}

function getTimeAndDate() {
  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  const time = now.toLocaleTimeString()
  return `${date} @ ${time}`
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

async function incrementCount(message, count) {
  try {
    const data = await fsPromises.readFile(configPath, 'utf8')
    const config = JSON.parse(data)
    config[`${count}`] += 1
    await fsPromises.writeFile(configPath, JSON.stringify(config, null, 2))

    if (config['frenchSnake-count'] % 100 === 0) {
      message.reply(`This is my ${config['frenchSnake-count']}th fr*nch :snake: reaction! :mouse:`)
    }
  } catch (err) {
    console.error('Error:', err)
  }
}

async function incrementNsfwBans() {
  try {
    const data = await fsPromises.readFile(configPath, 'utf8')
    const config = JSON.parse(data)
    config['nsfw-bans'] += 1
    await fsPromises.writeFile(configPath, JSON.stringify(config, null, 2))
  } catch (err) {
    console.error('Error:', err)
  }
}


// Modlist fetch
async function fetchCustomModerators() {
  const fileContent = await fsPromises.readFile(configPath, 'utf8')
  const configData = JSON.parse(fileContent)
  customModerators = configData.moderators
  adminId = configData.admin
  console.log('Custom moderators ID:', customModerators)
}

// start
async function setup() {
    await fetchCustomModerators()
    await fetchCurrentConfig()
    client.login(process.env.TOKEN)
}

client.on('ready', (c) => {
  console.log(`${c.user.tag} is up! ID: ${c.user.id}`)
})


/////////////////////////////////////////////////////////////////////

// Custom slash commands
client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
      if(interaction.commandName === "version") {

        const embed = new EmbedBuilder()
        .setColor('009dff')
        .setTitle("Sarge's latest version")
        .setDescription(`I am currently in **v.1.8**.\nLast update: May 3rd, 2025`)
        .addFields(
          {name : "What's new?", value: '[Changelog](https://github.com/Hyrull/Immersive-Quotes/blob/main/changelog.txt)'}
        )
        .setFooter({ text: 'Sarge is developed by Hyrul', iconURL: 'https://imgur.com/15fnxws.png'})

      await interaction.reply({ embeds: [embed] })
      }

      // if(interaction.commandName === "secret-test") {
      //   secretRuleCheck(interaction)
      //   // command is in secret.js, which isn't public. Sorry, no cheating by checking the code!
      // }

      if(interaction.commandName === "features") {
        featuresCommand(interaction, frenchSnake, englishTea, gorfilReact, crazyReact, crazyOdds)
      }


      if(interaction.commandName === "french-snake-count") {
        try {
          const data = await fsPromises.readFile(configPath, 'utf8')
          const config = JSON.parse(data)
          const count = config['frenchSnake-count']

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
        await interaction.deferReply();
        const logMessage = await youtubeSearchCommand(interaction);
        addToLogs(logMessage)
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
        const member = interaction.member
        const lv20Role = '518961929583198209'
        const modLogsChannelId = '518821248768278528'
        let easterEggTriggered = false
        

        // Reading ID to see if there's an easter egg associated with it
        try {
          const easterEggsData = await fsPromises.readFile(easterEggsPath, 'utf8')
          const easterEggs = JSON.parse(easterEggsData)
          const easterEgg = easterEggs.find(egg => egg.id === member.id)
      
          if (easterEgg) {
            await interaction.reply(easterEgg.message)
            easterEggTriggered = true
          }
        } catch (err) {
          console.error('Error reading Easter eggs file:', err)
        }
        if (easterEggTriggered) return

        // Default behavior

        const data = await fsPromises.readFile(configPath, 'utf8')
        const config = JSON.parse(data)
        let count = config['nsfw-bans']

        if (interaction.member.roles.cache.has(lv20Role)) {
          interaction.reply("You are above level 20, so I'm saving you. Lucky you...")
        } else {
          await interaction.guild.members.ban(member, { reason: 'Fell for the /nsfw command during the purge event'})
          console.log(`Banned ${member} due to NSFW command usage.`)
          count+++
          incrementNsfwBans()

          switch (count) {
            case 1: {
              await interaction.reply(`${member} is the ${count}st person to fall!! HURRAY!`)
              break
            }
            case 2: {
              await interaction.reply(`${member} is the ${count}nd person to fall...`)
              break
            }
            case 3: {
              await interaction.reply(`${member} is the ${count}rd person to fall...`)
              break
            }
            default: {
              await interaction.reply(`${member} is the ${count}th person to fall...`)
            }
          }

          const modLogsChannel = interaction.client.channels.cache.get(modLogsChannelId);
          if (modLogsChannel) {
            await modLogsChannel.send(`${member} has been banned for /nsfw usage.`);
          } else {
             console.log(`Channel with ID '${modLogsChannelId}' not found.`);
          }
        }
      }



      if (interaction.commandName === "toggle") {
        const frenchSnakeOption = interaction.options.get('french-snake')?.value
        const englishTeaOption = interaction.options.get('english-tea')?.value
        const gorfilOption = interaction.options.get('gorfil')?.value
        const crazyOption = interaction.options.get('crazy')?.value
        const crazyOddsSet = interaction.options.get('crazy-odds')?.value
        const logMessage = await toggleFeatures(frenchSnakeOption, englishTeaOption, gorfilOption, crazyOption, crazyOddsSet, customModerators, interaction, configPath)
        await addToLogs(logMessage)
        setTimeout(fetchCurrentConfig, 3000);
      }

      if (interaction.commandName === 'feedback') {
        const timeAndDate = getTimeAndDate()
        feedbackNotice(client, interaction, adminId, timeAndDate)
      }
    }
  }
)



// Misc. funny joke stuff here.
client.on('messageCreate', async (message) => {
  if(message.author.bot) return;
  const lowerCaseContent = message.content.toLowerCase()
    
  if (lowerCaseContent.includes('<:gorfil:1209654573871013888>') && gorfilReact) {
    message.react(message.guild.emojis.cache.get('1209654573871013888'))
  }

  if (lowerCaseContent.includes('french') && frenchSnake) {
    message.react('🐍')
    incrementCount(message, 'frenchSnake-count')
  }
  
  if (englishKeywords.some(word => lowerCaseContent.includes(word)) && englishTea) {
    message.react('🫖')
    // incrementCount(message, 'englishTea-count')
  }
  
  if (lowerCaseContent.includes('fr3nch') && frenchSnake) {
    message.react('👀')
  }

  if (lowerCaseContent.includes('good bot') 
    || lowerCaseContent.includes('gud bot')) {
    message.react('🩵')
  }

  if (lowerCaseContent.includes('crazy') && crazyReact) {
    const randomNumber = Math.floor(Math.random() * 100)
    if (crazyOdds >= randomNumber) {
      message.reply('Crazy? I was crazy once. They put me in a room. A rubber room. A rubber room with rats. And rats make me crazy.')
    } else {
      console.log(`Dodged crazy! RNG was ${randomNumber}`)
    }
  }

  if (lowerCaseContent.startsWith('$greetings')) {
    message.reply('https://cdn.discordapp.com/attachments/523257630332813324/1288019769299173407/greetings.mp4?ex=66f3a963&is=66f257e3&hm=ecb7688f9c6b6b045b920ee206d7eadf846b9bb04856dd57f8e6f4bfe5214ed4&')
  }

  // YouTube Search (legacy)
  if (lowerCaseContent.startsWith('$youtube')) {
    const query = lowerCaseContent.slice('$youtube '.length)
    const logMessage = await youtubeSearchCommand(query, true, message)
    addToLogs(logMessage)
  }
})

setup()

module.exports = { client }