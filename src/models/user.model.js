import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"; //bearer token h, so whoever has jwt, is the owner
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        lowercase: true,
        required: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },

    fullname:{
        type: String,
        required: true,
        trim: true,
        index: true
    },

    avatar:{
        type: String,
        required: true
    },
    coverImage: {
        type:String
    },
    watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken: {
        type: String,
    }

},
{
    timestamps: true
});

userSchema.pre("save", async function (next){

    this.password = await bcrypt.hash(this.password, 10)
    // without if condition, it will change for every save!
    if(!this.isModified("password")){
        return next()
    }       
}) // encryption takes time, so async, cant use () => {}, it dont have this refernce

userSchema.methods.isPasswordMatch = async function (password) {
    return await bcrypt.compare(password, this.password); 
};

userSchema.methods.generateAccessToken = function(){
    jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);