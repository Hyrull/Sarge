const search = require ('youtube-search');
let opts = {
  maxResults: 5,
  key: process.env.YT_SEARCH_API,
  type: 'video'
}


// General method to handle the search reply. Called for legacy and slash versions
async function handleSearchReply(content, user, sendReply) {
  // Getting the answer from the search
  const answer = await search(content, opts)
  if (!answer || !answer.results || answer.results.length === 0) {
    await sendReply('No search results found.')
    return null
  }
  // If the answer is not empty, we edit the reply with the first result
  const sentMessage = await sendReply(answer.results[0].link)

  if (sentMessage.guild) {
    try {
      await sentMessage.react('🚫');
    } catch (err) {
      console.error('Failed to add reaction:', err);
    }

  // Defining a filter for the reaction collector
  const filter = (reaction, reactingUser) => {
      return reaction.emoji.name === '🚫' && user.id === reactingUser.id
    }

  // Creating a collector for the reaction, to edit if the user added the reaction
  const collector = sentMessage.createReactionCollector({ filter, max: 1, time: 20000 }) // 20s
  collector.on('collect', async () => {
    const edited = `~~<${answer.results[0].link}>~~\nOops, wrong link! 🐭`
    await sentMessage.edit(edited)
  })

  // Removing the reaction so we know it's too late for removal
  collector.on('end', async () => {
    const botReaction = sentMessage.reactions.cache.get('🚫')
    if (botReaction) {
      try {
        await botReaction.users.remove(sentMessage.client.user.id)
      } catch (err) {
        console.error('Failed to remove 🚫 reaction:', err)
      }
    }
  })
}
console.log(`[YouTube] ${user.displayName || user.globalName} searched for '${content}'. Returned: "${answer.results[0].title}" by ${answer.results[0].channelTitle}`)
}

const youtubeSearchCommand = async (interaction, legacy, message) => {
  if (legacy) {
    const query = interaction?.trim?.()
    if (!query) return message.reply('Please input a search.')
    return await handleSearchReply(query, message.author, (reply) => message.reply(reply))
  } else {
    const query = interaction.options.get('query')?.value
    if (!query) return await interaction.editReply('Please input a search.')
    return await handleSearchReply(query, interaction.user, (reply) => interaction.editReply(reply))
  }
}

module.exports = { youtubeSearchCommand }