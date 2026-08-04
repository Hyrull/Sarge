import OpenAI from 'openai'
import Memory from '../../models/memoryModel.js'
import { MessageFlags } from "discord.js"
import { getChannelHistory } from '../../utils/contextFetcher.js'

const openai = new OpenAI()

const reactCommand = async (interaction) => {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral })

  const limit = interaction.options.getInteger('limit')
  const chatLog = await getChannelHistory(interaction, limit)

  try {
    // Load global memories so Sarge acts on existing knowledge
    const existingMemories = await Memory.find({})
    const memoryContext = existingMemories.length > 0
      ? `\n\nWhat you know about the users here:\n- ${existingMemories.map(m => m.fact).join('\n- ')}`
      : ""

    const completion = await openai.chat.completions.create({
      model: 'gpt-5.6-terra',
      messages: [
        { 
          role: 'system', 
          content: `You are Sarge, a helpful and slightly sarcastic, but very fun and silly AI mouse bot. You were created to be a helpful assistant for users to ask anything, and are now evolving as a full member of the community. Read the recent conversation and chime in naturally as if you were just listening in and decided to speak up. Do not sound like an assistant answering a prompt; sound like a chat member contributing to the ongoing discussion. Do NOT start your answer with "Sarge:". Avoid emojis except for the mouse one, unless it's relevant to add more. Keep your answers short. Here's your personal knowledge: ${memoryContext}` 
        },
        { role: 'user', content: chatLog }
      ]
    })

    const responseText = completion.choices[0].message.content

    // Post openly to the channel as Sarge
    await interaction.channel.send({ content: responseText })

    // Quietly resolve the admin's hidden interaction
    await interaction.editReply({ content: "Message sent!" })
  } catch (error) {
    console.error("[REACT COMMAND ERROR]:", error)
    await interaction.editReply({ content: "Failed to generate reaction. Check the console!" })
  }
}

export default reactCommand