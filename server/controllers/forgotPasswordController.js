const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Register = require('../models/register');
const Login = require('../models/login');

// In-memory store for reset codes (code, email, expiry)
const resetCodes = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// POST /api/forgot-password — send reset code to email
exports.sendCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await Register.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    resetCodes.set(email, { code, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 min expiry

    await transporter.sendMail({
      from: `"NexusHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Code - NexusHub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #3b82f6;">NexusHub Password Reset</h2>
          <p>Your password reset code is:</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">
            ${code}
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `
    });

    res.json({ message: 'Reset code sent to your email' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/forgot-password/verify — verify code
exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    const stored = resetCodes.get(email);
    if (!stored) {
      return res.status(400).json({ error: 'No reset code found. Please request a new one.' });
    }
    if (Date.now() > stored.expiresAt) {
      resetCodes.delete(email);
      return res.status(400).json({ error: 'Reset code has expired. Please request a new one.' });
    }
    if (stored.code !== code) {
      return res.status(400).json({ error: 'Invalid code' });
    }

    res.json({ message: 'Code verified' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/forgot-password/reset — reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }

    const stored = resetCodes.get(email);
    if (!stored || Date.now() > stored.expiresAt || stored.code !== code) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in register table
    const user = await Register.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.update({ password: hashedPassword });

    // Update password in login table
    await Login.update({ password: hashedPassword }, { where: { reg_id: user.id } });

    // Clean up used code
    resetCodes.delete(email);

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
