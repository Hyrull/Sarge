const axios = require('axios')
const mongoose = require('mongoose')

// Define cache schema for MongoDB
const GuildSettings = require('../model')
const discordChannel = '518805681566908417'

async function fetchAndAnnounceGiveaways(client) {
  try {
    // Fetch current giveaways from the API
    const response = await axios.get('https://gamerpower.com/api/giveaways')
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
      console.log('No new giveaways to announce.')
      return 'No new giveaways to announce'
    }
    // Announce new giveaways
    for (const game of newGiveaways) {
      // Create and send Discord announcement
      const announcement = {
        content: `## There is a new freebie! 🐭\n**${game.title}**\nType: ${game.type}\nWorth: ${game.worth}\n[Redeem here](${game.open_giveaway_url})\nEnds on: ${new Date(game.end_date).toLocaleDateString()}`,
      }

      client.channels.cache.get(discordChannel).send(announcement)
      console.log(`Announced giveaway: ${game.title} (${game.id})`)

      // Add the game ID to cache
      cache.announcedGiveaways.push(game.id)
    }

    // Save updated cache
    await cache.save()

    return `Announced ${newGiveaways.length} new giveaways`
  } catch (error) {
    console.error('Error in fetchAndAnnouncedGiveaways:', error)
    throw error
  }
}

module.exports = fetchAndAnnounceGiveaways