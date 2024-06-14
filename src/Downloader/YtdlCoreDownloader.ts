import ytdl from 'ytdl-core';
import fs from 'fs';
import {IVideoDownloader} from './types';
import { IDownloadResponse } from './types';
import path from 'path';
import { IVideoSegment } from 'src/utils/IVideoSegment';
import { url } from 'inspector';

export class YtdlCoreDownloader implements IVideoDownloader{
    private downloadDir: string;

    constructor(downloadDir: string){
        this.downloadDir = downloadDir
    }

    // Helper function to download all videos
    public async downloadAllVideos(inputs: string[]): Promise<IDownloadResponse[]> {
        return Promise.all(inputs.map((input) => this.downloadVideo(input)));
    }


    public async downloadVideo(videoUrl: string): Promise<IDownloadResponse> {
        return new Promise(async (resolve, reject) => {
            try {
                const videoInfo = await ytdl.getInfo(videoUrl);
                const bestFormat = this.getHighestQualityFormat(videoInfo.formats);

                if (!bestFormat) {
                    throw new Error(`No suitable format found for ${videoUrl}`);
                }
                console.log(`Found best format for ${videoUrl}: ${bestFormat.qualityLabel}`);
                
                const outputTitle = this.getOutputFilename(videoUrl) + ".mp4";
                const outputFullPath = path.join(this.downloadDir, outputTitle);
        
                const writeStream = fs.createWriteStream(outputFullPath);

                ytdl(videoUrl, { format: bestFormat })
                    .pipe(writeStream)
                    .on('finish', () => {
                        console.log(`Video "${outputTitle}" downloaded in ${this.downloadDir} successfully!`);
                        resolve({
                            inputUrl: videoUrl,
                            outputFullPath: outputFullPath
                        });
                    })
                    .on('error', (err) => {
                        console.error('Error downloading video:', err);
                        reject();
                    });
            } catch (err) {
                console.error('Error:', err);
                reject();
            }
        });
    }

    public getOutputFilename(videoUrl: string): (string|null){
        const urlObj = new URL(videoUrl);
        const params = new URLSearchParams(urlObj.search);
        return params.get('v');
    }

    // Function to determine the best quality format
    private getHighestQualityFormat(formats: ytdl.videoFormat[]): ytdl.videoFormat | null{
        let highestQualityFormat = null;
        for (const format of formats) {
            // Prioritize formats with both video and audio
            if (format.hasVideo && format.hasAudio) {
                if (!highestQualityFormat || 
                    this.qualityLabelsSorted.indexOf(format.qualityLabel) > 
                    this.qualityLabelsSorted.indexOf(highestQualityFormat.qualityLabel))  {
                    highestQualityFormat = format;
                }
            }
        }
        return highestQualityFormat;
    }
    private qualityLabelsSorted = ['144p', '144p 15fps', '144p60 HDR', '240p', '240p60 HDR', '270p', '360p', '360p60 HDR'
    , '480p', '480p60 HDR', '720p', '720p60', '720p60 HDR', '1080p', '1080p60', '1080p60 HDR', '1440p'
    , '1440p60', '1440p60 HDR', '2160p', '2160p60', '2160p60 HDR', '4320p', '4320p60'];
};