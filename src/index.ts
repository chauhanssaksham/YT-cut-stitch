import { YtdlCoreDownloader } from './Downloader/YtdlCoreDownloader'; 
import { IVideoSegment } from './utils/IVideoSegment';
import path, { resolve } from 'path';
import { createDirectory, getFormattedDate } from './utils/functions';
import { FfmpegVideoProcessor } from './VideoProcessor/FfmpegVideoProcessor'

var input: IVideoSegment[] = [
    {
        URL: "https://www.youtube.com/watch?v=bMFiM7mcp7k",
        timestamps: { start: "00:01:00", end: "00:01:15" },
        downloadedVideoFilePath: null
    },
    // {
    //     URL: "https://www.youtube.com/watch?v=IG_pIvGW4qE",
    //     timestamps: { start: "00:01:00", end: "00:01:15" },
    //     downloadedVideoFilePath: null
    // },
    {
        URL: "https://www.youtube.com/watch?v=bMFiM7mcp7k",
        timestamps: { start: "00:00:30", end: "00:00:45" },
        downloadedVideoFilePath: null
    }
];

// Main processing function
async function processVideos(baseDir?: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {

            const BASE_DIR:string = baseDir ? baseDir 
                : path.join('.', 'outputs', getFormattedDate(), Date.now().toString());
            console.log("BaseDir = " + BASE_DIR);
            const DOWNLOADS_DIR: string = path.join(BASE_DIR, "downloads");
            const PROCESSING_DIR: string = path.join(BASE_DIR, "processing");
            // Create necessary directories
            createDirectory(DOWNLOADS_DIR);
            createDirectory(PROCESSING_DIR);

            const downloader = new YtdlCoreDownloader(BASE_DIR);
            // Download all videos
            input = await downloader.downloadAllVideos(input);
            console.log(`Downloaded all videos`);

            const processor = new FfmpegVideoProcessor(BASE_DIR);
            // Stitch videos together
            await processor.stitchVideos(input);
            console.log(`Stitched successfully in ${BASE_DIR}`);
            resolve();
        } catch (e){
            reject(e);
        }
    })
}

// Run the processing function
processVideos().then(() => {
    console.log("Finished!");
}).catch(error => {
    console.error("An error occurred:", error);
});