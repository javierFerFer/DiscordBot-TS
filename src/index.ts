import { Client } from "discord.js";
import {config} from 'dotenv';
import { YoutubeMusicController } from "./YoutubeMusicController";

import botComands from './botCommands.json';
import URLOptions from './config.json';
import errorMessages from './errorMessages.json';

var MusicController: YoutubeMusicController;

// Load enviroment variable to access token
config();

const CLIENT: Client = new Client();

// token here
CLIENT.login(process.env.BOT_TOKEN);

CLIENT.on('ready', () =>{
    console.log("Bot is ready!");
});

CLIENT.on('message', async message =>{
    try {
        if (message.content.startsWith(botComands.playMusic)) {
            if (message.toString().includes(URLOptions.httpYoutube)) {
                var youtubeURL : string = message.toString().split(botComands.playMusic).pop()?.trim()!;
                var connection = await message.member?.voice.channel?.join();
                if (connection != undefined) {
                    MusicController = new YoutubeMusicController(youtubeURL, connection!, message);
                }else{
                    message.channel.send(errorMessages.noChannelVoice);
                }
            }else{
                message.channel.send(errorMessages.NoYTUrl);
            }
        }
        // Stop music
        if (message.content.startsWith("!!stop")) {
            if (MusicController != null) {
                MusicController.stopDispatcher();
            }
        }

        // resume music
        if (message.content.startsWith("!!continue")) {
            if (MusicController != null) {
                MusicController.resumeDispatcher();
            }
        }
    } catch (error) {
        message.channel.send(errorMessages.noChannelVoice);
    }
});

