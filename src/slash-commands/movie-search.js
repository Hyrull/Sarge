const { EmbedBuilder } = require('discord.js')

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
    const firstResultId = searchData.results[0].id

    // Now fetching the full info. We need to do this way, because the search result's response doesn't include any runtime, let alone credits
    if (firstResultId) {
      const fullMovieInfo = await fetch(`https://api.themoviedb.org/3/movie/${firstResultId}?append_to_response=credits`, {
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

        console.log(`[Movie] ${interaction.user.username} looked up a movie: ${movie.title} (${movie.id})`)
        const sentMessage = await interaction.editReply({ embeds: [embed] })

        // Adding the reaction for removal, in case of error - only in guild, not DMs
        if (sentMessage.guild ){
          try {
            await sentMessage.react('🚫')
          } catch (err) {
            console.error('Failed to add reaction:', err)
          }
        }
          
        // Defining a filter for the reaction collector
        const filter = (reaction, reactingUser) => {
          return reaction.emoji.name === '🚫' && interaction.user.id === reactingUser.id
        }

        // Creating a collector for the reaction, to edit if the user added the reaction
        const collector = sentMessage.createReactionCollector({ filter, max: 1, time: 20000 }) // 20s
        collector.on('collect', async () => {
          const edited = `~~${movie.title}~~\nOops, wrong movie! 🐭`
          await sentMessage.edit({
            content: edited,
            embeds: []
          })
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
      } else {
        await interaction.editReply({ content: 'No movie found with that title.', ephemeral: true })
      }
  } catch (error) {
    console.error('Error fetching movie data:', error)
  }
}

module.exports = { movieSearchCommand }