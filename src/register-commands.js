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

  // USER COMMANDS

  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Shows what features are currently enabled.'),

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
    .setDescription("Quick-search for a YouTube video. Input a search and I'll send the first result's link.")
    .addStringOption(option => option
      .setName('query')
      .setDescription('What are you searching for?')
      .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('event')
    .setDescription("Manage the 'EventPing' rule to be notified for future events.")
    .addBooleanOption(option => option
      .setName('set')
      .setDescription('Set it to true or false.')
      .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('feedback')
    .setDescription("Provide any feedback for Sarge. Only the bot admin will see privately.")
    .addStringOption(option => option
      .setName('query')
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