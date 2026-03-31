import mongoose from 'mongoose'

const rouletteStatsSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  currentStreak: { type: Number, default: 0 },
  totalKills: { type: Number, default: 0 },
  totalTimeouts: { type: Number, default: 0 }
})

// Separating per server
rouletteStatsSchema.index({ guildId: 1, userId: 1 }, { unique: true })

export default mongoose.model('RouletteStats', rouletteStatsSchema)