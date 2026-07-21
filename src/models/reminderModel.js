import mongoose from 'mongoose'

const reminderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  channelId: { type: String, required: true },
  message: { type: String, required: true },
  destination: { type: String, required: true, enum: ['dm', 'here'] },
  triggerAt: { type: Date, required: true }
})

export default mongoose.model('Reminder', reminderSchema)