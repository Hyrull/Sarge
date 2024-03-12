const { Client, IntentsBitField, Embed, EmbedBuilder } = require('discord.js')

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
    key: '',
    type: 'video'
}
let loginToken = ''
let customModerators = []
let youtubeApiKey = ''
let tetraGuard = false
let tetraGuardCommand = false
let frenchSnake = true
let gorfilReact = true
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

// Modlist fetch
async function fetchCustomModerators() {
    const fileContent = await fs.readFile(configPath, 'utf8')
    const configData = JSON.parse(fileContent)
    customModerators = configData.moderators;
    console.log('Custom moderators ID:', customModerators)
}

// Fetch YouTube API Key for YT Searches
async function fetchYouTubeApiKey() {
    const fileContent = await fs.readFile(configPath, 'utf8')
    const configData = JSON.parse(fileContent)
    youtubeApiKey = configData['youtube-search-api']
    opts.key = youtubeApiKey
}

// start
async function setup() {
    await fetchToken()
    await fetchCustomModerators()
    await fetchYouTubeApiKey()
    client.login(loginToken)
}

client.on('ready', (c) => {
    console.log(`${c.user.tag} is up! ID: ${c.user.id}`)
})

// Custom commands goes here.
// Only standalone, misc. and funny stuff for now just to get a hang of discord.js.
client.on('messageCreate', async (message) => {
    if(message.author.bot) return;
    const lowerCaseContent = message.content.toLowerCase()
    
    if (lowerCaseContent === '$hyrul') {
        message.reply('The bot IS working. hell yeah dude')
    }

    if (lowerCaseContent.includes('<:gorfil:1209654573871013888>') && gorfilReact) {
        message.react(message.guild.emojis.cache.get('1209654573871013888'))
    }

    if (lowerCaseContent.includes('french') && frenchSnake) {
        message.react('🐍')
    }

    if (lowerCaseContent.includes('i love you') && message.author.id === '102080304008695808') {
        message.react('❤️')
    }

    // YouTube Search
    if (lowerCaseContent.startsWith('$youtube')) {
        const query = lowerCaseContent.slice('$youtube '.length)

        if (query.length > 0) {
            let results = await search(query, opts)
            console.log(results)
            if (results.results && results.results.length > 0) {
                message.reply(results.results[0].link)
            } else {
                message.reply('No search results found.')
            }
        } else {
            console.log('No response received.')
        }
    }

    // MOD-ONLY COMMANDS
    // $toggle
    if (lowerCaseContent === '$toggle' && customModerators.includes(message.author.id)) {
        message.reply("New commands are as follows: `$toggle garfil`, `$toggle snake`, or `$toggle all-on` and `toggle all-off`. Also there's `$changingoftheguard`")
    }
    // $toggle snake
    if (lowerCaseContent === '$toggle snake' && customModerators.includes(message.author.id)) {
        frenchSnake = !frenchSnake
        if (frenchSnake) {
            message.reply('Anti-fr*nch snake successfully turned on.')
        } else {
            message.reply('Anti-fr*nch snake successfully turned off.')
        }
        console.log(`frenchSnake turned to ${frenchSnake} by ${message.author.username}`)
    }

    // $toggle gorfil
    if (lowerCaseContent === '$toggle gorfil' && customModerators.includes(message.author.id)) {
        gorfilReact = !gorfilReact
        if (gorfilReact) {
            message.reply('<:gorfil:1209654573871013888> reactions successfully turned on.')
        } else {
            message.reply('<:gorfil:1209654573871013888> reactions successfully turned off.')
        }
        console.log(`gorfilReact turned to ${gorfilReact} by ${message.author.username}`)
    }

    // $toggle all-on / $toggle all-off
    if (lowerCaseContent === '$toggle all-on' && customModerators.includes(message.author.id)) {
        gorfilReact = true
        frenchSnake = true
        message.reply('All features successfully turned on.')
        console.log(`All fun commands turned ON by ${message.author.username}`)
    }
    if (lowerCaseContent === '$toggle all-off' && customModerators.includes(message.author.id)) {
        gorfilReact = false
        frenchSnake = false
        message.reply('All features successfully turned off.')
        console.log(`All fun commands turned OFF by ${message.author.username}`)
    }

    // $changingoftheguard
    if (lowerCaseContent === '$changingoftheguard' && customModerators.includes(message.author.id) && tetraGuardCommand) {
        tetraGuard = !tetraGuard
        if (tetraGuard) {
            message.reply(`${message.author.displayName}, Lilo-Sleep Security Mode Activated`)
        } else {
            message.reply(`${message.author.displayName}, Lilo-Sleep Security Mode Deactivated`)
        }
    } 
    if (lowerCaseContent === '$changingoftheguard' && !customModerators.includes(message.author.id)) {
        message.reply(`${message.author.displayName}, **Access Denied**, Magos Authentication Required`)
    }
})

setup()
