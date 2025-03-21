const { EmbedBuilder } = require('discord.js');
const featuresCommand = async (interaction, frenchSnake, englishTea, gorfilReact, crazyReact, crazyOdds) => {

  const embed = new EmbedBuilder()
  .setColor('009dff')
  .setTitle('Current features status')
  .setDescription(`Here's the current status for the react features.`)
  .addFields(
    {name : 'French snake reaction', value: frenchSnake ? 'Enabled' : 'Disabled'},
    {name : 'English tea reaction', value: englishTea ? 'Enabled' : 'Disabled'},
    {name : 'Gorfil react status', value: gorfilReact ? 'Enabled' : 'Disabled'},
    {name : 'Crazy react status', value: crazyReact ? `Enabled - ${crazyOdds}%` : 'Disabled'}
  )
  
  await interaction.reply({ embeds: [embed] })
}

module.exports = { featuresCommand }