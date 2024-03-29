require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const globalCommands = [
  {
    name: 'version',
    description: 'Gives the bot current version'
  }
]

const guildCommands = [
  {
    name: 'toggle',
    description: 'Toggles features on or off.',
    options: [
      { 
        name: 'french-snake',
        description: 'Adds a snake 🐍 reaction whenever someone says "French".',
        type: ApplicationCommandOptionType.Boolean,
      },
      { 
        name: 'gorfil',
        description: 'Adds a gorfil reaction whenever someone sends this emoji.',
        type: ApplicationCommandOptionType.Boolean,
      }
    ]
  },
  {
    name: 'status',
    description: 'Shows what features are currently enabled.'
  },
  {
    name: 'changelog',
    description: 'Shows the changelog for all bot updates.'
  },
  { 
    name: 'french-snake-count',
    description: 'Shows how many times I reacted a snake to "french".'
  },
  {
    name: 'youtube',
    description: "Quick-search for a YouTube video. Input a search and I'll send the first result's link.",
    options: [
      {
        name: 'query',
        description: 'What are you searching for?',
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ]
  }
]

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Registering global slash commands...')
    await rest.put(
      Routes.applicationCommands(process.env.BOT_ID),
      { body: globalCommands}
    )


    console.log('Registering guild slash commands...');

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.BOT_ID,
        process.env.GUILD_ID
      ),
      { body: guildCommands }
    );

    console.log('Guild slash commands were registered successfully!');
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
})();