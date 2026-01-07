const axios = require('axios')
const { EmbedBuilder } = require('discord.js')

// yes theorically it's a twitch developer portal app token, but it's used for igdb's api so let's not get confused here and let's call a cat a cat
async function getIgdbToken() {
  try {
    const imdbResp = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.IMDB_CLIENT}&client_secret=${process.env.IMDB_SECRET}&grant_type=client_credentials`)
    return imdbResp.data.access_token
  } catch(err) {
    console.error(`[IGDB LOGIN] Couldn't login!\n${err}`)
  }
}

async function gameSearch(interaction) {
  await interaction.deferReply()

  const userQuery = interaction.options.get('title').value
    if (!userQuery) {
      await interaction.editReply('Please provide a game title to search for.')
    }
  
    // handling the " from user's request to not break the query
  const sanitizedQuery = userQuery.replace(/"/g, '\\"')
  
  const igdbToken = await getIgdbToken()
  const query = `search "${sanitizedQuery}"; fields 
    name, 
    cover.image_id, 
    summary, 
    first_release_date, 
    genres.name, 
    game_engines.name, 
    platforms.abbreviation, 
    involved_companies.company.name, 
    involved_companies.developer,
    websites.category, websites.url;`
    
  try {
    const response = await axios.post("https://api.igdb.com/v4/games", query, {
      headers: {
      'Accept': 'application/json',
      'Client-ID': `${process.env.IMDB_CLIENT}`,
      'Authorization': `Bearer ${igdbToken}`,
      'Content-Type': 'text/plain'
      },
    })

    const gameData = response.data[0]

    if (!gameData) {
      await interaction.editReply({ content: 'No game found with that name.', ephemeral: true })
    }

    let formattedDate = 'Unknown'
    if (gameData.first_release_date) {
      const date = new Date(gameData.first_release_date * 1000)
      formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }

const coverUrl = gameData.cover?.image_id
  ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${gameData.cover.image_id}.png`
  : null;

    const devs = gameData.involved_companies?.find(c => c.developer)?.company?.name || 'Unknown'
    const platforms = gameData.platforms?.map(p => p.abbreviation).join(', ') || 'Unknown'
    const genres = gameData.genres?.map(g => g.name).join(', ') || 'Unknown'
    const engine = gameData.game_engines?.[0]?.name || 'Unknown'
    const steamLink = gameData.websites?.find(w => w.url.includes('steampowered.com'))?.url

    const embed = new EmbedBuilder()
      .setColor('#911910')
      .setTitle(`${gameData.name}`)
      .setDescription(gameData.summary || 'No overview available.')
      .setImage(coverUrl)
      .addFields(
        {
          name: 'Developers',
          value: devs || 'Unknown',
          inline: true
        },
        {
          name: 'Release Date',
          value: formattedDate || 'Unknown',
          inline: true
        },
        {
          name: 'Platforms',
          value: platforms || 'Unknown',
          inline: true
        },
        {
          name: 'Genres',
          value: genres || 'Unknown',
          inline: true
        },
        {
          name: 'Engine',
          value: engine || 'Unknown',
          inline: true
        }
      )
      .setFooter({ text: `IGDB ID: ${gameData.id}` })

    // just a conditional field. steam link IF there's one
    if (steamLink) {
      embed.addFields({ 
          name: 'Steam Page', 
          value: `[Link to Store](${steamLink})`,
          inline: true 
      })
    }

    console.log(`[GAME] ${interaction.user.username} looked up a game: ${gameData.name} (${gameData.id})`)

    ///////////////////
    // This is the part where we make the "not this one" reaction available

    const sentMessage = await interaction.editReply({ embeds: [embed] })

    if (sentMessage.guild) {
      try {
        await sentMessage.react('🚫')
        
        const filter = (reaction, reactingUser) => {
          return reaction.emoji.name === '🚫' && interaction.user.id === reactingUser.id
        }

        const collector = sentMessage.createReactionCollector({ filter, max: 1, time: 20000 })

        collector.on('collect', async () => {
          const edited = `~~${gameData.name}~~ -- Oops, wrong game! 🐭`
          await sentMessage.edit({
            content: edited,
            embeds: []
          })
        })

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
      } catch (err) {
        console.error('Failed to add reaction:', err)
      }
    }

  } catch (err) {
    console.error(`[IGDB SEARCH ERROR]`, err.response?.data || err.message)
    await interaction.editReply({ content: 'Something went wrong while searching IGDB.' })
  }
}


module.exports = { gameSearch }