import { IUser } from '../entities/IUser';

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findByUsername(username: string): Promise<IUser | null>;
  createUser(user: Partial<IUser>): Promise<IUser>;
  updateUserPassword(email: string, password: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  findAll(skip: number, limit: number): Promise<IUser[]>;
  countAll(): Promise<number>;
  updateUserStatus(id: string, isBlocked: boolean): Promise<void>;
  updateUserEmail(id: string, email: string): Promise<IUser | null>;
  changePassword(id: string, newPassword: string): Promise<IUser | null>;
  findUserByReferralCode(referredReferralCode: string): Promise<IUser | null>;

  updateUserProfile(id: string, profileData: Partial<IUser>): Promise<IUser | null>;
  updateUserProfile(id: string, addressData: Partial<IUser>): Promise<IUser | null>;
  updateProfileImage(
    id: string,
    profileImage: { url: string; public_id: string }
  ): Promise<IUser | null>;
  createCoverImage(
    id: string,
    coverImageImage: { url: string; public_id: string }
  ): Promise<IUser | null>;
  getUserProfile(id: string): Promise<IUser | null>;
}
