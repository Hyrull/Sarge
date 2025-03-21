const { EmbedBuilder } = require('discord.js');

const quotesCommand = async (interaction) => {

  const embed = new EmbedBuilder()
  .setColor('009dff')
  .setTitle('Quotes thread')
  .setDescription(`You can access the quotes by looking at the threads list in [immersive-chat](https://discord.com/channels/512393440726745120/512402168217731072), or by clicking the link below.`)
  .addFields(
    {name : 'Direct link', value: '[Quotes Thread](https://discord.com/channels/512393440726745120/1224432486134714389)'}
  )

  await interaction.reply({ embeds: [embed] })
}

module.exports = { quotesCommand }