import fs from 'fs';
//todo: rename this file something better

// Store encoded videos to request from filesRoute
export const encodedVideoUrl = {};

export async function removeFiles(filePath: string) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      } else {
        console.error('Error - File path not found.');
      }
  
    } catch (error) {
      console.error(error);
    }
  }