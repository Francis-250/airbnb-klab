"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.deleteUserAvatar = exports.updateAvatar = exports.resetPassword = exports.verifyOtp = exports.forgotPassword = exports.changePassword = exports.logout = exports.getCurrentUser = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const helpers_1 = require("../lib/helpers");
const crypto_1 = __importDefault(require("crypto"));
const resend_1 = require("../middleware/resend");
const mail_temp_1 = require("../templates/mail.temp");
const isProduction = process.env.NODE_ENV === "production";
const register = async (req, res) => {
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
        const existingUser = await prisma_1.default.user.findFirst({
            where: {
                OR: [{ email }, { phone }, { username }],
            },
        });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const avatar = req.file ? await (0, helpers_1.uploadAvatar)(req.file.buffer) : undefined;
        const hashedpassword = await (0, helpers_1.hashPassword)(password);
        const user = await prisma_1.default.user.create({
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
        await (0, resend_1.sendEmail)({
            to: email,
            subject: "Welcome to Airbnb!",
            html: (0, mail_temp_1.welcomeEmail)(user.name),
        });
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({ message, user: userWithoutPassword });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    try {
        const user = await prisma_1.default.user.findFirst({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isMatch = await (0, helpers_1.comparePassword)(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 3600000,
        });
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                hostStatus: user.hostStatus,
            },
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.login = login;
const getCurrentUser = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const currentUser = await prisma_1.default.user.findUnique({
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
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getCurrentUser = getCurrentUser;
const logout = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    });
    res.status(200).json({ message: "Logout successful" });
};
exports.logout = logout;
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user;
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isMatch = await (0, helpers_1.comparePassword)(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid current password" });
        }
        const hashedpassword = await (0, helpers_1.hashPassword)(newPassword);
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { password: hashedpassword },
        });
        res.status(200).json({ message: "Password changed successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.changePassword = changePassword;
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (user) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
            await prisma_1.default.user.update({
                where: { email },
                data: { resetToken: otp, resetTokenExpiry },
            });
            await (0, resend_1.sendEmail)({
                to: email,
                subject: "Your Password Reset OTP",
                html: (0, mail_temp_1.passwordResetEmail)(otp),
            });
        }
        res.status(200).json({
            message: "If a user with that email exists, an OTP has been sent",
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.forgotPassword = forgotPassword;
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }
    try {
        const user = await prisma_1.default.user.findFirst({
            where: {
                email,
                resetToken: otp,
                resetTokenExpiry: { gt: new Date() },
            },
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry },
        });
        res.status(200).json({ message: "OTP verified", resetToken });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.verifyOtp = verifyOtp;
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const user = await prisma_1.default.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() },
            },
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        const hashedpassword = await (0, helpers_1.hashPassword)(newPassword);
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                password: hashedpassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        res.status(200).json({ message: "Password reset successful" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.resetPassword = resetPassword;
const updateAvatar = async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: req.user } });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (!req.file)
            return res.status(400).json({ message: "No file provided" });
        if (user.avatar)
            await (0, helpers_1.deleteAvatar)(user.avatar);
        const avatar = await (0, helpers_1.uploadAvatar)(req.file.buffer);
        const updated = await prisma_1.default.user.update({
            where: { id: req.user },
            data: { avatar },
        });
        const { password: _, ...userWithoutPassword } = updated;
        res.status(201).json({
            message: "Avatar updated successfully",
            updated: userWithoutPassword,
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateAvatar = updateAvatar;
const deleteUserAvatar = async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: req.user } });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (!user.avatar)
            return res.status(400).json({ message: "No avatar to delete" });
        await (0, helpers_1.deleteAvatar)(user.avatar);
        const updated = await prisma_1.default.user.update({
            where: { id: req.user },
            data: { avatar: null },
        });
        const { password: _, ...userWithoutPassword } = updated;
        res.status(201).json({
            message: "Avatar updated successfully",
            updated: userWithoutPassword,
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.deleteUserAvatar = deleteUserAvatar;
const updateProfile = async (req, res) => {
    const userId = req.user;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { name, username, phone, bio } = req.body;
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        let newAvatarUrl = user.avatar;
        if (req.file) {
            if (user.avatar) {
                try {
                    await (0, helpers_1.deleteAvatar)(user.avatar);
                }
                catch (error) {
                    console.error("Failed to delete old avatar, continuing with upload...", error);
                }
            }
            newAvatarUrl = await (0, helpers_1.uploadAvatar)(req.file.buffer);
        }
        const updatedUser = await prisma_1.default.user.update({
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
    }
    catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateProfile = updateProfile;
