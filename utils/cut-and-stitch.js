const ffmpeg = require('fluent-ffmpeg');
const pathToFfmpeg = require('ffmpeg-static');
const ffprobe = require('ffprobe-static');


function getDownloadsDir(baseDir){
    return baseDir + 'downloads/';
}

function getProcessingDir(baseDir){
    return baseDir + 'processing/';
}


function parseTime(timeStr) {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

function getDuration(start, end){
    return parseTime(end) - parseTime(start);
}

// **Function to process a single video segment**
function cutSegment(video, outputIndex, baseOutDir) {
    return new Promise((resolve, reject) => {
        let command = ffmpeg(getDownloadsDir(baseOutDir)+video.downloadedVideoTitle+".mp4")
            .setFfmpegPath(pathToFfmpeg)
            .setFfprobePath(ffprobe.path);
            if (video.timestamps.end != "-1"){
                command
                .setStartTime(video.timestamps.start)
                .setDuration(getDuration(video.timestamps.start, video.timestamps.end));
            }
            command.output(`${getProcessingDir(baseOutDir)}temp_segment_${outputIndex}.mp4`)
            .size('1280x720')
            .autoPad()
            .withVideoCodec('libx264')
            .withAudioCodec('aac')
            .on('end', resolve)
            .on('error', reject)
            .run();
    });
}

// **Main processing logic**
async function stitchVideos(inputVideos, baseOutDir) {
    try {
        // Process video segments in parallel
        const segmentPromises = inputVideos.map((video, index) => (
            cutSegment(video, index, baseOutDir)
        ));
        await Promise.all(segmentPromises);

        console.log("Segments created!")
        // Merge temp segments
        let mergeCommand = ffmpeg();
        for (let i = 0; i < inputVideos.length; i++) {
            mergeCommand = 
                mergeCommand.input(`${getProcessingDir(baseOutDir)}temp_segment_${i}.mp4`);
        }
        mergeCommand
            .complexFilter({
                filter: 'volume',  
                options: '1.4'  // Multiplies the volume by 1.4    
            })
            .mergeToFile(baseOutDir+"final.mp4")
            .on('end', () => {
                console.log('Videos stitched successfully!');
            })
            .on('error', (err) => {
                console.error('Error during stitching:', err);
            });
    } catch (err) {
        console.error('Error:', err);
    }
}

module.exports = {stitchVideos}