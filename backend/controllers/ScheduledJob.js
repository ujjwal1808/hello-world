import cron from "node-cron";
import Post from '../models/post.model.js';

// Run every minute to check for posts ready to be published
// cron.schedule("* * * * *", async () => {
// 	try {
// 		const now = new Date();

// 		// Find posts that are scheduled to be published
// 		const postsToPublish = await Post.find({
// 			status: "scheduled",
// 			scheduledPostDate: { $lte: now },
// 		});

// 		// Update each post's status to "published"
// 		for (const post of postsToPublish) {
// 			post.status = "published";
// 			await post.save();
// 		}

// 		if (postsToPublish.length > 0) {
// 			console.log(`${postsToPublish.length} posts published at ${now}`);
// 		}
// 	} catch (error) {
// 		console.error("Error in scheduled publishing job:", error);
// 	}
// });


cron.schedule("*/1 * * * *", async () => {
  const now = new Date();

  // Find posts that are scheduled and need to be published
  const postsToPublish = await Post.find({
    status: "scheduled",
    scheduledPostDate: { $lte: now },
  });

  for (const post of postsToPublish) {
    post.status = "published";
    await post.save();
    console.log(`Post ${post._id} published.`);
  }
});
