import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  // multer-storage-cloudinary's type definitions don't include Cloudinary's
  // actual upload params (folder, allowedFormats), even though Cloudinary
  // itself accepts them at runtime — this cast works around that gap in the
  // package's own types, not a gap in our code.
  params: {
    folder: "fullstack-blog-project",
    allowedFormats: ["jpg", "png"],
  } as Record<string, unknown>,
});

const upload = multer({ storage });

export default upload;
