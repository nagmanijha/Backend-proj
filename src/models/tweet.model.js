import mongoose from "mongoose"

const tweetSchema = new mongoose.Schema({
    content: {
        required: true,
        type: String
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

},  {timestamps: true})

export const Tweet = mongoose.model("Tweet", tweetSchema)