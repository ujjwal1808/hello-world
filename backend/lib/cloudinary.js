import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
	cloud_name: 'deu72p04q',
	api_key: 972978856739318,
	api_secret: 'D56Auu30QVKMhgIr4oo-TYOhhOA',
});

export default cloudinary;
