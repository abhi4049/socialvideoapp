import { asyncHandler } from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { response } from "express"

const registerUser = asyncHandler( async (req, res) => {
    // res.status(200).json({
    //     message: "chai aur code"
    // })

    // get user details from frontend (postman)
    // validation -not empty
    // check i fuser alreadu exists or not: check with username or email or both
    // check for images - avatar and cover image => if avaialble then upload to cloudinary
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response 

    const {fullName, email, username, password} = req.body
    // console.log(req.body)

    // if(fullName === ""){
    //     throw new apiError(400, "Fullname required!")
    // }
    if(
        [fullName, email, username, password].some((field) => field.trim() === "") 
    ){
        throw new apiError(400, "All fields are mandatory!")
    }

    const existingUser = await User.findOne({
        $or: [{username}, {email}]
    })
    if(existingUser){
        throw new apiError(409, "User with email or usenname already exists!")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new apiError(400, "Avatar file is required!")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new apiError(400, "Avatar file is required!")
    }

    const user = await  User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",   // use empty string if coverImage is not provided
        email,
        password, 
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    console.log(user)
    if(!createdUser){
        throw new apiError(500, "Something went wrong while registering the user!")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered successfully!")
    )
} )

export { registerUser}