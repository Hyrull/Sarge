const axios = require('axios')
const cheerio = require('cheerio')
const { OpenAI } = require('openai')

const gptSearch = async (interaction) => {
  const query = interaction.options.get('question').value
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  // Gonna sum up the first result only
  // Step 1: I'll search through google (API : serpapi)
  try {
    const serpRes = await axios.get("https://serpapi.com/search", {
      params: {
        q: query,
        api_key: process.env.SERPAPI_KEY,
        engine: "google",
      },
    })

    const firstResult = serpRes.data.organic_results?.[0]
    if (!firstResult) return "No results found."
    const url = firstResult.link


    // Step 2 : Scraping the first result's page
    const page = await axios.get(url, { timeout: 10000 })
    const $ = cheerio.load(page.data)
    const paragraphs = $("p").map((i, el) => $(el).text()).get()
    const textContent = paragraphs.join(" ").slice(0, 3000) // Limit for token size 'cause I ain't gonna pay that much for a discord bot


  // Step 3 : Using ChatGPT to summarize it and make it shorter but still informative
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // could use gpt4 if i think it's good later on, but for now that'll do
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes articles for a Discord chat.",
        },
        {
          role: 'user',
          content: `A user asked: "${query}". Answer it in a short and informative way using this data:\n\n${textContent}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,

      // Hey, future me. As of May 2025, here's the token prices if you wanna change it.
      // gpt-3.5-turbo	~$0.0015 / 1k tokens
      // gpt-4-turbo	~$0.01	/ 1k tokens
    })
    const summary = response.choices[0].message.content
    return `You asked - "**${query}**". \n\nHere's my answer: ${summary}\n\n[**Source** - "${firstResult.title}](<${url}>)`
  } catch (err) {
    console.error(err)
    return "There was an error summarizing the text."
  }
}

module.exports = { gptSearch }