import fs from 'fs';

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