const Discord = require("discord.js");
const fs = require("fs");
const axios = require("axios");

const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));
const client = new Discord.Client();

client.on("ready", () => {
	console.log(client.user.username + " ready");
});

client.on("message", (msg) => {
	if (msg.author.id === client.user.id) return;

	const content = msg.content;
	if (content.match(/amazon\.de\/|amazon\.com\//gi)) {
		getShortenedLink(msg.content, (err, shortLink) => {
			if (err) return;

			const embed = new Discord.MessageEmbed();
			embed.setTitle(msg.author.username);
			embed.addField("Amazon", shortLink);
			embed.setColor(msg.member.displayHexColor);

			msg.channel.send(embed);

			msg.delete();
		});
	}
});

client.login(config.token);

function getShortenedLink(longLink, callback) {
	let postReq = {
		method: "post",
		url: "https://api-ssl.bitly.com/v4/shorten",
		headers: {
			Authorization: "Bearer " + config.bitlyApiKey,
			"Content-Type": "application/json",
		},
		data: {
			domain: "bit.ly",
			long_url: longLink,
		},
	};

	axios(postReq)
		.then((resp) => {
			callback(null, resp.data.link);
		})
		.catch((err) => {
			console.log(err, null);
		});
}
