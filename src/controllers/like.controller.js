import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { response } from "express"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    try {
        const likedVideo = await Like.findOne({
            video: videoId,
            likedBy: req.user?._id
        })

        if (!likedVideo) {
            const likeVideo = await Like.create({
                video: videoId,
                likedBy: req.user?._id
            })
            return res
                .status(200)
                .json(new apiResponse(200, likeVideo, "Video liked!"))
        } else {
            const disLikeVideo = await Like.findOneAndDelete({
                video: videoId,
                likedBy: req.user?._id
            })
            return res
                .status(200)
                .json(new apiResponse(200, disLikeVideo, "Video disliked!"))
        }
    } catch (error) {
        throw new apiError(400, "failed to toggle like on video");
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment
    try {
        const likedComment = await Like.findOne({
            comment: commentId,
            likedBy: req.user?._id
        })

        if (!likedComment) {
            const likeComment = await Like.create({
                comment: commentId,
                likedBy: req.user?._id
            })
            return res
                .status(200)
                .json(new apiResponse(200, likeComment, "Comment liked!"))
        } else {
            const disLikeComment = await Like.findOneAndDelete({
                comment: commentId,
                likedBy: req.user?._id
            })
            return res
                .status(200)
                .json(new apiResponse(200, disLikeComment, "Comment disliked!"))
        }
    } catch (error) {
        throw new apiError(400, "failed to toggle like on comment");
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
    try {
        const likedTweet = await Like.findOne({
            tweet: tweetId,
            likedBy: req.user?._id
        })

        if (!likedTweet) {
            const likeTweet = await Like.create({
                tweet: tweetId,
                likedBy: req.user?._id
            })
            return res
                .status(200)
                .json(new apiResponse(200, likeTweet, "Tweet liked!"))
        } else {
            const disLikeTweet = await Like.findOneAndDelete({
                tweet: tweetId,
                likedBy: req.user?._id
            })
            return res
                .status(200)
                .json(new apiResponse(200, disLikeTweet, "Tweet disliked!"))
        }
    } catch (error) {
        throw new apiError(400, "failed to toggle like on tweet");
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    try {
        const likedVideos = await Like.aggregate([
            {
                $match: {
                    likedBy: req.user?._id
                }
            },
            {
                $lookup: {
                    from: "videoss",
                    localField: "video",
                    foreignField: "_id",
                    as: "likedVideo"
                }
            },
            {
                $project: {
                    _id: 0,
                    likedVideo: "$likedVideo",
                }
            },
            {
                $addFields: {
                    likedVideo: {
                        $first: "$likedVideo",
                    }
                }
            }
        ])
        return res
            .status(200)
            .json(new apiResponse(200, likedVideos, "All liked videos fetched successfully!"))
    } catch (error) {
        throw new apiError(400, "failed to fetch liked video");
    }
})
export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}