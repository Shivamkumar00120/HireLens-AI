const express = require('express')

const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")

const authRouter= express.Router()



authRouter.post("/register", authController.registerUserController)

authRouter.post("/login",authController.LoginUserController)

authRouter.get("/logout",authController.logoutUserController)

/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details 
 * @access private
 */



authRouter.get("/get-me",authMiddleware.authUser,authController.getMeController)

module.exports=authRouter