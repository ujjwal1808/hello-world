import mongoose from "mongoose";

export const connectDB = async () => {
	try {
		await mongoose.connect('mongodb+srv://hello:415361@cluster0.nsrmx.mongodb.net/HELLO-WORLD-MAIN');
		console.log('db Connect');
	} catch (error) {
		console.error(`Error connecting to MongoDB: ${error.message}`);
		process.exit(1);
	}
};
