import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, required: true, default: false},
    OTP: { type: String, required: true },
    OTP_exp: { type: Date, require: true}
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema)

export default User