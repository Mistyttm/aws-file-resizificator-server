import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

/* Check file has valid video extension type */ 
const isVideo = function (req: any, file: Express.Multer.File, cb: any) {
    const validExtensions = ['.mp4', '.mov', '.avi', '.mkv'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (validExtensions.includes(fileExtension)) {
        cb(null, true);
        } else { // If the file extension was invalid
        cb(false);
    }
}; 

const upload = multer({storage: storage, fileFilter: isVideo});

export default upload;