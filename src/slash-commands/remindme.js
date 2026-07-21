import * as chrono from 'chrono-node'
import Reminder from '../models/reminderModel.js'
import { MessageFlags } from 'discord.js'

async function remindMe(interaction) {
  try {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral })

    const message = interaction.options.getString('message')
    const whenString = interaction.options.getString('when')
    const destination = interaction.options.getString('destination')

    // Parse natural language into a JS Date object
    const parsedDate = chrono.parseDate(whenString)

    if (!parsedDate) {
      return interaction.editReply("I couldn't understand that time format. Try something like `'in 2 hours'` or `'tomorrow at 5pm'`.")
    }

    if (parsedDate.getTime() <= Date.now()) {
      return interaction.editReply("This date is in the past. I don't have a TARDIS!")
    }

    await Reminder.create({
      userId: interaction.user.id,
      channelId: interaction.channelId,
      message: message,
      destination: destination,
      triggerAt: parsedDate
    })

    const unixTimestamp = Math.floor(parsedDate.getTime() / 1000)
    await interaction.editReply(`Noted. I will remind you that on <t:${unixTimestamp}:F> (<t:${unixTimestamp}:R>) in ${destination}.`)

  } catch (err) {
    console.error(`[REMINDME] Fatal error:\n`, err)
    await interaction.editReply("Database error. Reminder not set. Ping Hyrul about it!").catch(console.error)
  }
}

export default remindMe