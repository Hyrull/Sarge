const { EmbedBuilder } = require('discord.js');
const featuresCommand = async (interaction, settings) => {

  const embed = new EmbedBuilder()
  .setColor('009dff')
  .setTitle('Current features status')
  .setDescription(`Here's the current status for the react features.`)
  .addFields(
    {name : 'French snake reaction', value: settings.frenchSnake ? 'Enabled' : 'Disabled'},
    {name : 'English tea reaction', value: settings.englishTea ? 'Enabled' : 'Disabled'},
    {name : 'American snake reaction', value: settings.americanSnake ? 'Enabled' : 'Disabled'},
    {name : 'Gorfil react status', value: settings.gorfil ? 'Enabled' : 'Disabled'},
    {name : 'Crazy react status', value: settings.crazy ? `Enabled - ${settings.crazyOdds}%` : 'Disabled'}
  )
  
  await interaction.reply({ embeds: [embed] })
}

module.exports = { featuresCommand }