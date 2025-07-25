import { IWishlist } from '@domain/entities/IWishlist';

export interface IWishlistRepository {
  getUserWishlist(userId: string, page: number, limit: number): Promise<IWishlist[]>;
  addToWishlist(userId: string, packageId: string): Promise<void>;
  checkPackageInWishlist(userId: string, packageId: string): Promise<boolean>;
  removeFromWishlist(userId: string, packageId: string): Promise<void>;
  countUserWishlist(userId: string): Promise<number>;
}
