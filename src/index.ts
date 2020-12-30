import { Client } from "discord.js";
import {config} from 'dotenv';
import { Music } from "./Music";

import botComands from './botCommands.json';

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
        const connection = await message.member?.voice.channel?.join();

        var MusicController = new Music(youtubeURL, connection!);
    }
});

