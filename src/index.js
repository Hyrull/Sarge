require('dotenv').config()
const { Client, IntentsBitField, EmbedBuilder } = require('discord.js')
const fsPromises = require('fs').promises

const { secretRuleCheck } = require('./secret');
const { youtubeSearchCommand } = require('./slash-commands/youtube')
const { toggleFeatures } = require('./slash-commands/feature-toggle')

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
let gorfilReact = true
let crazyReact = true
let crazyOdds = 10
const configPath = './config.json'

async function fetchCurrentConfig() {
  try {
    const data = await fsPromises.readFile(configPath, 'utf8')
    const readableData = JSON.parse(data)
    frenchSnake = readableData['french-react']
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

async function incrementSnakeCount(message) {
  try {
    const data = await fsPromises.readFile(configPath, 'utf8')
    const config = JSON.parse(data)
    config['frenchSnake-count'] += 1
    await fsPromises.writeFile(configPath, JSON.stringify(config, null, 2))

    if (config['frenchSnake-count'] % 100 === 0) {
      message.reply(`This is my ${config['frenchSnake-count']}th fr*nch :snake: reaction! :mouse:`)
    }
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
        .setDescription(`I am currently in **v.1.5.2**.\nLast update: **June 30th, 2024**`)
        .addFields(
          {name : "What's new?", value: '[Changelog](https://github.com/Hyrull/Immersive-Quotes/blob/main/changelog.txt)'}
        )
        .setFooter({ text: 'Sarge is developed by Hyrul', iconURL: 'https://imgur.com/15fnxws.png'})

      await interaction.reply({ embeds: [embed] })
      }

      if(interaction.commandName === "status") {
        let frenchSnakeCurrentStatus = ''
        let gorfilReactCurrentStatus = ''
        let crazyReactCurrentStatus = ''
        if (frenchSnake) {frenchSnakeCurrentStatus = 'Enabled'} else {frenchSnakeCurrentStatus = 'Disabled'}
        if (gorfilReact) {gorfilReactCurrentStatus = 'Enabled'} else {gorfilReactCurrentStatus = 'Disabled'}
        if (crazyReact) {crazyReactCurrentStatus = 'Enabled'} else {crazyReactCurrentStatus = 'Disabled'}
        console.log(crazyOdds)

        const embed = new EmbedBuilder()
        .setColor('009dff')
        .setTitle('Current features status')
        .setDescription(`Here's the current status for the react features.`)
        .addFields(
          {name : 'French snake reaction', value: frenchSnakeCurrentStatus},
          {name : 'Gorfil react status', value: gorfilReactCurrentStatus},
          {name : 'Crazy react status', value: `${crazyReactCurrentStatus} - ${crazyOdds}%`}
        )

      await interaction.reply({ embeds: [embed] })
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

      if(interaction.commandName === 'ping') {
        const commandTime = interaction.createdTimestamp
        await interaction.reply({ content: `*Pong! Calculating...*`, ephemeral: true })
        const nowTime = Date.now()
        const latency = commandTime - nowTime
        await interaction.editReply({ content: `*Pong! Latency: ${latency}ms*`, ephemeral: true }) 
      }

      // if(interaction.commandName === "secret-test") {
      //   secretRuleCheck(interaction)
      // }

      if(interaction.commandName === "youtube") {
        const logMessage = await youtubeSearchCommand(interaction)
        addToLogs(logMessage)
      }

      if (interaction.commandName === "toggle") {
        const frenchSnakeOption = interaction.options.get('french-snake')?.value
        const gorfilOption = interaction.options.get('gorfil')?.value
        const crazyOption = interaction.options.get('crazy')?.value
        const crazyOddsSet = interaction.options.get('crazy-odds')?.value
        const logMessage = await toggleFeatures(frenchSnakeOption, gorfilOption, crazyOption, crazyOddsSet, customModerators, interaction, configPath)
        await addToLogs(logMessage)
        setTimeout(fetchCurrentConfig, 3000);
      }

      if (interaction.commandName === 'feedback') {
        const admin = await client.users.fetch(adminId)
        const timeAndDate = getTimeAndDate()
        const feedback = interaction.options.get('query')?.value
        const displayName = interaction.member.user.globalName
        const realName = interaction.member.user.username

        const embed = new EmbedBuilder()
        .setColor('009dff')
        .setTitle(`${displayName} (${realName}):`)
        .setDescription(feedback)
        .addFields(
          {name : 'Sent:', value: timeAndDate}
        )

        await admin.send({ content: '## There is feedback!\n', embeds: [embed] })
        await interaction.reply({ content: 'Your feedback has successfully been sent.', ephemeral: true })
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
    incrementSnakeCount(message)
  }
  if (lowerCaseContent.includes('fr3nch') && frenchSnake) {
    message.react('👀')
  }

  if (lowerCaseContent.includes('good bot')) {
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

  // YouTube Search (legacy)
  if (lowerCaseContent.startsWith('$youtube')) {
    const query = lowerCaseContent.slice('$youtube '.length)
    const logMessage = await youtubeSearchCommand(query, true, message)
    addToLogs(logMessage)
  }
})

setup()