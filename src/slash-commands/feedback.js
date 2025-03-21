const { EmbedBuilder } = require('discord.js')

const feedbackNotice = async (client, interaction, adminId, timeAndDate) => {
  const admin = await client.users.fetch(adminId)
  const feedback = interaction.options.get('query')?.value
  const displayName = interaction.member.user.globalName
  const realName = interaction.member.user.username

  const embed = new EmbedBuilder()
  .setColor('009dff')
  .setTitle(`${displayName} (${realName}):`)
  .setDescription(feedback)
  .addFields(
    {name : 'Sent:', value: timeAndDate}
  )

  await admin.send({ content: '## There is feedback!\n', embeds: [embed] })
  await interaction.reply({ content: 'Your feedback has successfully been sent.', ephemeral: true })
}

module.exports = { feedbackNotice }