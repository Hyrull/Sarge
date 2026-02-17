/**
 * @param {object} interaction - The discord interaction object
 * @param {Array} items - The array of items (e.g., search results) to paginate
 * @param {Function} renderPage - Async function(item, index, total) -> returns EmbedBuilder
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } = require('discord.js')

async function startPagination(interaction, items, renderPage) {
  if (!items || items.length === 0) return

  let index = 0

  const getButtons = (currentIndex, totalItems) => {
    const row = new ActionRowBuilder()

    // Previous Button
    row.addComponents(
      new ButtonBuilder()
        .setCustomId('prev')
        .setLabel('◀')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentIndex === 0) // Grayed out if on first page
    )

    // Cancel Button
    row.addComponents(
      new ButtonBuilder()
        .setCustomId('stop')
        .setLabel('Cancel') // or .setEmoji('✖️')
        .setStyle(ButtonStyle.Danger)
    )

    // Next Button
    row.addComponents(
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('▶') 
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentIndex === totalItems - 1) // Gray out if on last page
    )

    return [row]
  }

  // --- SMART PAYLOAD GENERATOR ---
  const getPayload = async (idx) => {
    const content = await renderPage(items[idx], idx + 1, items.length)
    const components = getButtons(idx, items.length)

    // Check: Is it an Embed? Or just a String (Link)?
    if (content instanceof EmbedBuilder) {
      return { embeds: [content], content: null, components }
    } else {
        // It's a string (YouTube Link), so we send it as 'content' and clear any embeds
      return { content: content, embeds: [], components }
    }
  }

  await interaction.editReply(await getPayload(index))

 const collector = interaction.channel.createMessageComponentCollector({
    componentType: ComponentType.Button, 
    time: 120000,
    // Added safety check: ensure the click is on the *current* message
    filter: (i) => i.user.id === interaction.user.id && i.message.interaction.id === interaction.id
  })

  collector.on('collect', async (i) => {
    collector.resetTimer()
    await i.deferUpdate()

    if (i.customId === 'prev') {
      if (index > 0) index--
    } else if (i.customId === 'next') {
      if (index < items.length - 1) index++
    } else if (i.customId === 'stop') {
      return collector.stop('cancelled')
    }

    await interaction.editReply(await getPayload(index)) 
  })

  collector.on('end', async (_, reason) => {
    if (reason === 'cancelled') {
      await interaction.editReply({ content: '*Search closed!* 🐭 ', embeds: [], components: [] })
    } else {
      await interaction.editReply({ components: [] })
    }
  })
}

module.exports = { startPagination }