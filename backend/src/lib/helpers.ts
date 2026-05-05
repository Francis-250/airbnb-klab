import bcrypt from "bcryptjs";
import cloudinary from "./cloudinary";

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const uploadAvatar = (buffer: Buffer) =>
  new Promise<string>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "airbnb/avatars" }, (err, res) =>
        err || !res ? reject(err) : resolve(res.secure_url),
      )
      .end(buffer);
  });

export const deleteAvatar = async (url: string) => {
  const publicIdWithVersion = url.split("airbnb/avatars/")[1];
  const publicId = publicIdWithVersion.substring(
    publicIdWithVersion.indexOf("/") + 1,
    publicIdWithVersion.lastIndexOf("."),
  );
  await cloudinary.uploader.destroy("airbnb/avatars/" + publicId);
};

export const uploadListingPhotos = (files: Express.Multer.File[]) => {
  const promises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "airbnb/listings" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      uploadStream.end(file.buffer);
    });
  });
  return Promise.all(promises);
};

export const deleteListingPhoto = (publicId: string) => {
  return cloudinary.uploader.destroy(publicId);
};
