import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
    try {
        userToFind = { subscriber: req.user?._id, channel: channelId }
        const isSubscribed = await Subscription.findOne(userToFind)
        if (!isSubscribed) {
            const subscribeTo = await Subscription.create(userToFind)
            return res
                .status(200)
                .json(new apiResponse, subscribeTo, "Channel subscribed!")
        } else {
            const unSubscribeTo = await Subscription.findByIdAndDelete(userToFind)
            return res
                .status(200)
                .json(new apiResponse, unSubscribeTo, "Channel unsubscribed!")
        }
    } catch (error) {
        throw new apiError(400, error?.message || "Something wnt wrong while toggling subscription!")
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    try {
        const channelSubscribers = await Subscription.aggregate([
            {
                $match: {
                    channel: channelId
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "subscribers",
                    foreignField: "_id",
                    as: "subscriber"
                }
            },
            {
                $unwind: "$subscriber"
            },
            {
                $project: {
                    "subscriber._id": 1,
                    "subscriber.username": 1
                }
            }
        ])
        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    channelSubscribers,
                    "Subscribers count fetched successfully."
                )
            )
    } catch (error) {
        throw new apiError(
            400,
            error?.message || "Something went wrong while fetching subscribers!"
        )
    }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    try {
        const subscribedChannels = await Subscription.aggregate([
            {
                $match: {
                    channel: subscriberId
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "channel",
                    foreignField: "_id",
                    as: "channel"
                }
            },
            {
                $unwind: "$channel"
            },
            {
                $project: {
                    "channel._id": 1,
                    "channel.username": 1
                }
            }
        ])
        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    subscribedChannels,
                    "Subscribed channellist fetched successfully."
                )
            )
    } catch (error) {
        throw new apiError(
            400,
            error?.message || "Something went wrong while fetching channellist!"
        )
    }
})

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels }