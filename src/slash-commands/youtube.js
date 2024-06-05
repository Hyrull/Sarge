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
    } else {
      interaction.reply('No search results found.')
    }
  }
}

module.exports = { youtubeSearchCommand }