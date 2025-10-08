import express from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import User from "../models/player.model.js";

const router = express.Router();


router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "No user found with that email." });
    }


    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 60 * 60 * 1000; // 1 hour

  
    user.resetPasswordToken = token;
    user.resetPasswordExpiry = expiry;
    await user.save();

    
    const resetLink = `http://localhost:5174/reset-password/${token}`;

    // Setup Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // or use your SMTP host
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: `"Your App Name" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family:sans-serif; line-height:1.6;">
          <h2>Password Reset Request</h2>
          <p>Hello ${user.name || ""},</p>
          <p>You requested a password reset. Click the link below to set a new password:</p>
          <a href="${resetLink}" 
             style="color:#f59e0b; text-decoration:none; font-weight:bold;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn’t request this, you can safely ignore this email.</p>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset link has been sent to your email." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

/**
 * POST /api/reset-password/:token
 * Step 2: Verify token and update password
 */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }, // not expired
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset link." });
    }

    // Hash password before saving (if your model doesn't auto-hash)
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

export default router;
