const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

/**
 * @name registerUserController
 * @desc Register a new user, expects username, email, and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all the required fields"
            })
        }

        const isUserAlreadyExists = await userModel.findOne({
            $or: [{ username }, { email }]
        })

        if (isUserAlreadyExists) {
            return res.status(400).json({
                success: false,
                message: "Account already exists with email address or username"
            })
        }

        const hash = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            username,
            email,
            password: hash
        })

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, { httpOnly: true })

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Registration Error:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error during registration",
            error: error.message
        })
    }
}

/** 
 * @name LoginUserController
 * @desc login a user, expects email and password in the request body
 * @access public
*/
async function LoginUserController(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            })
        }

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            })
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, { httpOnly: true })

        return res.status(200).json({
            success: true,
            message: "User loggedIn Successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Login Error:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error during login"
        })
    }
}

/** 
 * @name logoutUserController
 * @desc Logout user, clears cookie, blacklists token
 * @access public
*/
async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token

        if (token) {
            await tokenBlacklistModel.create({ token })
        }

        res.clearCookie("token")

        return res.status(200).json({
            success: true,
            message: "User logged out successfully"
        })
    } catch (error) {
        console.error("Logout Error:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error during logout"
        })
    }
}

/** 
 * @name getMeController
 * @desc get the current logged in user details.
 * @access private
*/

async function getMeController(req,res){
    const user=await userModel.findById(req.user.id)

    res.status(200).json({
        message:"user detail fetched successfully.",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }

    })

}

module.exports = {
    registerUserController,
    LoginUserController,
    logoutUserController,
    getMeController
}
