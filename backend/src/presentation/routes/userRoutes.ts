
import { Router } from "express";
import { upload } from "@presentation/middlewares/upload";

import { UserAuthUsecases } from "@domain/usecases/user/userAuthUseCases";
import { MongoUserRepository } from "@infrastructure/repositories/MongoUserRepository";
import { MongoOtpRepository } from "@infrastructure/repositories/MongoOtpRepository";
import {  userRefreshToken } from "@presentation/controllers/token/userRefreshToken";
import { UserAuthController } from "@presentation/controllers/user/UserAuthController";
import { userAuthMiddleware } from "@presentation/middlewares/userAuthMiddleware";
import { HomeUseCases } from "@domain/usecases/user/homeUseCases";
 import { HomeController } from "@presentation/controllers/user/homeController";
import { MongoBannerRepository } from "@infrastructure/repositories/MongoBannerRepository";
import { MongoPackageRepository } from "@infrastructure/repositories/MongoPackageRepository";

import { WishlistController } from "@presentation/controllers/user/wishlistController";
import { WishlistUseCases } from "@domain/usecases/user/wishlistUseCases";
import { MongoWishlistRepository } from "@infrastructure/repositories/MongoWishlistRepository";

import { CouponController } from "@presentation/controllers/user/couponController";
import { CouponUseCases } from "@domain/usecases/user/couponUseCases";
import { MongoCouponRepository } from "@infrastructure/repositories/MongoCouponRepository";
import { ProfileUseCases } from "@domain/usecases/user/profileUseCases";
import { ProfileController } from "@presentation/controllers/user/profileController";

import { WalletController } from "@presentation/controllers/user/walletController";
import { WalletUseCases } from "@domain/usecases/user/walletUseCases";
import { MongoWalletRepository } from "@infrastructure/repositories/MongoWalletRepository ";

import { MongoBookingRepository } from "@infrastructure/repositories/MongoBookingRepository";
import { BookingUseCases } from "@domain/usecases/user/bookingUseCases";
import { BookingController } from "@presentation/controllers/user/bookingController";
import { RazorpayService } from "@infrastructure/services/razorpay/razorpayService";

import { MongoBlogRepository } from "@infrastructure/repositories/MongoBlogRepository";
import { BlogUseCases } from "@domain/usecases/user/blogUseCases";
import { BlogController } from "@presentation/controllers/user/blogControllers";

const walletRepository=new MongoWalletRepository()
const walletUseCases=new WalletUseCases(walletRepository)
const walletController=new WalletController(walletUseCases)


const userRepository = new MongoUserRepository();
const otpRepository = new MongoOtpRepository();
const userAuthUseCases = new UserAuthUsecases(userRepository, otpRepository,walletRepository);
const userAuthController = new UserAuthController(userAuthUseCases);

const bannerRepository=new MongoBannerRepository()
const packageRepository=new MongoPackageRepository()
const homeUseCases=new HomeUseCases(packageRepository,bannerRepository)
 const homeController=new HomeController(homeUseCases)

 const wishlistRepository=new MongoWishlistRepository()
 const wishlistUseCases=new WishlistUseCases(wishlistRepository)
 const wishlistController=new WishlistController(wishlistUseCases)

const couponRepository=new MongoCouponRepository()
const couponUseCases=new CouponUseCases(couponRepository)
const couponController=new CouponController(couponUseCases)

const profileRepository=new MongoUserRepository()
const profileUseCases=new ProfileUseCases(profileRepository)
const profileController=new ProfileController(profileUseCases)

const bookingRepository=new MongoBookingRepository()
const razorpayService=new RazorpayService()
const bookingUseCases=new BookingUseCases(bookingRepository,walletRepository,razorpayService)
const bookingController=new BookingController(bookingUseCases)

const blogRepository=new MongoBlogRepository()
const blogUseCases=new BlogUseCases(blogRepository)
const blogController=new BlogController(blogUseCases)


const router = Router();

//auth routes
router.post('/refresh-token', userRefreshToken);
router.post('/pre-register', userAuthController.preRegister);
router.post('/register', userAuthController.register);
router.post("/resend-otp",  userAuthController.resendOtp);
router.post('/login', userAuthController.login);
router.post('/google-login',userAuthController.googleLogin)
router.post('/forgotPassword', userAuthController.forgotPassword);
router.post('/verify-otp', userAuthController.verifyOtpForForgotPassword);
router.post('/forgotPasswordChange', userAuthController.forgotPasswordChange);
router.post('/logout', userAuthController.userLogout);
router.post("/email/request-change", userAuthMiddleware, userAuthController.requestEmailChange);
router.post("/email/verify-change", userAuthMiddleware, userAuthController.verifyAndUpdateEmail);
router.post("/password/change", userAuthMiddleware, userAuthController.changePassword);



//
router.get('/home',homeController.getHome)
router.get('/packages',homeController.getActivePackage)
router.get('/packages/:id',homeController.getPackagesById)

//profileRoutes
router.get('/profile',userAuthMiddleware,profileController.getUserProfile)
router.put('/profile/update',userAuthMiddleware,profileController.updateUserProfile)
router.put('/profile/uploadProfileImage',userAuthMiddleware,upload.single('image'),profileController.updateProfileImage)
router.put('/profile/updateAddress',userAuthMiddleware,profileController.updateUserAddress)

//wishlist routes
router.get('/wishlist',userAuthMiddleware,wishlistController.getAllWishlist)
router.get('/wishlist/check',userAuthMiddleware, wishlistController.checkPackageInWishlist);
router.post('/wishlist/add',userAuthMiddleware,wishlistController.addToWishlist)
router.delete('/wishlist/delete',userAuthMiddleware,wishlistController.removeFromWishlist)

//coupon routes
router.get('/coupons',userAuthMiddleware,couponController.getActiveCoupons)
router.post('/coupon/apply',userAuthMiddleware,couponController.applyCoupon)

//wallet routes
router.get('/wallet',userAuthMiddleware,walletController.getUserWallet)
router.get('/wallet-balance',userAuthMiddleware,walletController.walletBalance)
router.post('/wallet/credit',userAuthMiddleware,walletController.creditWallet)
router.post('/wallet/debit',userAuthMiddleware,walletController.debitWallet)


// booking routes
router.get('/booking',userAuthMiddleware,bookingController.getUserBookings)
router.get('/booking/:id',userAuthMiddleware,bookingController.getBookingById)
router.patch('/booking/cancel/:id',userAuthMiddleware,bookingController.cancelBooking)

router.post('/booking/online',userAuthMiddleware,bookingController.createBookingWithOnlinePayment)
router.post('/booking/verify', userAuthMiddleware, bookingController.verifyRazorpayPayment);

router.patch("/payment-cancel/:id", userAuthMiddleware, bookingController.cancelUnpaidBooking);
router.post("/retry-payment/:id", userAuthMiddleware, bookingController.retryBookingPayment);

router.post('/booking/wallet',userAuthMiddleware,bookingController.createBookingWithWalletPayment)

//blog route


router.post('/blog/create', userAuthMiddleware, upload.array('images'), blogController.createBlog);
router.put('/blog/edit/:blogId', userAuthMiddleware, upload.array('images'), blogController.editBlog);
router.get('/blogs', blogController.getAllPublishedBlogs);
router.get('/blogs/user',userAuthMiddleware, blogController.getBlogByUser);
router.get('/blog/:slug', blogController.getBySlug);
router.get('/blog/slug/:slug', blogController.getBySlug);
router.delete('/blog/delete/:blogId', userAuthMiddleware, blogController.deleteBlog);
router.patch('/blog/like/:blogId', userAuthMiddleware, blogController.likeBlog);
router.patch('/blog/unlike/:blogId', userAuthMiddleware, blogController.unLikeBlog);
//router.post('/:blogId/comment', userAuthMiddleware, blogController.commentOnBlog);
//router.delete('/:blogId/comment/:commentId', userAuthMiddleware, blogController.deleteComment);
//router.post('/:blogId/comment/:commentId/reply', userAuthMiddleware, blogController.replyToComment);


export default router;
