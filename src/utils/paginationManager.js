/**
 * @param {object} interaction - The discord interaction object
 * @param {Array} items - The array of items (e.g., search results) to paginate
 * @param {Function} renderPage - Async function(item, index, total) -> returns EmbedBuilder
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

async function startPagination(interaction, items, renderPage) {
  if (!items || items.length === 0) return

  let index = 0

  const getButtons = (currentIndex, totalItems) => {
    const row = new ActionRowBuilder()

    // Previous Button
    row.addComponents(
      new ButtonBuilder()
        .setCustomId('prev')
        .setLabel('◀') // You can use emoji too: .setEmoji('⬅️')
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
  
  // Render the first page
  const initialEmbed = await renderPage(items[index], index + 1, items.length)
  const initialComponents = getButtons(index, items.length);

  const message = await interaction.editReply({ embeds: [initialEmbed], components: initialComponents })

  const collector = message.createMessageComponentCollector({ 
    componentType: ComponentType.Button, 
    time: 30 * 1000, //30s
    filter: (i) => i.user.id === interaction.user.id
  })

  collector.on('collect', async (i) => {
    // Reset timer
    collector.resetTimer()

    // if we don't defer the update then discord thinks we crashed. we're letting them know we're cooking
    await i.deferUpdate()

    if (i.customId === 'prev') {
      if (index > 0) index--
    } else if (i.customId === 'next') {
      if (index < items.length - 1) index++
    } else if (i.customId === 'stop') {
      return collector.stop('cancelled')
    }

    // Render Update
    const newEmbed = await renderPage(items[index], index + 1, items.length)
    const newComponents = getButtons(index, items.length)

    await interaction.editReply({ 
      embeds: [newEmbed], 
      components: newComponents 
    })
  })

  collector.on('end', async (_, reason) => {
    if (reason === 'cancelled') {
      await interaction.editReply({ content: '*Search closed!* 🐭 ', embeds: [], components: [] })
    } else {
      // done we remove it all
        await interaction.editReply({ components: [] })
    }
  })
}

module.exports = { startPagination }