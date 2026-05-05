import { Router } from "express";
import {
  changePassword,
  deleteUserAvatar,
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  register,
  resetPassword,
  updateAvatar,
  updateProfile,
  verifyOtp,
} from "../controllers/auth.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import {
  forgotPasswordLimiter,
  loginLimiter,
  otpLimiter,
  registerLimiter,
} from "../middleware/ratelimiter";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - username
 *               - role
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               username: { type: string }
 *               phone: { type: string }
 *               password: { type: string, format: password }
 *               role: { type: string, enum: [host, guest] }
 *               avatar: { type: string, format: binary }
 *     responses:
 *       201: { description: User registered successfully }
 *       400: { description: Bad request }
 *       409: { description: Email already exists }
 */
router.post("/register", registerLimiter, upload.single("avatar"), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email: { type: string }
 *               password: { type: string, format: password }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post("/login", loginLimiter, login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     responses:
 *       200: { description: Current user data }
 *       401: { description: Unauthorized }
 */
router.get("/me", verifyToken, getCurrentUser);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200: { description: Logged out successfully }
 *       401: { description: Unauthorized }
 */
router.post("/logout", verifyToken, logout);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword: { type: string, format: password }
 *               newPassword: { type: string, format: password }
 *     responses:
 *       200: { description: Password changed successfully }
 *       400: { description: Invalid current password }
 *       401: { description: Unauthorized }
 */
router.post("/change-password", verifyToken, changePassword);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200: { description: Reset email sent if email exists }
 */
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token: { type: string }
 *               newPassword: { type: string, format: password }
 *     responses:
 *       200: { description: Password reset successful }
 *       400: { description: Invalid or expired token }
 */
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email: { type: string }
 *               otp: { type: string }
 *     responses:
 *       200: { description: OTP verified successfully }
 *       400: { description: Invalid OTP }
 */
router.post("/verify-otp", otpLimiter, verifyOtp);

/**
 * @swagger
 * /api/auth/avatar:
 *   put:
 *     summary: Update avatar
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar: { type: string, format: binary }
 *     responses:
 *       200: { description: Avatar updated successfully }
 *       401: { description: Unauthorized }
 */
router.put("/avatar", verifyToken, upload.single("avatar"), updateAvatar);

/**
 * @swagger
 * /api/auth/avatar:
 *   delete:
 *     summary: Delete avatar
 *     tags: [Auth]
 *     responses:
 *       200: { description: Avatar deleted successfully }
 *       401: { description: Unauthorized }
 */
router.delete("/avatar", verifyToken, deleteUserAvatar);

/**
 * @swagger
 * /api/auth/update-profile:
 *   patch:
 *     summary: Update profile
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               bio: { type: string }
 *               avatar: { type: string, format: binary }
 *     responses:
 *       200: { description: Profile updated successfully }
 *       401: { description: Unauthorized }
 */
router.patch(
  "/update-profile",
  verifyToken,
  upload.single("avatar"),
  updateProfile,
);

export default router;
