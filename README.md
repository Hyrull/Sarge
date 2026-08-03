#  Sarge

<img src="https://github.com/Hyrull/Sarge/blob/main/data/sarge.png?raw=true" alt="Sarge himself" height="150" />

Sarge is a Discord bot that I made for my own community server. He's essentially a toolbox bot, that has very specific features that my community wanted to have. I added more and more features over time.
> Some of these features include ways to ban yourself or others. Read this README if you want to self-host your own Sarge!

##  General Commands
- /youtube - Search through YouTube videos for Sarge to post in chat
- /game - Search through IGDB games for Sarge to post in chat
- /movie - Search through IMDB movies for Sarge to... you got it.
- /question - Ask Sarge anything and get an answer.
- /remindme - Ask Sarge to remind you about anything any time.
- /version - See the current Sarge version and changelogs.
- /ping - Check if Sarge is sleeping or not.
- /feedback - Suggest changes so your admin can ignore you.
- /secret - Find out the secret rule from trial and error. (game, disabled by default)
- /event - Add or remove yourself an "event" role. I built it before the "channels & roles" Discord feature tbh.
  
##  "Use Cautiously" Commands!!
- /nsfw, that **bans the user using the command**, unless they have the role that spares them.
- /roulette, that **can ban a random unprotected user**, or time you out for incremental lengths.
> FOR THE LOVE OF AZEROTH DISABLE THESE IF YOU'RE NOT SURE WHAT YOU'RE DOING

---

###  Mod Commands
- /toggle - To toggle on and off some features.
- /status - Change Sarge's online presence, and custom status.
  
###  Reacts to some messages as well
- Will react with a snake to anyone saying "american".
- Will react with a snake to anyone saying "french" (disabled by default).
- Will react with a teacup to anyone saying "english".
- Will react with a blue heart to anyone saying "good bot" or "i love you Sarge".
- Has a tiny chance of answering a meme to anyone saying "crazy".
  
###  "Why did you even code these?" :
- /american-snake-count - See how many times Sarge reacted a snake to "american".
- /french-snake-count - Same, but with "french". I love clutter commands.
- /greetings - Sends a short video of that creature saying "...greeetiiiings!". Don't ask.
  
---
  
##  "I need Sarge on my server!"

We all do.

###  Run it with node:
1. Clone the repo.
2. Remove the features you don't want from *scripts/register-commands.js*
3. Populate *.env* - use my *.env.example*. Don't need to populate fields of features you disabled.
4. Run the following: `npm i` and  `node scripts/register-commands.js`.
5. From now on, you can use `node src/sarge.js` to run Sarge locally.
  
###  Any docker container?
1. Create this *docker-compose.yml*:

```yml
name: "discordbots"

services:
  bot-sarge:
    build: ./bot-sarge
    container_name: bot-sarge
    working_dir: /usr/src/app
    volumes:
      - ./bot-sarge:/usr/src/app
      - sarge_nodemodules:/usr/src/app/node_modules
    command: npx nodemon src/sarge.js
    restart: unless-stopped
    ports:
      - "8300:8300" # health check port

volumes:
  sarge_nodemodules:
```

Build the image, install dependencies, and boot up the container:

2.  `docker compose build --no-cache bot-sarge`

3.  `docker compose run --rm bot-sarge npm install`

4.  `docker compose up -d`

  
##  Contribution?

Sure. I'll take any improvement PRs. If you PR a full new request I probably won't merge it though, since Sarge is tailored to my own server. Unless your feature is cool.


##  Why "Sarge" anyway? What a weird name.

Sarge is the mascot mouse from Hearthstone. He was added as [a pet in World of Warcraft](https://www.wowhead.com/item=212606/sarge) in 2024 and I found him so adorable, I brought him along all my adventures since and made this Discord bot in his honor. If you want to respect the legacy, you can find Sarge's profile pic in *data/Sarge.png*.

  

*Squeak!*