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

async function setup() {
    await fetchToken()
    client.login(loginToken)
}

client.on('ready', (c) => {
    console.log(`${c.user.tag} is up! ID: ${c.user.id}`)
})

// Custom commands goes here.
// Only standalone, misc. and funny stuff for now just to get a hang of discord.js.


client.on('messageCreate', (message) => {
    const lowerCaseContent = message.content.toLowerCase()
    
    if (lowerCaseContent === '$hyrul') {
        message.reply('The bot IS working. hell yeah dude')
    }

    if (lowerCaseContent.includes('<:gorfil:1209654573871013888>')) {
        message.react(message.guild.emojis.cache.get('1209654573871013888'))
    }

    if (lowerCaseContent.includes('french') || lowerCaseContent.includes('fwench') || lowerCaseContent.includes('fwemch')) {
        message.react('🐍')
    }
})

setup()