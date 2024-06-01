import fs from 'fs';

export function getFormattedDate():string {
    // Create a new Date object representing the current date and time
    const today = new Date();

    // Get the year, month, and day from the Date object
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so we add 1
    const day = String(today.getDate()).padStart(2, '0');

    // Combine the year, month, and day into the desired format
    return `${year}_${month}_${day}`;
}

// Helper function to create directories
export function createDirectory(dir: string):void {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
}