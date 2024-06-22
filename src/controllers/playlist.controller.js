import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import apiError, { ApiError } from "../utils/ApiError.js"
import apiResponse, { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const owner = req.user?._id
    //TODO: create playlist
    try {
        if (!name && !description) {
            throw new apiError(400, "name and description are mandatory!")
        }
        const newPlaylist = await Playlist.create({
            name: name,
            description: description,
            owner: owner
        })
        return res
            .status(200)
            .json(new apiResponse(400, newPlaylist, "Playlist created successfully!"))
    } catch (error) {
        throw new apiError(400, error.message || "Unable to create playlist!")
    }
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
    try {
        const playlistToFind = await Playlist.find({ owner: playlistId })
        if (!playlistToFind) {
            throw new apiError(400, "Playlist doe not exists!")
        }
        return res
            .status(200)
            .json(new apiResponse(200, playlistToFind, "Playlist fetched successfully!"))
    } catch (error) {
        throw new apiError(400, error.message || "Unable to fetch the requested playlist!")
    }
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    const addToPlaylist = await Playlist.findById(playlistId)
    try {
        if (!addToPlaylist) {
            throw new apiError(400, "No playlist found!")
        }
        if (addToPlaylist.videos.includes(videoId)) {
            throw new apiError(400, "Video already exists in the playlist!")
        }
        addToPlaylist.videos.push(videoId)
        await addToPlaylist.save()
        return res
            .status(200)
            .json(new apiResponse(200, addToPlaylist, "Video added to the playlist successfully!"))
    } catch (error) {
        throw new apiError(500, error.message || "Failed to add video to the playlist!")
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist
    const removeFromPlaylist = await Playlist.findById(playlistId)
    try {
        if (!removeFromPlaylist) {
            throw new apiError(400, "No playlist found!")
        }
        if (!removeFromPlaylist.videos.includes(videoId)) {
            throw new apiError(400, "Video does not exists in the playlist!")
        }
        removeFromPlaylist.videos.pop(videoId)
        await removeFromPlaylist.save()
        return res
            .status(200)
            .json(new apiResponse(200, removeFromPlaylist, "Video removed from the playlist successfully!"))
    } catch (error) {
        throw new apiError(500, error.message || "Failed to remove video from the playlist!")
    }
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    const playlistToDelete = await Playlist.findById(playlistId)
    if (!playlistToDelete) {
        throw new apiError(400, "No playlist found!")
    }
    try {
        await Playlist.findByIdAndDelete(playlistId)
        return res
            .status(20)
            .json(new apiResponse(20, {}, "Playlist deleted successfully!"))
    } catch (error) {
        throw new ApiError(500, error?.message || "Failed to delete playlist!");
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
    const playlistToUpdate = await Playlist.findById(playlistId)
    if (!playlistToUpdate) {
        throw new apiError(400, "No playlist found!")
    }
    try {
        await Playlist.findByIdAndUpdate(
            playlistId,
            { name: name, description: description },
            { new: true }
        )
        return res
            .status(20)
            .json(new apiResponse(20, {}, "Playlist updated successfully!"))
    } catch (error) {
        throw new ApiError(500, error?.message || "Failed to update playlist!");
    }
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}