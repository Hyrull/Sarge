/**
 * @param {object} interaction - The discord interaction object
 * @param {Array} items - The array of items (e.g., search results) to paginate
 * @param {Function} renderPage - Async function(item, index, total) -> returns EmbedBuilder
 */
async function startPagination(interaction, items, renderPage) {
    if (!items || items.length === 0) return

    let index = 0
    
    // Render the first page
    const initialEmbed = await renderPage(items[index], index + 1, items.length)
    const message = await interaction.editReply({ embeds: [initialEmbed] })

    // Add initial reactions (if needed)
    if (items.length > 1) await message.react('➡️')
    await message.react('🚫')

    // Setup Collector
    const filter = (reaction, user) => {
        return ['⬅️', '➡️', '🚫'].includes(reaction.emoji.name) && user.id === interaction.user.id
    }

    // 30s timeout, resets on activity
    const collector = message.createReactionCollector({ filter, time: 30 * 1000 })

    collector.on('collect', async (reaction, user) => {
        // Reset timer on interaction so the bot doesn't die while the user is reading
        collector.resetTimer()

        // Handle Navigation
        if (reaction.emoji.name === '➡️') {
            if (index < items.length - 1) index++
        } else if (reaction.emoji.name === '⬅️') {
            if (index > 0) index--
        } else if (reaction.emoji.name === '🚫') {
            collector.stop('cancelled')
            return
        }

        // Render New Page
        const newEmbed = await renderPage(items[index], index + 1, items.length)
        await message.edit({ embeds: [newEmbed] })

        // Manage Reactions
        try {
            // Remove the user's click
            await reaction.users.remove(user.id)

            // Add/Remove arrows based on position
            // If we are at start, remove Back. If at end, remove Next.
            if (index === 0) {
                 message.reactions.cache.get('⬅️')?.remove().catch(() => {})
            } else {
                 message.react('⬅️').catch(() => {})
            }

            if (index === items.length - 1) {
                 message.reactions.cache.get('➡️')?.remove().catch(() => {})
            } else {
                 message.react('➡️').catch(() => {})
            }

        } catch (err) {
            // Fails in DMs or without permissions, ignoring.
            // this is just here to prevent a bot crash.
        }
    })

    collector.on('end', async (_, reason) => {
        if (reason === 'cancelled') {
            // User clicked Stop
            await message.edit({ content: 'Stopping the search! 🐭', embeds: [] })
            message.reactions.removeAll().catch(() => {})
        } else {
            // on timeout
            message.reactions.removeAll().catch(() => {})
        }
    })
}

module.exports = { startPagination }