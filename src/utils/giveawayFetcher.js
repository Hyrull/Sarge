const axios = require('axios')
const { EmbedBuilder } = require('discord.js')

const GuildSettings = require('../model')
const discordChannel = '518805681566908417'

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 5000 // 5 seconds

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}


async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Discord-Bot-Sarge'
        }
      })
      return response
    } catch (error) {
      const isLastAttempt = i === retries - 1
      
      // Log the attempt
      console.log(`[GiveawayFetcher] API request attempt ${i + 1}/${retries} failed: ${error.message}`)
      
      // If it's the last attempt, throw the error
      if (isLastAttempt) {
        throw error
      }
      
      // Wait before retrying (exponential backoff)
      const delay = RETRY_DELAY * Math.pow(2, i)
      console.log(`Retrying in ${delay / 1000} seconds...`)
      await sleep(delay)
    }
  }
}

async function fetchAndAnnounceGiveaways(client) {
  try {
    // Fetch current giveaways from the API with retry logic
    const response = await fetchWithRetry('https://gamerpower.com/api/giveaways')
    const giveaways = response.data

    let cache = await GuildSettings.findOne()

    if (!cache) {
      cache = new GuildSettings({ announcedGiveaways: [] })
      await cache.save()
    }

    if (!Array.isArray(cache.announcedGiveaways)) {
      cache.announcedGiveaways = []
    }

    // Filter out already announced giveaways
    const newGiveaways = giveaways.filter(game => !cache.announcedGiveaways.includes(game.id))

    if (newGiveaways.length === 0) {
      return 'No new giveaways to announce'
    }

    // Get the channel once
    const channel = client.channels.cache.get(discordChannel)
    if (!channel) {
      console.error(`Channel ${discordChannel} not found`)
      return 'Channel not found'
    }

    // Announce new giveaways
    for (const game of newGiveaways) {
      // Skipping non-Steam/EGS games, but registering them in cache anyway
      if (!game.platforms.includes('Steam') && !game.platforms.includes('Epic Games Store')) {
        console.log(`[GiveawayFetcher] Skipping non-Steam/Epic giveaway: ${game.title} (${game.id})`)
        cache.announcedGiveaways.push(game.id)
        await cache.save()
        continue
      }

      try {
        // Create and send Discord announcement
        const embed = new EmbedBuilder()
          .setColor('#009dff')
          .setTitle(`**${game.title}** (*${game.type}*)`)
          .setDescription(game.description || 'No description available.')
          .setImage(game.image)
          .addFields(
            { 
              name: 'Redemption', 
              value: `[Redeem here](${game.open_giveaway})`,
              inline: false
            },
            {
              name: 'Platforms',
              value: game.platforms || 'Unknown',
              inline: true
            },
            {
              name: 'Price Worth',
              value: game.worth || 'Unknown',
              inline: true
            },
            {
              name: 'Ends on:',
              value: game.end_date ? new Date(game.end_date).toLocaleDateString() : 'Unknown',
              inline: true
            }
          )

        const announcement = {
          content: `## Freebie alert! 🐭`,
          embeds: [embed]
        }

        await channel.send(announcement)
        console.log(`Announced giveaway: ${game.title} (${game.id})`)

        // Add the game ID to cache after successful announcement
        cache.announcedGiveaways.push(game.id)
        await cache.save()

        // Small delay to avoid rate limits
        await sleep(1000)
      } catch (sendError) {
        console.error(`Failed to announce ${game.title}:`, sendError.message)
        // Continue with other giveaways even if one fails
      }
    }

    return `Announced ${newGiveaways.length} new giveaways`
  } catch (error) {
    // Handle specific error types
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_BAD_RESPONSE') {
      console.error('[GiveawayFetcher] API connection failed after retries. Will try again next cycle.')
      return 'API temporarily unavailable'
    }
    
    console.error('[GiveawayFetcher] Error in fetchAndAnnounceGiveaways:', error.message)
    // Don't throw - let the bot continue running
    return 'Error occurred but Sarge keeps running'
  }
}

module.exports = fetchAndAnnounceGiveaways