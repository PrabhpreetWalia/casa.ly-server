import express from 'express'
import { signUp, resendOTP, checkOTP, signIn, changePassword } from '../controllers/auth.controllers.js'

const router = express.Router()

router.post("/sign-up", signUp)

router.post("/resend-otp", resendOTP)

router.post("/check-otp", checkOTP)

router.post("/sign-in", signIn)

router.post("/change-password", changePassword)

export default router