import User from "../models/user.model.js";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

function generateOTP() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

async function sendEmail(email, otp, res) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_ID,
    to: email,
    subject: "Your Casa.ly Verification Code",
    text: `Dear User,
  
  Thank you for registering with Casa.ly. Your verification code is ${otp}.
  
  Please enter this code in the provided field to complete your registration.
  
  This Code is valid for only 15 minutes.

  If you did not request this code, please ignore this email or contact our support team.
  
  Best regards,
  The Casa.ly Team`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Dear User,</h2>
        <p>Thank you for registering with <strong>Casa.ly</strong>. Your verification code is:</p>
        <p style="font-size: 24px; font-weight: bold; color: #333;">${otp}</p>
        <p>Please enter this code in the provided field to complete your registration.</p>
        <p>If you did not request this code, please ignore this email or <a href="mailto:casa.ly.business@gmail.com">contact our support team</a>.</p>
        <br>
        <p>Best regards,<br>The Casa.ly Team</p>
        <footer style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eaeaea; font-size: 12px; color: #777;">
          <p>Casa.ly, Inc.</p>
        </footer>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
}

export const signUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (await User.findOne({ email: email })) {
      res.status(400).json({ success: false, message: "Email already exist" });
      return;
    }

    if (await User.findOne({ username: username })) {
      res
        .status(400)
        .json({ success: false, message: "Username already exist" });
      return;
    }

    const OTP = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedOTP = await bcrypt.hash(OTP, 10);

    const date = new Date();
    date.setMinutes(date.getMinutes() + 15);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      OTP: hashedOTP,
      OTP_exp: date,
    });
    await user.save();

    await sendEmail(email, OTP, res);

    res.status(201).json({
      success: true,
      message: "New user added",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { username } = req.body;

    const oldUser = await User.findOne({ username: username });

    if (!oldUser) {
      res
        .status(401)
        .json({ success: false, message: "Username doesn't exist" });
      return;
    }

    const OTP = generateOTP();
    const hashedOTP = await bcrypt.hash(OTP, 10);

    const date = new Date();
    date.setMinutes(date.getMinutes() + 15);

    const user = await User.findOneAndUpdate(
      { username: username },
      { OTP: hashedOTP, OTP_exp: date },
      { new: true }
    );

    await sendEmail(user.email, OTP, res);
    res.status(201).json({ success: true, message: "OTP resent" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Unable to resend OTP" });
  }
};

export const checkOTP = async (req, res) => {
  try {
    const { username, OTP } = req.body;

    const user = await User.findOne({ username: username });

    if (!user) {
      res
        .status(401)
        .json({ success: false, message: "Username doesn't exist" });
      return;
    }

    const currentDate = new Date();
    const otpExpiryDate = new Date(user.OTP_exp);

    if (currentDate > otpExpiryDate) {
      res.status(401).json({ success: false, message: "OTP expired" });
      return;
    }

    bcrypt.compare(OTP, user.OTP, async (err, result) => {
      if (result) {
        user.verified = true;
        await user.save();
        res.status(201).json({ success: true, message: "User verified" });
      } else {
        res.status(401).json({ success: false, message: "Incorrect OTP" });
      }
    });
  } catch (e) {
    console.log(e);
    res.status(401).json({ success: false, message: "Incorrect OTP" });
  }
};

export const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username });

    if (!user) {
      res
        .status(401)
        .json({ success: false, message: "Username doesn't exist" });
      return;
    }

    let isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ success: false, message: "Wrong Password" });
      return;
    }

    if (!user.verified) {
      res.status(401).json({
        success: false,
        message: "Verification pending",
        OTPRequired: true,
      });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "Logged in", token: "token" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { username, newPassword, OTP } = req.body;

    const user = await User.findOne({ username: username });

    if (!user) {
      res
        .status(401)
        .json({ success: false, message: "Username doesn't exist" });
      return;
    }

    const currentDate = new Date();
    const otpExpiryDate = new Date(user.OTP_exp);

    if (currentDate > otpExpiryDate) {
      res.status(401).json({ success: false, message: "OTP expired" });
      return;
    }

    const verified = await bcrypt.compare(OTP, user.OTP);

    if (verified) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.verified = true;
      await user.save();
      res
      .status(200)
      .json({ success: true, message: "Password Changed"});
    } else {
      res.status(401).json({ success: false, message: "Incorrect OTP" });
    }

  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
