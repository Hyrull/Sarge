// If you're wondering what the f- cheese is this file, it's a daemon that checks about stored "reminders" and pings users when the right time comes.
// Just check the remindme.js file or the command description in register-commands.js

import { EmbedBuilder } from 'discord.js'
import Reminder from '../models/reminderModel.js'

const startReminderDaemon = (client) => {
  setInterval(async () => {
    try {
      const now = new Date()
      const dueReminders = await Reminder.find({ triggerAt: { $lte: now } })

      for (const reminder of dueReminders) {
        try {
          // Extract exact creation time natively from the MongoDB ObjectId
          const createdAt = reminder._id.getTimestamp()
          const createdUnix = Math.floor(createdAt.getTime() / 1000)

          const embed = new EmbedBuilder()
            .setColor('#f0f0f0')
            .setTitle('🐭 Reminder!')
            .setDescription(reminder.message)
            // .addFields({ 
            //   name: 'Requested', 
            //   value: `<t:${createdUnix}:F> (<t:${createdUnix}:R>)` 
            // })
            .setFooter({ text: '🧀 Squeak!' })

          if (reminder.destination === 'dm') {
            const user = await client.users.fetch(reminder.userId)
           await user.send({ 
             content: `<t:${createdUnix}:R>, you asked me to remind you of this:`,
             embeds: [embed] 
           })
          } else if (reminder.destination === 'here') {
            const channel = await client.channels.fetch(reminder.channelId)
            await channel.send({
              content: `<@${reminder.userId}>: <t:${createdUnix}:R>, you asked me to remind you of this: `,
              embeds: [embed],
              allowedMentions: { 
                users: [reminder.userId], 
                roles: [], 
                parse: [] 
              }
            })
          }
        } catch (deliveryErr) {
          console.error(`[REMINDER DAEMON] Failed to deliver reminder to ${reminder.userId}:`, deliveryErr)
        }

        await Reminder.deleteOne({ _id: reminder._id })
      }
    } catch (dbErr) {
      console.error(`[REMINDER DAEMON] Database query failed:`, dbErr)
    }
  }, 60000)
}

export default startReminderDaemon