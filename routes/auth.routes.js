import express from 'express'
import { signUp, resendOTP, checkOTP } from '../controllers/auth.controllers.js'

const router = express.Router()

router.post("/sign-up", signUp)

router.post("/resend-otp", resendOTP)

router.post("/check-otp", checkOTP)

export default router