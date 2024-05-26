const ytdl = require('ytdl-core');
const fs = require('fs');

// Function to determine the best quality format
function getHighestQualityFormat(formats) {
    let highestQualityFormat = null;
    for (const format of formats) {
        // Prioritize formats with both video and audio
        if (format.hasVideo && format.hasAudio) {
            if (!highestQualityFormat || format.qualityLabel > highestQualityFormat.qualityLabel)  {
                highestQualityFormat = format;
            }
        }
    }
    return highestQualityFormat;
}

async function downloadVideo(videoUrl, outputDIR, outputTitle = null) {
    return new Promise(async (resolve, reject) => {
        try {
            const videoInfo = await ytdl.getInfo(videoUrl);
    
            const bestFormat = getHighestQualityFormat(videoInfo.formats);
            console.log("Found best format " + bestFormat);
            if (!bestFormat) {
                throw new Error('No suitable format found');
            }
    
            const videoTitle = outputTitle !== null ? outputTitle : videoInfo.videoDetails.title.replace(/[<>:"\/\\|?*\x00-\x1F]/g, ''); // Clean filename
            const outputFilename = `${outputDIR}${videoTitle}.mp4` // Example filename
    
            const writeStream = fs.createWriteStream(outputFilename);
            ytdl(videoUrl, { format: bestFormat })
                .pipe(writeStream)
                .on('finish', () => {
                    console.log(`Video "${videoTitle}" downloaded in ${outputDIR} successfully!`);
                    resolve();
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

module.exports = {downloadVideo}