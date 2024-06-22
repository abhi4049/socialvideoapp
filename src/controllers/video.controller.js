import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import apiError, { ApiError } from "../utils/apiError.js"
import apiResponse, { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    try {
        const aggregateQuery = await Video.aggregate([
            {
                $match: {
                    $or: [
                        { title: { $regex: `^${query}`, $options: "i" } },
                        { description: { $regex: `^${query}`, $options: "i" } }
                    ],
                    owner: new mongoose.Types.ObjectId(userId)
                }
            }
        ])
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { [sortBy]: sortType == "desc" ? -1 : 1 },
            customLabels: { docs: "videos", totalDocs: "totalVideos" },
        };

        await Video.aggregatePaginate(
            aggregateQuery,
            options,
            function (error, result) {
                if (error) {
                    throw new ApiError(400, error?.message || "error while pagination!")
                } else {
                    return res
                        .status(200)
                        .json(
                            new ApiResponse(200, result, "All videos fetched successfully!")
                        )
                }
            }
        )
    } catch (error) {
        throw new ApiError(400, error?.message || "Unable to fetch all the videos!")
    }
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    try {
        // TASK: check whether the fields aren't empty
        if ([title, description].some((field) => field.trim() === "")) {
          throw new ApiError(400, "Fields should not be empty.")
        }
    
        // TASK: fetch the path of the files
        const videoPath = req.files?.videoFile[0].path
        const thumbnailPath = req.files?.thumbnail[0].path
    
        if (!(videoPath && thumbnailPath)) {
          throw new ApiError(400, "files are required!")
        }
    
        // TASK: upload on cloudinary, to get the file url
        const video = await uploadOnCloudinary(videoPath)
        const thumbnail = await uploadOnCloudinary(thumbnailPath)
    
        const { url: videoUrl, duration } = video
        const { url } = thumbnail;
        if (!(videoUrl && url)) {
          throw new ApiError(500, "upload didn't take place properly!")
        }
    
        // TASK: create a video object
        const videoDoc = await Video.create({
          videoFile: videoUrl,
          thumbnail: url,
          title: title,
          description: description,
          duration: duration,
          ownen: req.user?._id,
        })
    
        if (!videoDoc) {
          throw new ApiError(400, "The video doc wasn't created successfully!");
        }
        return res
          .status(200)
          .json(new ApiResponse(200, videoDoc, "Video uploaded successfully!"))
      } catch (error) {
        throw new ApiError(400, error?.message || "Couldn't publish the video.")
      }
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    try {
        const videoToFind = await Video.findById(videoId)
        if (!videoToFind) {
            throw new apiError(400, "No such video exists!")
        }
        return res
            .status(200)
            .json(new apiResponse(200, videoToFind, "Video fetched successfully!"))
    } catch (error) {
        throw new apiError(200, error.messgae | "Something went wrong while fetching the vidoe!")
    }
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    try {
        const thumbnailPath = req.file.path;
        if (!thumbnailPath) {
            throw new ApiError(400, "failed to fetch the local path.");
        }
        const videoToUpdate = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: { thumbnail: url }
            },
            { new: true }
        )

        return res
            .status(200)
            .json(new apiResponse(200, videoToUpdate, "Video updated successfully!"))
    } catch (error) {
        throw new apiError(200, error.messgae | "Something went wrong while updating the vidoe!")
    }
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        await Video.findByIdAndDelete(videoId)
        return res
            .status(200)
            .json(new apiResponse(200, {}, "Video deleted` successfully!"))
    } catch (error) {
        throw new apiError(200, error.messgae | "Something went wrong while deleting the vidoe!")
    }
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        // Fetch the video from the database
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        // Toggle the publish status
        video.isPublished = !video.isPublished;

        // Save the updated video back to the database
        await video.save();

        // Respond to the client
        res.status(200).json(new ApiResponse(200, {
            id: video._id,
            title: video.title,
            isPublished: video.isPublished
        }, "Publish status updated successfully"));
    } catch (error) {
        console.error('Error toggling publish status:', error);
        throw new ApiError(500, error.message || "Internal server error");
    }
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}