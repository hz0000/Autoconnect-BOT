const { Client, MessageEmbed, MessageButton, MessageActionRow, Intents } = require("discord.js");

const client = new Client({
    intents:
        [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES
        ],
});

const config = require('./config.json')
const colors = require('colors')
const axios = require('axios')



client.on(`ready`, () => {
    console.log(colors.cyan("[Info] ") + "Carregamento do bot iniciado.\n")
})

var data = {}

client.on("ready", async () => {
    
    var players = 0

    async function players_online() {
        await axios.get(`http://${config.ip}${config.porta}/players.json`).then(response => {
            data.players = response.data.length
        }).catch(err => data.players = -1)

    }
    
    async function autoconnect() {
        await client.channels.cache.get(config.Canal).bulkDelete(100).catch(() => console.error)

        if (data.players === -1) {
            var embed = new MessageEmbed()
                .setTitle(`Conexão - ${config.name}`)
                .setColor("RED")
                .setThumbnail(config.Logo)
                .setDescription(`O servidor está offline.`)

        } else {
            var embed = new MessageEmbed()
                .setTitle(`Conexão - ${config.name}`)
                .setColor('#2F3136')
                .setThumbnail(config.Logo)
                .setDescription(`Jogadores atualmente: **${data.players}**/1024\n\nConecte-se pelos botões abaixo.`)

        }

        const autoconnect = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setStyle("LINK")
            .setLabel(`FiveM`)
            .setURL(config.CFX.url),
        
            new MessageButton()
            .setStyle("LINK")
            .setLabel(`TeamSpeak3`)
            .setURL(config.TS3.url)
            );

        await client.channels.cache.get(config.Canal).send({
      embeds: [embed], components: [autoconnect]
    }).then(msg => {
            setInterval(() => {
                if (data.players === -1) {
                    embed.color = "RED"
                    embed.description = `O servidor está offline.`
                    msg.edit(embed)
                } else {
                    embed.description = `Jogadores atualmente: **${data.players}**/1024 \n\nConecte-se pelos botões abaixo.`
                    msg.edit(embed)
                }
            }, 30000);
        })
    }


    autoconnect()

    setInterval(() => {
        client.user.setStatus('dnd');
        client.user.setActivity(`${config.name} com ${data.players} players.`, { type: 'PLAYING' })
        players_online()
    }, 10000)

})

client.login(config.token)