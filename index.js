const { Client } = require('discord.js-selfbot-v13')
const cheerio = require('cheerio')
const fetch = require('@replit/node-fetch')
const client = new Client({
    checkUpdate: false
})

const Webhook = "Where the GIFs get logged to"
const Token = "Your Discord token"

async function ValidateGIF(URL) {
    try {
        const Response = await fetch(URL, {
            method: "GET"
        })

        if(Response.status == 200) {
            return true
        } else {
            return false
        }
    } catch(e) {
        return false
    }
}

async function ExtractTenorGIF(URL) {
    try {
        URL = URL + '.gif'
        const Response = await fetch(URL, {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "sec-ch-ua": "\"Opera GX\";v=\"105\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
                "sec-ch-ua-arch": "\"x86\"",
                "sec-ch-ua-bitness": "\"64\"",
                "sec-ch-ua-full-version-list": "\"Opera GX\";v=\"105.0.4970.56\", \"Chromium\";v=\"119.0.6045.199\", \"Not?A_Brand\";v=\"24.0.0.0\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-model": "\"\"",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-ch-ua-platform-version": "\"15.0.0\"",
                "sec-ch-ua-wow64": "?0",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "cookie": "_ga=GA1.2.1144355133.1698179297; _gid=GA1.2.381675032.1703082379; _ga_EFZJPJ84N1=GS1.2.1703093850.9.0.1703093933.0.0.0; _gat_gtag_UA_49165425_12=1"
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET"
        })
        const ResponseRAW = await Response.text()
        const $ = cheerio.load(ResponseRAW)
        const GIFUrl = $('img[src^="https://c.tenor.com"]').map(function() {
            return $(this).attr('src')
        }).get()[0]
        
        return GIFUrl
    } catch(e) {
        return "Error getting tenor URL"
    }
}

async function LogGIF(URL, Message) {
    await fetch(Webhook, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "content": null,
            "embeds": [
              {
                "title": "🚀 **GIF Found**",
                "description": `🔗 [URL](${URL})\n💬 [Message](${Message.url})\n👤 <@${Message.author.id}>`,
                "color": 4964382,
                "image": {
                  "url": URL
                }
              }
            ],
            "attachments": []
          })
    })
}

client.on('messageCreate', async(message) => {
    if(message.content !== "" && message.channel.type.includes('GUILD')) {
        if(message.content.includes('.gif') || message.content.includes('https://tenor.com/')) {
            const IsValid = await ValidateGIF(message.content)

            if(message.content.includes('https://tenor.com') && !message.content.includes('.gif') && IsValid) {
                const NewURL = await ExtractTenorGIF(message.content)
                message.content = NewURL
            }
            
            if(IsValid) {
                await LogGIF(message.content, message)
            }
        }
    }
})

client.on('ready', async () => {
    console.log(`Connected to account: ${client.user.username}\nGIF stealer is ready!`)
})

client.login(Token)
