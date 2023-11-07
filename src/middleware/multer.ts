import multer from "multer";
import path from "path";

/* Upload files to disk storage */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

/* Check file has valid video extension type */ 
const fileFilter = function (req: any, file: Express.Multer.File, cb: any) {
    const validExtensions = ['.mp4', '.mov', '.avi', '.mkv'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    cb(null, validExtensions.includes(fileExtension));
}; 

const upload = multer({ storage: storage, fileFilter: fileFilter });

export default upload;