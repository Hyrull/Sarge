import { MessageFlags } from "discord.js"

const eventCommand = async (interaction) => {
  const roleId = process.env.EVENT_ROLE_ID
  const member = interaction.member
  const hasRole = member.roles.cache.has(roleId)
  const removeOption = interaction.options.getBoolean('set') || false

  await interaction.deferReply({ flags: MessageFlags.Ephemeral })

  if (!removeOption) {   
    if (hasRole) {
      await member.roles.remove(roleId)
      interaction.editReply({ content: `The 'EventPing' role has been successfully removed.`})
    } else {
      interaction.editReply({ content: `You don't have the 'EventPing' role.`})
    }
  } else {
    if (hasRole) {
      interaction.editReply({ content: `You already have the 'EventPing' role!`})
    } else {
      await member.roles.add(roleId)
      interaction.editReply({ content: `'EventPing' role successfully added!`})
    }
  }
}

export default eventCommand