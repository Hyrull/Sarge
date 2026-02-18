const search = require('youtube-search')
const { EmbedBuilder } = require('discord.js')
const { startPagination } = require('../utils/paginationManager')

const opts = {
  maxResults: 10,
  key: process.env.YT_SEARCH_API,
  type: 'video'
}

const youtubeSearchCommand = async (source, isLegacy, message) => {
  let query
  let targetInterface; // This will be the object we pass to paginationManager. it's to trick discord for the buttons to work even if it's not an INTERACTION reply

  if (isLegacy) {
    // --- LEGACY STUFF  ---
    query = source?.trim?.()
    if (!query) return message.reply('Please input a search.')
    
    // Send a placeholder message we can edit later
    const sentMessage = await message.reply('🐭 Searching YouTube...')

    // Create a Fake Interaction Object that maps 'editReply' to 'msg.edit'
    targetInterface = {
      user: message.author,
      editReply: async (payload) => {
        return await sentMessage.edit(payload)
      }
    }
  } else {
    // --- SLASH MODE ---
    query = source.options.getString('query')
    if (!query) return source.editReply('Please input a search.')
    
    // Slash commands are already deferred in sarge.js, so we use them directly
    targetInterface = source
  }

  // 2. EXECUTE SEARCH
  try {
    const answer = await search(query, opts)

    if (!answer || !answer.results || answer.results.length === 0) {
      await targetInterface.editReply({ content: 'No search results found.' })
      return
    }

    // 3. DEFINE RENDERER
    const renderVideoPage = async (video, current, total) => {
      return `*Result n°${current}*\n${video.link}`
    }

    // START PAGINATION
    console.log(`[YouTube] ${targetInterface.user.username} searched for '${query}'`)
    await startPagination(targetInterface, answer.results, renderVideoPage)

  } catch (err) {
    console.error('[YouTube Search Error]', err);
    await targetInterface.editReply('Something went wrong with the YouTube search.')
  }
}

module.exports = { youtubeSearchCommand }