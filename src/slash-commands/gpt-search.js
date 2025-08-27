const axios = require('axios')
const cheerio = require('cheerio')
const { OpenAI } = require('openai')

const gptSearch = async (interaction) => {
  const query = interaction.options.get('question').value
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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
        console.log(`Fetched content from ${url}`)
        return paragraphs.join(" ").slice(0, 3000) // Limit for token size 'cause I ain't gonna pay that much for a discord bot
      } catch (error) {
        console.error(`Error fetching ${url}:`, error.message)
        return "[Content unavilable due to an error while fetching the page.]"
      }
    }
    const firstPageContent = await fetchPageContent(firstUrl)
    const secondPageContent = secondUrl ? await fetchPageContent(secondUrl) : ""
    const thirdPageContent = thirdUrl ? await fetchPageContent(thirdUrl) : ""


    ////////////////

    ////// THIS IS A TESTING CODE FOR SELF-HOSTED GEMMA3
    // It works, but it's not as good as GPT-4o-mini - much slower (because it's self-hosted) and the quality is not as convincing.
    // For the sake of things though, I'll keep the code here because this lil' feature could be useful for a different context or project.

    ////////////////

    // Step 3 : Using self-hosted Gemma3 to summarize it and make it shorter but still informative
    // const jsonPayload = { 
    //   "model": "ai/gemma3:latest", 
    //   "messages": [ 
    //     { "role": "system", "content": "You are Sarge, a helpful mouse assistant that summarizes articles for a Discord chat. You will be answering questions based on your own knowledge, and the provided search result content. Keep your answers concise and informative, suitable for a Discord chat. If you recognize the question as being a joke or meme, Discord the search result data answer in a humorous way." }, 
    //     { "role": "user", "content": `A user asked: "${query}". Here is data:\n\nSearch result 1:${firstPageContent}\n\nSearch result 2:${secondPageContent}\n\nSearch result 3:${thirdPageContent}` } 
    //   ] }

    // const response = await fetch('http://localhost:12434/engines/llama.cpp/v1/chat/completions', 
    //   { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(jsonPayload) }) 

    ///////////////

  // Step 3 : Using ChatGPT to summarize it and make it shorter but still informative
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Could switch to 4.5 if we want better quality later on
      messages: [
        {
          role: "system",
          content: "You are Sarge, a helpful mouse assistant that summarizes articles for a Discord chat. You will be answering questions based on your own knowledge, and the provided search result content. Keep your answers concise and informative, suitable for a Discord chat. If you recognize the question as being a joke or meme, Discord the search result data answer in a humorous way.",
        },
        {
          role: 'user',
          content: `A user asked: "${query}". Here is data:\n\nSearch result 1:${firstPageContent}\n\nSearch result 2:${secondPageContent}\n\nSearch result 3:${thirdPageContent}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,

      // Hey, future me. As of May 2025, here's the token prices if you wanna change it.
      // gpt-3.5-turbo	~$0.0015 / 1k tokens
      // gpt-4-turbo	~$0.01	/ 1k tokens
    })
    const summary = response.choices[0].message.content 

    const sources = [
      firstResult.title ? `["${firstResult.title}"](<${firstUrl}>)` : "",
      secondResult && secondResult.title ? `["${secondResult.title}"](<${secondUrl}>)` : "",
      thirdResult && thirdResult.title ? `["${thirdResult.title}"](<${thirdUrl}>)` : ""
    ].filter(Boolean).join(", ")

    return `You asked - "**${query}**". \n\nHere's my answer: ${summary}\n\n**Sources:**\n${sources}\n*-# I am a simple mouse. I might be wrong, so take this answer with a grain of cheese.*`
  } catch (err) {
    console.error(err)
    return "There was an error summarizing the text."
  }
}

module.exports = { gptSearch }