import { Client } from "discord.js";
import ytdl from "ytdl-core";
import botComands from './config.json';
import {config} from 'dotenv';
import { stringify } from "querystring";

// Load enviroment variable to access token
config();

const client: Client = new Client();

// token here
client.login(process.env.BOT_TOKEN);

client.on('ready', () =>{
    console.log("Bot is ready!");
});

client.on('message', async message =>{
    if (message.content.startsWith(botComands.playMusic)) {
        var youtubeURL : string = message.toString().split(botComands.playMusic).pop()?.trim()!;
        const connect = await message.member?.voice.channel?.join();
        connect?.play(ytdl(youtubeURL, {filter: 'audioonly'}));
    }
});

