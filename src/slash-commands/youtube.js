const search = require ('youtube-search');
let opts = {
  maxResults: 5,
  key: process.env.YT_SEARCH_API,
  type: 'video'
}

//YT Search Settings

const youtubeSearchCommand = async (interaction, legacy, message) => {
  if (legacy) {
    if (interaction.length > 0) {
      let answer = await search(interaction, opts)
      if (answer.results && answer.results.length > 0) {
        message.reply(answer.results[0].link)
        const logMessage = (`${message.author.displayName}[${message.author.id}] searched for '${interaction}'. Returned the following link: ${answer.results[0].link} ("${answer.results[0].title}" by ${answer.results[0].channelTitle})`)
        return logMessage
      } else {
        message.reply('No search results found.')
      }
    } else {
      message.reply('Please input a search.')
    }

  } else {
    const query = interaction.options.get('query').value
    let answer = await search(query, opts)
    if (answer.results && answer.results.length > 0) {
      interaction.reply(answer.results[0].link)
      return (`${interaction.user.globalName}[${interaction.user.id}] searched for '${query}' (legacy!). Returned the following link: ${answer.results[0].link} ("${answer.results[0].title}" by ${answer.results[0].channelTitle})`)
    } else {
      interaction.reply('No search results found.')
    }
  }
}

module.exports = { youtubeSearchCommand }