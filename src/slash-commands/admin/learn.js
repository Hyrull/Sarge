import OpenAI from 'openai'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'
import Memory from '../../models/memoryModel.js'
import { getChannelHistory } from '../../utils/contextFetcher.js'

const openai = new OpenAI()



const ExtractionSchema = z.object({
  extracted_facts: z.array(z.string()).describe("List of persistent facts learned about any users in the chat log. You MUST explicitly state the username in every extracted fact string (e.g., 'UserName likes hockey'). Return an empty array if nothing notable is found.")
})

const learnCommand = async (interaction) => {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral })
      
      const limit = interaction.options.getInteger('limit')
      const chatLog = await getChannelHistory(interaction, limit)

     // Fetch existing knowledge to prevent duplicates
     const existingMemories = await Memory.find({})
     const memoryContext = existingMemories.length > 0
       ? `\n\nExisting Knowledge Base:\n- ${existingMemories.map(m => m.fact).join('\n- ')}\n\nCRITICAL: Do NOT extract or return facts that are already in the Existing Knowledge Base or mean the same thing.`
       : ""

      try {
        const completion = await openai.chat.completions.parse({
          model: 'gpt-5.6-terra',
          messages: [
            { role: 'system', content: `Analyze the following chat log and extract any permanent personal facts, preferences, or behavioral directives about the users involved.${memoryContext}` },
            { role: 'user', content: chatLog }
          ],
          response_format: zodResponseFormat(ExtractionSchema, "extraction")
        })

        const facts = completion.choices[0].message.parsed.extracted_facts

        if (!facts || facts.length === 0) {
          return interaction.editReply({ content: 'No actionable facts found in the scanned messages.' })
        }

        facts.forEach(fact => {
          console.log(`[KNOWLEDGE] Learnt this: ${fact}`)
        })

        const memoryDocs = facts.map(fact => ({
          userId: interaction.user.id, // Assigned to the admin who triggered the learn command
          fact: fact
        }))

        await Memory.insertMany(memoryDocs)
        
        await interaction.editReply({ 
          content: `Extracted and saved ${facts.length} facts:\n\n${facts.map(f => `- ${f}`).join('\n')}` 
        })
      } catch (error) {
        console.error("[LEARN COMMAND ERROR]:", error)
        await interaction.editReply({ content: 'Learning failed. Check the console!' })
      }
}

export default learnCommand