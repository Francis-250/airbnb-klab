import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import {
  comparePassword,
  deleteAvatar,
  hashPassword,
  uploadAvatar,
} from "../lib/helpers";
import crypto from "crypto";
import { sendEmail } from "../middleware/resend";
import { passwordResetEmail, welcomeEmail } from "../templates/mail.temp";

const isProduction = process.env.NODE_ENV === "production";

export const register = async (req: Request, res: Response) => {
  const { name, email, username, phone, role, bio, password } = req.body;
  const requestedRole = role === "host" ? "host" : "guest";

  if (!name || !email || !username || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, username and password are required" });
  }

  if (role && !["guest", "host"].includes(role)) {
    return res.status(400).json({ message: "Invalid account role" });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }, { username }],
      },
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const avatar = req.file ? await uploadAvatar(req.file.buffer) : undefined;

    const hashedpassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        phone,
        role: requestedRole,
        hostStatus: requestedRole === "host" ? "pending" : "approved",
        avatar,
        bio,
        password: hashedpassword,
      },
    });
    const isHost = requestedRole === "host";
    const message = isHost
      ? "Registration successful! Your host account is pending admin approval."
      : "Registration successful! You can now log in.";

    await sendEmail({
      to: email,
      subject: "Welcome to Airbnb!",
      html: welcomeEmail(user.name),
    });
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ message, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const user = await prisma.user.findFirst({
      where: { email },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 3600000,
    });
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        hostStatus: user.hostStatus,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: user },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        hostStatus: true,
        avatar: true,
        bio: true,
      },
    });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user: currentUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
  res.status(200).json({ message: "Logout successful" });
};

export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid current password" });
    }

    const hashedpassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedpassword },
    });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.user.update({
        where: { email },
        data: { resetToken: otp, resetTokenExpiry },
      });

      await sendEmail({
        to: email,
        subject: "Your Password Reset OTP",
        html: passwordResetEmail(otp),
      });
    }

    res.status(200).json({
      message: "If a user with that email exists, an OTP has been sent",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
        resetToken: otp,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    res.status(200).json({ message: "OTP verified", resetToken });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedpassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedpassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateAvatar = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!req.file) return res.status(400).json({ message: "No file provided" });

    if (user.avatar) await deleteAvatar(user.avatar);

    const avatar = await uploadAvatar(req.file.buffer);
    const updated = await prisma.user.update({
      where: { id: req.user },
      data: { avatar },
    });
    const { password: _, ...userWithoutPassword } = updated;
    res.status(201).json({
      message: "Avatar updated successfully",
      updated: userWithoutPassword,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUserAvatar = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.avatar)
      return res.status(400).json({ message: "No avatar to delete" });

    await deleteAvatar(user.avatar);
    const updated = await prisma.user.update({
      where: { id: req.user },
      data: { avatar: null },
    });
    const { password: _, ...userWithoutPassword } = updated;
    res.status(201).json({
      message: "Avatar updated successfully",
      updated: userWithoutPassword,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { name, username, phone, bio } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let newAvatarUrl = user.avatar;
    if (req.file) {
      if (user.avatar) {
        try {
          await deleteAvatar(user.avatar);
        } catch (error) {
          console.error(
            "Failed to delete old avatar, continuing with upload...",
            error,
          );
        }
      }
      newAvatarUrl = await uploadAvatar(req.file.buffer);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        username,
        phone,
        bio,
        avatar: newAvatarUrl,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
