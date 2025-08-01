import { ICoupon } from '@domain/entities/ICoupon';
import { MongoCouponRepository } from '@infrastructure/repositories/MongoCouponRepository';

export class CouponUseCases {
  constructor(private couponRepo: MongoCouponRepository) {}

  async createCoupon(coupon: ICoupon): Promise<ICoupon> {
    return this.couponRepo.createCoupon(coupon);
  }

  async editCoupon(id: string, couponData: Partial<ICoupon>): Promise<ICoupon | null> {
    return this.couponRepo.editCoupon(id, couponData);
  }

  async getAllCoupon(page: number, limit: number): Promise<{ coupons: ICoupon[]; total: number }> {
    return this.couponRepo.getAllCoupons(page, limit);
  }

  async getCouponById(id: string): Promise<ICoupon | null> {
    return this.couponRepo.getCouponById(id);
  }
  async getCouponByCode(code: string): Promise<ICoupon | null> {
    return this.couponRepo.getCouponByCode(code);
  }

  async updateCouponStatus(id: string, isActive: boolean): Promise<void> {
    return this.couponRepo.updateCouponStatus(id, isActive);
  }

  async deleteCoupon(id: string): Promise<void> {
    return this.couponRepo.deleteCoupon(id);
  }
}
