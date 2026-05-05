"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteListingPhoto = exports.uploadListingPhotos = exports.deleteAvatar = exports.uploadAvatar = exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const cloudinary_1 = __importDefault(require("./cloudinary"));
const hashPassword = async (password) => {
    const salt = await bcryptjs_1.default.genSalt(10);
    return await bcryptjs_1.default.hash(password, salt);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hashedPassword) => {
    return await bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
const uploadAvatar = (buffer) => new Promise((resolve, reject) => {
    cloudinary_1.default.uploader
        .upload_stream({ folder: "airbnb/avatars" }, (err, res) => err || !res ? reject(err) : resolve(res.secure_url))
        .end(buffer);
});
exports.uploadAvatar = uploadAvatar;
const deleteAvatar = async (url) => {
    const publicIdWithVersion = url.split("airbnb/avatars/")[1];
    const publicId = publicIdWithVersion.substring(publicIdWithVersion.indexOf("/") + 1, publicIdWithVersion.lastIndexOf("."));
    await cloudinary_1.default.uploader.destroy("airbnb/avatars/" + publicId);
};
exports.deleteAvatar = deleteAvatar;
const uploadListingPhotos = (files) => {
    const promises = files.map((file) => {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.default.uploader.upload_stream({ folder: "airbnb/listings" }, (error, result) => {
                if (error)
                    return reject(error);
                resolve(result);
            });
            uploadStream.end(file.buffer);
        });
    });
    return Promise.all(promises);
};
exports.uploadListingPhotos = uploadListingPhotos;
const deleteListingPhoto = (publicId) => {
    return cloudinary_1.default.uploader.destroy(publicId);
};
exports.deleteListingPhoto = deleteListingPhoto;
