const GuildSettings = require('../model');
const { updateSettingsInCache } = require('./settingsManager');

async function incrementCount(guildId, field) {
  const updated = await GuildSettings.findOneAndUpdate(
    { guildId },
    { $inc: { [field]: 1 } },
    { new: true } // gets the updated doc
  )

  if (updated) {
    updateSettingsInCache(guildId, { [field]: updated[field] })
  }
}

module.exports = incrementCount
