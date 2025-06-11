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

  // Convert to plain object for caching
  settingsCache.set(guildId, settings);
  return settings
}

function clearSettings(guildId) {
  settingsCache.delete(guildId)
}

function updateSettingsInCache(guildId, updatedData) {
  const current = settingsCache.get(guildId)
  if (current) {
    settingsCache.set(guildId, { ...current.toObject(), ...updatedData })
  }
}

module.exports = {
  getSettings,
  clearSettings,
  updateSettingsInCache
}
