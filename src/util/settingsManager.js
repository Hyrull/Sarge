const GuildSettings = require('../model')
const settingsCache = new Map()

async function getSettings(guildId) {
  if (!guildId) return null

  // Checking if there's some in cache already
  if (settingsCache.has(guildId)) {
    return settingsCache.get(guildId)
  }

  // Fetching settings from the database
  let settings = await GuildSettings.findOne({ guildId })

  // Creating new settings if there wasn't before
  if (!settings) {
    settings = new GuildSettings({ guildId })
    await settings.save()
  }

  const plainSettings = settings.toObject()
  settingsCache.set(guildId, plainSettings)
  return plainSettings
}

function clearSettings(guildId) {
  settingsCache.delete(guildId)
}

async function updateSettingsInCache(guildId, updatedData) {
  try {
    const updated = await GuildSettings.findOneAndUpdate(
      { guildId },
      updatedData,
      { new: true }
    )

    if (updated) {
      settingsCache.set(guildId, updated.toObject())
      console.log(`Updated ${guildId}:`, updatedData)
    } else {
      console.warn(`No settings found for guild ${guildId} to update.`)
    }
  } catch (err) {
    console.error(`Failed to update settings for ${guildId}:`, err)
  }
}

module.exports = {
  getSettings,
  clearSettings,
  updateSettingsInCache
}
