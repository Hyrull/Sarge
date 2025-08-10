const { EmbedBuilder, MessageFlags } = require('discord.js')

const feedbackNotice = async (client, interaction, timeAndDate) => {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral })
  const adminId = '102080304008695808' // Hyrul

  const admin = await client.users.fetch(adminId)
  const feedback = interaction.options.get('feedback')?.value
  const user = interaction.member?.user || interaction.user
  const displayName = user.globalName || user.username || 'Unknown'
  const realName = user.username || 'Unknown'

  const embed = new EmbedBuilder()
  .setColor('#009dff')
  .setTitle(`${displayName} (${realName}):`)
  .setDescription(feedback)
  .addFields(
    {name : 'Sent:', value: timeAndDate}
  )

  await admin.send({ content: '## There is feedback!\n', embeds: [embed] })
  await interaction.editReply({ content: 'Your feedback has successfully been sent.', flags: MessageFlags.Ephemeral })
}

module.exports = { feedbackNotice }