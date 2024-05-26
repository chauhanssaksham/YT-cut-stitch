const ffmpeg = require('fluent-ffmpeg');
const pathToFfmpeg = require('ffmpeg-static');
const ffprobe = require('ffprobe-static');
const ytdl = require('ytdl-core');
const fs = require('fs');
const { randomUUID } = require('crypto');
const { downloadVideo } = require('./utils/download.js'); 
const { stitchVideos } = require('./utils/cut-and-stitch.js'); 

const OUT_DIR = `./outputs/${Date.now()}/`;
const FINAL_OUT_DIR = `${OUT_DIR}final/`;

const inputList = [
    // put end = "-1" for full video
    [
        {
            YTUrl: "https://www.youtube.com/watch?v=EAiD0NIe87A",
            timestamps: [
                { start: "01:17:35", end: "01:40:00" }
            ]
        }
    ]
];

// Utility functions to get directories
function getDownloadsDir(baseDir) {
    return `${baseDir}downloads/`;
}

function getProcessingDir(baseDir) {
    return `${baseDir}processing/`;
}

// Main processing function
async function processVideos() {
    for (const [index, input] of inputList.entries()) {
        const currentVideoBaseDir = `${OUT_DIR}${index}/`;

        // Create necessary directories
        createDirectory(getDownloadsDir(currentVideoBaseDir));
        createDirectory(getProcessingDir(currentVideoBaseDir));

        // Assign unique titles to each video
        input.forEach(video => video.downloadedVideoTitle = randomUUID());

        // Download all videos
        await downloadAllVideos(input, getDownloadsDir(currentVideoBaseDir));
        console.log(`Downloaded videos for the ${index}th final video`);

        // Denormalize timestamps for stitching
        const denormalizedInput = denormalizeTimestamps(input);

        // Stitch videos together
        await stitchVideos(denormalizedInput, currentVideoBaseDir);
        console.log(`Stitched successfully in ${FINAL_OUT_DIR}${index}.mp4`);
    }
}

// Helper function to create directories
function createDirectory(dir) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
}

// Helper function to download all videos
async function downloadAllVideos(input, downloadDir) {
    const downloadPromises = input.map(video => 
        downloadVideo(video.YTUrl, downloadDir, video.downloadedVideoTitle)
    );
    await Promise.all(downloadPromises);
}

// Helper function to denormalize timestamps
function denormalizeTimestamps(input) {
    return input.flatMap(video => 
        video.timestamps.map(timestamp => ({
            ...video,
            timestamps: timestamp
        }))
    );
}

// Run the processing function
processVideos().catch(error => {
    console.error("An error occurred:", error);
});
