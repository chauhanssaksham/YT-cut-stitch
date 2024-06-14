export interface IVideoSegment{
    URL: string;
    timestamps: {
        start: string,
        end: string
    },
    downloadedVideoFilePath: string // "xyz/downloads/myRNcpS.mp4",
}