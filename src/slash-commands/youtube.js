const search = require ('youtube-search');
let opts = {
  maxResults: 5,
  key: process.env.YT_SEARCH_API,
  type: 'video'
}

//YT Search Settings

const youtubeSearchCommand = async (interaction) => {
  const query = interaction.options.get('query').value
  let answer = await search(query, opts)
  if (answer.results && answer.results.length > 0) {
    interaction.reply(answer.results[0].link)
  } else {
    interaction.reply('No search results found.')
  }
}

module.exports = { youtubeSearchCommand }