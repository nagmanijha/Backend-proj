import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(userId) => 
{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return { accessToken, refreshToken }
    } catch(error){
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }

}

const registerUser = asyncHandler(async (req, res, next) => {
   // get user details from frontend
   // validation - not empty
   // check user already registered: username, email
   // check for images, check for avatar
   // upload them to cloudinary, avatar
   // create user object - create entry in db
   // remove password and refresh token field from response
   // check for user creation
   // return response
   
// console.log('headers:', req.headers);
// console.log('content-type:', req.headers['content-type']);
// console.log('req.body:', req.body);
// console.log('req.files:', req.files);
// console.log('req.file:', req.file);



   const {fullname, email, username, password} = req.body
   console.log('destructured:', { fullname, email, username, password, types: {
   fullname: typeof fullname,
   email: typeof email
}});

   console.log("email: ", email);
      console.log("Received data:", {fullname, email, username});
    // console.log(req.body);

//    if(fullname === ""){
//     throw new ApiError(400, "fullname is required")
//    } :<--- not good, have to do for all fields

// if(
//     [fullname, email, username, password].some(
//         (field) => field?.trim() === ""
//     )
// ) {
//     throw new ApiError(400, "All fields are required.")
// }

     if ([fullname, email, username, password].some((field) => !field || field.toString().trim() === "")) {
    throw new ApiError(400, "All fields are required.");
  }

  const existedUser= await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar File is Required")
    }
        let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)


    if(!avatar){
        throw new ApiError(500, "Unable to upload avatar image")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

   const createdUser =  await User.findById(user._id).select(
    "-password -refreshToken" // remove fileds that we dont need to select
   )

   if(!createdUser){
       throw new ApiError(500, "Unable to create user. Please try again later.")
   }

   return res.status(201).json(
     new ApiResponse(200, createdUser, "User has been created successfully")
   )

})


const loginUser = asyncHandler(async (req, res, next) => {

    const {email, username, password} = req.body

    if(!username && !email){
        throw new ApiError(400,"Username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(400, "User does not exist.")
    }

    const isPasswordValid = 
    await user.isPasswordMatch(password)

    if(! isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully."
        )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
                }
        },
        {
            new: true
        }
    )
    
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,
            null,
            "User logged out successfully."
        )
    )
})


const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Request")
    }

try {
        const decoded = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        if(!decoded){
            throw new ApiError(401, "Unauthorized Request")
        }
    
        const user = await User.findById(decoded?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401, "Invalid Refresh Token")
        }
    
           if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401, "Invalid Refresh Token")
        }
    
    
        const {accessToken, newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {   accessToken,
                    refreshToken: newrefreshToken
                },
                "Access token refreshed successfully."
            )
        )
} catch (error) {
    throw new ApiError(401, error?.message || "Unauthorized Request")
}
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken

}
