const { Client, IntentsBitField } = require('discord.js')

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
let loginToken = ''
let customModerators = []
const configPath = './config.json'

// Stored the token in a gitignored file for security
async function fetchToken() {
    try {
        const fileContent = await fs.readFile(configPath, 'utf8');
        const configData = JSON.parse(fileContent);
        loginToken = configData['login-token'];
    } catch (error) {
        console.error("Couldn't read the JSON file:", error);
    }
}

async function fetchCustomModerators() {
    const fileContent = await fs.readFile(configPath, 'utf8')
    const configData = JSON.parse(fileContent)
    customModerators = configData.moderators;
    console.log('Custom moderators ID:', customModerators)
}

async function setup() {
    await fetchToken()
    await fetchCustomModerators()
    client.login(loginToken)
}

client.on('ready', (c) => {
    console.log(`${c.user.tag} is up! ID: ${c.user.id}`)
})

// Custom commands goes here.
// Only standalone, misc. and funny stuff for now just to get a hang of discord.js.
let funCommands = true

client.on('messageCreate', (message) => {
    const lowerCaseContent = message.content.toLowerCase()
    
    if (lowerCaseContent === '$hyrul') {
        message.reply('The bot IS working. hell yeah dude')
    }

    if (lowerCaseContent.includes('<:gorfil:1209654573871013888>') && funCommands) {
        message.react(message.guild.emojis.cache.get('1209654573871013888'))
    }

    if (lowerCaseContent.includes('french') && funCommands) {
        message.react('🐍')
    }

    if (lowerCaseContent === '$toggle' && customModerators.includes(message.author.id)) {
        funCommands = !funCommands
        if (funCommands) {
            message.reply('Fun commands successfully turned on.')
        } else {
            message.reply('Fun commands successfully turned off.')
        }
        console.log(`funCommands turned to ${funCommands} by ${message.author.username}`)
    }
})

setup()