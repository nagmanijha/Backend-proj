import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export {registerUser}
