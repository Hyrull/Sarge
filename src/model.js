const mongoose = require('mongoose')

const settingsSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  frenchSnake: { type: Boolean, default: true },
  americanSnake: { type: Boolean, default: true },
  englishTea: { type: Boolean, default: true },
  gorfil: { type: Boolean, default: true },
  crazy: { type: Boolean, default: true },
  crazyOdds: { type: Number, default: 10 },
  announcedGiveaways: { type: [Number], default: [] },

  frenchSnakeCount: { type: Number, default: 0 },
  americanSnakeCount: { type: Number, default: 0 },
  nsfwBans: { type: Number, default: 0 },
})

module.exports = mongoose.model('Settings', settingsSchema)