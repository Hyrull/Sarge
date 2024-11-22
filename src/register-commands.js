require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const globalCommands = [
  {
    name: 'version',
    description: 'Gives the bot current version and a link to the changelog'
  },
  {
    name: 'ping',
    description: 'Simple ping test command.'
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
        name: 'english-tea',
        description: 'Adds a teapot 🫖 reaction whenever someone says "English" or "British".',
        type: ApplicationCommandOptionType.Boolean,
      },
      { 
        name: 'gorfil',
        description: 'Adds a gorfil reaction whenever someone sends this emoji.',
        type: ApplicationCommandOptionType.Boolean,
      },
      { 
        name: 'crazy',
        description: 'Has a chance to reply a certain quote when someone says "crazy".',
        type: ApplicationCommandOptionType.Boolean,
      },
      { 
        name: 'crazy-odds',
        description: 'Set the odds of the "crazy" reply feature.',
        type: ApplicationCommandOptionType.Number,
      }
    ]
  },
  {
    name: 'secret-test',
    description: 'Check if your input message passes the secret rule.',
    options: [
      {
        name: 'input',
        description: "The message you'd like to try.",
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ]
  },
  {
    name: 'status',
    description: 'Shows what features are currently enabled.'
  },
  {
    name: 'nsfw',
    description: 'Tried to grant you access to the nsfw channel.'
  },
  { 
    name: 'french-snake-count',
    description: 'Shows how many times I reacted a snake to "french".'
  },
  { name: 'quotes',
    description: 'Sends the link to the "quotes" thread.'
  },
  {
    name: 'greetings',
    description: 'Sends a link to a "greetings!" video.'
  },
  // {
  //   name: 'secret-test',
  //   description: 'Check if your input message passes the secret rule.',
  //   options: [
  //     {
  //       name: 'input',
  //       description: "The message you'd like to check.",
  //       type: ApplicationCommandOptionType.String,
  //       required: true
  //     }
  //   ]
  // },
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
  },
  {
    name: 'feedback',
    description: "Provide any feedback for Sarge. Only you and the bot admin will see it.",
    options: [
      {
        name: 'query',
        description: "What do you want to say?",
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