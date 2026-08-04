import axios from 'axios'
import * as cheerio from 'cheerio'
import OpenAI from 'openai'
import { EmbedBuilder } from 'discord.js'
import path from 'path'
import fs from 'node:fs/promises'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'
import { getChannelHistory } from './../utils/contextFetcher.js'
import Memory from '../models/memoryModel.js'

const gptSearch = async (interaction) => {
  const query = interaction.options.get('question').value
  const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY 
})

const SargeResponseSchema = z.object({
  answer: z.string().describe("Your markdown-formatted response to the user's prompt."),
  showSources: z.boolean().describe("Set to false if the question is a joke/meme, or if the provided search results were completely blank/irrelevant."),
  extracted_facts: z.array(z.string()).describe("A list of distinct, persistent facts learned from this prompt. You MUST explicitly state the username in every fact (e.g., 'ThisUser likes hockey'). Return an empty array if no new facts are present.")
})

const personasFilePath = path.join(process.cwd(), 'data', 'personas.json')

  const channelHistory = await getChannelHistory(interaction, 15)

  // Gonna sum up the three firsts result only
  // Step 1: I'll search through google (API : serpapi)
  try {
    const serpRes = await axios.get("https://serpapi.com/search", {
      params: {
        q: query,
        api_key: process.env.SERPAPI_KEY,
        engine: "google",
      },
    })

    // Filter out any results from *.fandom.com
    const filteredResults = (serpRes.data.organic_results || []).filter(
      r => !/^https?:\/\/[^\/]*\.fandom\.com/.test(r.link)
    )

    // Declaring it this way because i'll need the .title later on
    const firstResult = filteredResults[0]
    const secondResult = filteredResults[1]
    const thirdResult = filteredResults[2]

    if (!firstResult) return "No results found."
    const firstUrl = firstResult.link
    const secondUrl = secondResult ? secondResult.link : null
    const thirdUrl = thirdResult ? thirdResult.link : null


    // Step 2 : Scraping the result's page
    async function fetchPageContent(url) {
      try {
        // If it's youtube, it's irrelevant
        if (url.includes("youtube.com"))  return "[Video content]"
        // Reddit blocks the requests unless it's a .json request
        if (url.includes("reddit.com") && !url.endsWith(".json")) url += ".json"


        const page = await axios.get(url, { timeout: 10000, headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36','Accept-Language': 'en-US,en;q=0.9',} })
        const $ = cheerio.load(page.data)
        const paragraphs = $("p").map((i, el) => $(el).text()).get()
        console.log(`[QUESTION] Fetched content from ${url}`)
        return paragraphs.join(" ").slice(0, 3000) // Limit for token size 'cause I ain't gonna pay that much for a discord bot
      } catch (error) {
        console.error(`[QUESTION] Error fetching ${url}:`, error.message)
        return "[Content unavilable due to an error while fetching the page.]"
      }
    }
    const firstPageContent = await fetchPageContent(firstUrl)
    const secondPageContent = secondUrl ? await fetchPageContent(secondUrl) : ""
    const thirdPageContent = thirdUrl ? await fetchPageContent(thirdUrl) : ""

    // console.log(`[Question WIP] THIS IS THE FULL CONTEXT FOR THE QUESTION: ${channelHistory}`)

    // Pre-Step 3 : Preparing a custom persona so Sarge matches the user's tone
    let userPersona = ""
    // try {
    //   const personaRaw = await fs.readFile(personasFilePath, 'utf-8')
    //   const personaDict = JSON.parse(personaRaw)
      
    //   if (personaDict[interaction.user.id]) {
    //     userPersona = `\n\nContext about the anonymous user asking the question: ${personaDict[interaction.user.id]}\nCRITICAL INSTRUCTION: You know this user, but you must be EXTREMELY subtle. DO NOT cram their interests into your response. If making an analogy, pick AT MOST ONE of their interests, and ONLY if it naturally elevates the explanation. If no interest perfectly fits the topic, do not reference them at all. NEVER force a reference. Act like a normal friend, not someone reading from a dossier.`
    //   }
    // } catch (err) {
    //   // Silently ignore if file doesn't exist or is malformed
    //   console.log("[QUESTION] personas.json not found or invalid, using default personality.")
    // }

    // Fetching Sarge's knowledge
    const allMemories = await Memory.find({})
    const memoryContext = allMemories.length > 0 
      ? `Global knowledge base and user facts:\n${allMemories.map(m => `- ${m.fact}`).join('\n')}` 
      : "You have no prior knowledge."

    // 2. Build the dynamic System Prompt
    const baseSystemPrompt = "You are Sarge, a helpful mouse assistant created by Hyrul, that summarizes articles for a Discord chat. You will be answering questions based on your own knowledge, and the provided search result content. Keep your answers concise and informative, suitable for a Discord chat. If the question references previous chat context or is a direct follow-up, use the channel history to answer accurately. If you recognize the question as being a joke or meme, discard the search result data answer in a humorous way."
    
    const finalSystemPrompt = baseSystemPrompt + userPersona + memoryContext

  // Step 3 : Using ChatGPT to summarize it and make it shorter but still informative
    const response = await ai.chat.completions.parse({
      model: 'gpt-5.6-terra', // switched from 4.1 to 5.6. did you know the openAI api wallet expires after a year? i had barely used the money i added. i got scammed. i'll use my money now.
      messages: [
        {
          role: "system",
          content: finalSystemPrompt,
        },
        {
          role: 'user',
          content: `Recent Channel History:\n${channelHistory}\n\nUser Question: "${query}"\n\nSearch result 1:${firstPageContent}\n\nSearch result 2:${secondPageContent}\n\nSearch result 3:${thirdPageContent}`,
        },
      ],
     response_format: zodResponseFormat(SargeResponseSchema, "sarge_response"),
      temperature: 1,
      max_completion_tokens: 1500,
    })
    const { answer: summary, showSources, extracted_facts } = response.choices[0].message.parsed

    // If we learnt anything, let's store it in DB
    if (extracted_facts && extracted_facts.length > 0) {
      
      extracted_facts.forEach(fact => {
        console.log(`[KNOWLEDGE] Learnt this: ${fact}`)
      })

      const memoryDocs = extracted_facts.map(fact => ({
        userId: interaction.user.id,
        fact: fact
      }))
      Memory.insertMany(memoryDocs).catch(err => console.error("[QUESTION - KNOWLEDGE] Memory save failed:", err))
    }

    const sources = [
      firstResult.title ? `["${firstResult.title}"](<${firstUrl}>)` : "",
      secondResult && secondResult.title ? `["${secondResult.title}"](<${secondUrl}>)` : "",
      thirdResult && thirdResult.title ? `["${thirdResult.title}"](<${thirdUrl}>)` : ""
    ].filter(Boolean).join(", ")

    console.log(`[QUESTION] Answering ${interaction.user.username}'s question: ${query}`)
    // return `You asked - "**${query}**". Here's my answer:\n\n${summary}\n\n**Sources:**\n${sources}\n*-# I am a simple mouse. I might be wrong, so take this answer with a grain of cheese.*`
    const replyEmbed = new EmbedBuilder()
      .setColor('#009dff')
      .setTitle(`You asked: "${query}"`)
      .setDescription(showSources && sources.length > 0 ? `${summary}\n\n**Sources:**\n${sources}` : summary)
      .setFooter({ 
        text: showSources && sources.length > 0 
          ? 'I am a simple mouse. I might be wrong, so take this answer with a grain of cheese.' 
          : 'Not adding sources - they might be unavailable to me, or were irrelevant to the question.' 
      })

    return { embeds: [replyEmbed] }
  } catch (err) {
    console.error(err)
    return { content: "There was an error summarizing the text." }
  }
}

export default gptSearch