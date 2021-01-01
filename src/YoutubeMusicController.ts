import {ColorResolvable, Message, MessageEmbed, StreamDispatcher, VoiceConnection } from "discord.js";
import ytdl from "ytdl-core";
import urlElements from './config.json';
import errorMessages from './errorMessages.json';

const PLAYLIST = require('youtube-playlist-summary');
import textElements from './discordChangeTextElements.json';
const GET_YOUTUBLE_TITLE_VIDEO = require('get-youtube-title');

export class YoutubeMusicController {
    dispatcher!: StreamDispatcher;
    ytURL: string;
    counterYtList: any;
    connection: VoiceConnection;
    playListTitleUrl: Map<string, string>;
    message: Message;

    constructor(ytURLParam: string, connectionParam: VoiceConnection, messageParam: Message) {
        this.ytURL = ytURLParam;
        this.connection = connectionParam;
        this.counterYtList = 0;
        this.message = messageParam;

        this.playListTitleUrl = new Map();

        this.processURL();
    }

    stopDispatcher(){
        if (this.dispatcher != null) {
            this.dispatcher.pause();
        }
    }

    resumeDispatcher(){
        if (this.dispatcher != null) {
            this.dispatcher.resume();
        }
    }

    processURL(){
        try {
            if (this.ytURL.includes(urlElements.playList)) {

                const PLAY_LIST_ID: string = this.ytURL.toString().split(urlElements.httpPlayList).pop()?.trim()!;
                
                const CONFIG = {
                    GOOGLE_API_KEY: process.env.YT_TOKEN, // require
                    PLAYLIST_ITEM_KEY: ['publishedAt', 'title', 'description', 'videoId', 'videoUrl'], // option
                  }
    
                const PS = new PLAYLIST(CONFIG)
             
                PS.getPlaylistItems(PLAY_LIST_ID)
                .then((result: any) => {
    
                for (let i = 0; i < result.items.length; i++) {
                    var videoInfo = result.items[i];
                    this.playListTitleUrl.set(videoInfo.title, videoInfo.videoUrl);
                }
    
                if (this.playListTitleUrl.size != 0) {
                    this.showPlayList();
                   this.playList(this.counterYtList);
                } else {
                    // Error mensaje playList empty
                    this.message.channel.send(errorMessages.PlayListEmptyError);
                }
    
              })
              .catch((error: any) => {
                this.message.channel.send(errorMessages.noProcessUrlMusic);
              })
    
            } else {
                this.playSingleSong();
            }
        } catch (error) {
            this.message.channel.send(errorMessages.noProcessUrlMusic);
        }
    }

    showPlayList(){
        var titleList: string = textElements.list;
        for (var [key, value] of this.playListTitleUrl) {
            titleList += textElements.pointList + key + "\n";
          }
          titleList += textElements.list;
        this.showMessageEmbebed(textElements.ListMusicYT, 0xff0000, titleList);
    }

    showMessageEmbebed(titleParam: string, colorParam: ColorResolvable, descriptionParam: string){
        const embed = new MessageEmbed()
            // Set the title of the field
            .setTitle(textElements.bold + titleParam + textElements.bold)
            // Set the color of the embed
            .setColor(colorParam)
            // Set the main content of the embed
            .setDescription(textElements.boldCursive + descriptionParam + textElements.boldCursive);
            // Send the embed to the same channel as the message
            this.message.channel.send(embed);
    }

    async playSingleSong(){
        const PLAY_LIST_ID: string = this.ytURL.toString().split(urlElements.httpPlaySingleSong).pop()?.trim()!;
        let info = await ytdl.getInfo(PLAY_LIST_ID)
        .then((info) => {
            const format = ytdl.chooseFormat(info.formats, { quality: [128,127,120,96,95,94,93] });
            this.dispatcher = this.connection.play(format.url);
            this.showTitleSongWithURL();
        })
        .catch(() => {
            this.dispatcher = this.connection.play(ytdl(this.ytURL, {filter: 'audioonly'}));
            // Show actual song
            this.showTitleSongWithURL();
        }); 
    }

    showTitleSongWithURL(){
        const PLAY_LIST_ID: string = this.ytURL.toString().split(urlElements.httpPlaySingleSong).pop()?.trim()!;
        var tempMessage: Message = this.message;
        GET_YOUTUBLE_TITLE_VIDEO(PLAY_LIST_ID, function (error: string, title: string) {
            const embed = new MessageEmbed()
            // Set the title of the field
            .setTitle(textElements.bold + textElements.musicNow + textElements.bold)
            // Set the color of the embed
            .setColor(0xff0000)
            // Set the main content of the embed
            .setDescription(textElements.boldCursive + title + textElements.boldCursive);
            // Send the embed to the same channel as the message
            tempMessage.channel.send(embed);
        });
    }
    
    
    playList(counter: any){
        var videoName = Array.from(this.playListTitleUrl.keys())[counter];
        this.showMessageEmbebed(textElements.musicNow, 0xff0000, videoName);
        var url: string = this.playListTitleUrl.get(videoName)!;
        this.playSongWithUrl(url);
    }

    playSongWithUrl(url: string){
        this.dispatcher = this.connection.play(ytdl(url, {filter: 'audioonly'}));
        // Show actual Song

        this.dispatcher = this.connection.dispatcher.on('finish', () => {
            this.counterYtList += 1;
            if (this.counterYtList < this.playListTitleUrl.size) {
                this.playList(this.counterYtList); 
            }else{
                // PlayList finished
            }
        });
    }
}

