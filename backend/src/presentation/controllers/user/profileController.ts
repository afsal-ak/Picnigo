import { Request, Response, NextFunction } from 'express';
import { ProfileUseCases } from '@application/usecases/user/profileUseCases';
import { getUserIdFromRequest } from '@shared/utils/getUserIdFromRequest';
import { IUser } from '@domain/entities/IUser';
import { uploadCloudinary } from '@infrastructure/services/cloudinary/cloudinaryService';
import { HttpStatus } from 'constants/HttpStatus/HttpStatus';

export class ProfileController {
  constructor(private profileUseCases: ProfileUseCases) { }

  getUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserIdFromRequest(req);
      const userProfile = await this.profileUseCases.getUserProfile(userId);

      res.status(HttpStatus.OK).json({
        userProfile,
        message: 'user profile fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  updateUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserIdFromRequest(req);
      const { profileData }: { profileData: Partial<IUser> } = req.body;
      console.log(profileData, 'profile data');
      const updatedProfile = await this.profileUseCases.updateUserProfile(userId, profileData);
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'User profile updated successfully',
        userProfile: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  };

  updateUserAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserIdFromRequest(req);
      const { address } = req.body;
      // console.log(address, 'adress data')
      const updatedAddress = await this.profileUseCases.updateUserAddress(userId, address);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'User address updated successfully',
        userProfile: updatedAddress,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfileImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserIdFromRequest(req);
      const imagePath = req.file?.path;
      if (!imagePath) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false, message: 'No file uploaded'
        });
        return;
      }

      const { url, public_id } = await uploadCloudinary(imagePath, 'profileImage');

      const profileImage = { url, public_id };

      const updatedUser = await this.profileUseCases.updateProfileImage(userId, profileImage);

      res.status(HttpStatus.CREATED).json({
        success: true,
        profileImage: updatedUser?.profileImage,
        message: 'Profile image uploaded successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
