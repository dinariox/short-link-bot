const Discord = require("discord.js");
const fs = require("fs");
const axios = require("axios");

const AMAZON_PRODUCT_TITLE_LENGTH = 70;

const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));
const client = new Discord.Client();

client.on("ready", () => {
	console.log(client.user.username + " ready");
});

client.on("message", (msg) => {
	if (msg.author.id === client.user.id) return;

	const content = msg.content;
	if (content.match(/amazon\.de\/|amazon\.com\//gi)) {
		getShortenedLink(content, (err, shortLink) => {
			if (err) return;

			const embed = new Discord.MessageEmbed();
			embed.setTitle(msg.author.username);
			embed.addField(getAmazonProductTitle(content), shortLink);
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

function getAmazonProductTitle(url) {
	let getReq = {
		mehtod: "get",
		url,
	};

	axios(getReq)
		.then((resp) => {
			let title = resp.data.match(/<title[^>]*>([^<]+)<\/title>/)[1];
			title = title.split(":")[0];
			title = title.length > AMAZON_PRODUCT_TITLE_LENGTH ? title.substring(0, AMAZON_PRODUCT_TITLE_LENGTH) + "..." : title;
			console.log(title);
		})
		.catch((err) => {
			console.error(err);
		});
}
