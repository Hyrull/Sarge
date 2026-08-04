import mongoose from 'mongoose'

const memorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  fact: { type: String, required: true },
  addedAt: { type: Date, default: Date.now }
})

export default mongoose.model('Memory', memorySchema)