// AUTH ROUTES
export const AUTH_ROUTES = {
  REFRESH_TOKEN: '/refresh-token',
  LOGIN: '/admin-login',
  FORGOT_PASSWORD: '/forgotPassword',
  FORGOT_PASSWORD_CHANGE: '/forgotPasswordChange',
  LOGOUT: '/logout',
};

// USER MANAGEMENT ROUTES
export const USER_MANAGEMENT_ROUTES = {
  GET_ALL_USERS: '/users',
  GET_SINGLE_USER: '/users/:userId',
  BLOCK_USER: '/users/:userId/block',
  UNBLOCK_USER: '/users/:userId/unblock',
};

// BANNER ROUTES
export const BANNER_ROUTES = {
  ADD: '/addBanner',
  GET_ALL: '/banners',
  BLOCK: '/banners/:bannerId/block',
  UNBLOCK: '/banners/:bannerId/unblock',
  DELETE: '/banners/:bannerId/delete',
};

// CATEGORY ROUTES
export const CATEGORY_ROUTES = {
  GET_ALL: '/categories',
  GET_ACTIVE: '/category/active',
  GET_BY_ID: '/category/:id',
  ADD: '/addCategory',
  EDIT: '/category/:id',
  BLOCK: '/category/:id/block',
  UNBLOCK: '/category/:id/unblock',
};

// PACKAGE ROUTES
export const PACKAGE_ROUTES = {
  GET_ALL: '/packages',
  GET_BY_ID: '/packages/:id',
  ADD: '/addPackage',
  EDIT: '/packages/:id/edit',
  BLOCK: '/packages/:id/block',
  UNBLOCK: '/packages/:id/unblock',
};

// COUPON ROUTES
export const COUPON_ROUTES = {
  GET_ALL: '/coupons',
  ADD: '/coupon/add',
  GET_BY_ID: '/coupon/:id',
  EDIT: '/coupon/edit/:id',
  STATUS: '/coupon/status/:id',
  DELETE: '/coupon/delete/:id',
};

// BOOKING ROUTES
export const BOOKING_ROUTES = {
  GET_ALL: '/booking',
  GET_BY_ID: '/booking/:id',
  CANCEL: '/booking/cancel/:id',
};

// BLOG ROUTES
export const BLOG_ROUTES = {
  GET_ALL: '/blogs',
  GET_BY_ID: '/blog/:blogId',
  DELETE: '/blog/:blogId',
  STATUS: '/blog/status/:blogId',
};
