require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const globalCommands = [
  new SlashCommandBuilder()
    .setName('version')
    .setDescription('Gives the bot current version and a link to the changelog'),
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription("Displays the bot's ping and uptime.")
]

const guildCommands = [

  // MODERATOR COMMANDS
  
  new SlashCommandBuilder()
    .setName('toggle')
    .setDescription('[MOD] Toggles features on or off.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addBooleanOption(option => option
      .setName('french-snake')
      .setDescription('Adds a snake 🐍 reaction whenever someone says "French".')
    )
    .addBooleanOption(option => option
      .setName('english-tea')
      .setDescription('Adds a teapot 🫖 reaction whenever someone says "English" or "British".')
    )
    .addBooleanOption(option => option
      .setName('gorfil')
      .setDescription('Adds a gorfil reaction whenever someone sends this emoji.')
    )
    .addBooleanOption(option => option
      .setName('crazy')
      .setDescription('Has a chance to reply a certain quote when someone says "crazy".')
    )
    .addNumberOption(option => option
      .setName('crazy-odds')
      .setDescription('Set the odds of the "crazy" reply feature.')
    ),

    new SlashCommandBuilder()
    .setName('discord-status')
    .setDescription('[MOD] Updates the bot status with the provided message.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)

    .addStringOption(option => 
      option.setName('activity-type')
      .setDescription('What should the activity type be?')
      .setRequired(true)
        .addChoices(
        { name: 'Playing', value: 'Playing' },
        { name: 'Listening to', value: 'Listening' },
        { name: 'Watching', value: 'Watching' },
        { name: 'Custom', value: 'Custom' }
      )
    )

    .addStringOption(option => 
      option.setName('status')
      .setDescription("What's the new status?")
      .setRequired(true)
    )

    .addStringOption(option =>
      option.setName('presence')
      .setDescription('What should the presence be?')
      .setRequired(true)
      .addChoices([
        { name: 'Online', value: 'online' },
        { name: 'Do Not Disturb', value: 'dnd' },
        { name: 'Idle', value: 'idle' },
        { name: 'Invisible', value: 'invisible' }
      ])
    ),


  // USER COMMANDS

  new SlashCommandBuilder()
    .setName('features')
    .setDescription('Shows which features are currently enabled.'),

  new SlashCommandBuilder()
    .setName('nsfw')
    .setDescription('Tries to grant you access to the nsfw channel.'),

  new SlashCommandBuilder()
    .setName('french-snake-count')
    .setDescription('Shows how many times I reacted a snake to "french".'),

  new SlashCommandBuilder()
    .setName('quotes')
    .setDescription('Sends the link to the "quotes" thread.'),

  new SlashCommandBuilder()
    .setName('greetings')
    .setDescription('Sends a link to a "greetings!" video.'),

  new SlashCommandBuilder()
    .setName('youtube')
    .setDescription("Quick search for a YouTube video. Input a query and I'll send the first result's link.")
    .addStringOption(option => option
      .setName('query')
      .setDescription('What are you searching for?')
      .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('event')
    .setDescription("Adds or remove the 'EventPing' role to be notified for future events.")
    .addBooleanOption(option => option
      .setName('set')
      .setDescription('Set it to true or false.')
      .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('feedback')
    .setDescription("Send feedback for Sarge! Only the bot admin will see it.")
    .addStringOption(option => option
      .setName('feedback')
      .setDescription("What do you want to say?")
      .setRequired(true)
    )
]

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Registering global slash commands...')
    await rest.put(
      Routes.applicationCommands(process.env.BOT_ID),
      { body: globalCommands }
    )

    ////////////////////////

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