const { EmbedBuilder } = require('discord.js')
const { startPagination } = require('../utils/paginationManager')

const movieSearchCommand = async (interaction) => {
  await interaction.deferReply()
  const query = interaction.options.get('title').value
  if (!query) {
    await interaction.editReply('Please provide a movie title to search for.')
    return
  }

  try {
    // Just getting the ID of the first result
    const searchResponse = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${process.env.TMDB_API_KEY}`,
      }
    })
    const searchData = await searchResponse.json()

    if (!searchData || searchData.results.length === 0) {
      await interaction.editReply({ content: 'No movie found with that title.', ephemeral: true })
    }

    const renderMoviePage = async (movieResult, current, total) => {
      const id = movieResult.id
      
      // Now fetching the full info. We need to do this way, because the search result's response doesn't include any runtime, let alone credits
      const fullMovieInfo = await fetch(`https://api.themoviedb.org/3/movie/${id}?append_to_response=credits`, {
        headers: { 'Authorization': `Bearer ${process.env.TMDB_API_KEY}` }
      })

      const movie = await fullMovieInfo.json()
      
      const director = movie.credits.crew.find(person => person.job === 'Director')
      const directorName = director ? director.name : "Unknown"
      
      const finalDescription = movie.tagline ? `***${movie.tagline}***\n\n${movie.overview}\n` : movie.overview

      const embed = new EmbedBuilder()
        .setColor('#009dff')
        .setTitle(`${movie.title} (${movie.release_date?.split('-')[0] || 'N/A'})`)
        .setDescription(finalDescription || 'No overview available.')
        .setImage(`https://image.tmdb.org/t/p/w500${movie.poster_path}`)
        .addFields(
          {
            name: 'Release Date',
            value: movie.release_date || 'Unknown',
            inline: true
          },
          {
            name: 'Director',
            value: directorName || 'Unknown',
            inline: true
          },
          {
            name: 'Length',
            value: movie.runtime 
                    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` 
                    : 'Unknown',
            inline: true
          }
        )
        .setFooter({ text: `TMDB ID: ${movie.id}` })

        return embed
    }

    await startPagination(interaction, searchData.results, renderMoviePage)

  } catch (error) {
    await interaction.editReply({ content: 'Something went wrong while fetching the movie.' })
    console.error('Error fetching movie data:', error)
  }
}

module.exports = { movieSearchCommand }