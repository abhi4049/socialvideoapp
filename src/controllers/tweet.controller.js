import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import apiError, { ApiError } from "../utils/ApiError.js"
import apiResponse, { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    const user = req.user
    try {
       const tweet = await Tweet.create(
           {
               owner: user._id,
               content: content
           }
       )
       return res
       .status(200)
       .json(new apiResponse(200, tweet, "Tweet created!"))
 } catch (error) {
    throw new apiError(400, error.message || "Something went wrong!")
 }
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.user._id
try {
        const userTweets = await Tweet.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId)
                }
            }
            
        ])
    return res
    .status(200)
    .json(new apiResponse(200, userTweets, "Tweets fetched successfully!"))
} catch (error) {
    throw new ApiResponse(200, error.message, "Unable to fetch Tweets!");
}
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body
    try{
        const updatedTweet = await Tweet.findByIdAndUpdate(
            tweetId,
            {$set: {content: content}},
            {new: true}
        )
        return res
        .status(200)
        .json(new apiResponse(200, updatedTweet, "Tweet updated successfully!"))
    } catch (error) {
        throw new apiError(500, error.message || "Something went wrong while updating tweet!")
    }
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    try{
        await Tweet.findByIdAndUpdate(tweetId)
        return res
        .status(200)
        .json(new apiResponse(200, {}, "Tweet deleted successfully!"))
    } catch (error) {
        throw new apiError(500, error.message || "Something went wrong while deleting tweet!")
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}