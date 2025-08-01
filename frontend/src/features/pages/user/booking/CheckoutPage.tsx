import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookingSchema, type BookingFormSchema } from '@/features/schemas/BookingSchema';
import {
  applyCoupon,
  createBookingWithWalletPayment,
  createBookingWithOnlinePayment,
  verifyRazorpayPayment,
  cancelUnpaidBooking,
} from '@/features/services/user/bookingService';
import { fetchPackgeById } from '@/features/services/user/PackageService';
import { getWalletBalance } from '@/features/services/user/walletService';
import { Card, CardContent } from '@/features/components/ui/Card';
import { Input } from '@/features/components/ui/Input';
import { Button } from '@/features/components/Button';
// import { RadioGroup, RadioGroupItem } from '@/features/components/ui/radio-group';
import { RadioGroup, RadioGroupItem } from '@//components/ui/radio-group';
import { Label } from '@/features/components/ui/Lable';
import { Separator } from '@/features/components/ui/separator';
import { CheckCircle, Plane, Plus, Minus, CreditCard, Wallet, Zap, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { IPackage } from '@/features/types/IPackage';
import { cn } from '@/lib/utils';
declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [isUsingWallet, setIsUsingWallet] = useState(true);
  const [isWalletApplied, setIsWalletApplied] = useState(false);

  const [walletUsed, setWalletUsed] = useState<number>(0);
  const [finalPayableAmount, setFinalPayableAmount] = useState<number>(0); // after applying wallet + coupon

  const [packageData, setPackageData] = useState<IPackage>();

  const [subtotal, setSubtotal] = useState(0);
  const [amountAfterDiscount, setAmountAfterDiscount] = useState(0);

  const paymentMethods = [
    {
      id: 'razorpay',
      label: 'Razorpay',
      description: 'Pay securely with card, UPI, or net banking',
      icon: CreditCard,
      color: 'from-blue-500 to-blue-600',
      recommended: true,
    },
    {
      id: 'wallet',
      label: 'Wallet Only',
      description: `₹${walletBalance.toLocaleString()} available`,
      icon: Wallet,
      color: 'from-green-500 to-green-600',
      disabled: walletBalance < amountAfterDiscount,
    },
    {
      id: 'wallet+razorpay',
      label: 'Wallet + Razorpay',
      description: 'Use wallet balance and pay the rest',
      icon: Zap,
      color: 'from-orange to-orange-dark',
      disabled: walletBalance <= 0,
    },
  ];

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const { balance } = await getWalletBalance();
        setWalletBalance(balance);
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
      }
    };

    fetchWallet();
  }, []);

  const handleCouponApply = async () => {
    try {
      const result = await applyCoupon(couponCode, packageData?.price!);
      setCouponDiscount(result.discount);

      setIsCouponApplied(true);
      setCouponError('');
    } catch (err: any) {
      setIsCouponApplied(false);
      setCouponError(err?.response?.data?.message || 'Invalid coupon');
    }
  };
  console.log(couponCode, couponDiscount, 'coupon in payment');
  useEffect(() => {
    const loadPackage = async () => {
      if (!id) {
        return;
      }
      try {
        const data = await fetchPackgeById(id);
        //   console.log(checkWishlist.result,'check')
        setPackageData(data);
      } catch (error) {
        console.error('Failed to fetch package details', error);
      }
    };
    loadPackage();
  }, [id]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BookingFormSchema>({
    resolver: zodResolver(BookingSchema),
    defaultValues: {
      packageId: id ?? '',
      travelDate: '',
      travelers: [{ fullName: '', age: 0, gender: 'male', id: '' }],
      contactDetails: {
        name: '',
        phone: '',
        alternatePhone: '',
        email: '',
      },
      couponCode: '',
      discount: 0,
      totalAmount: 0,
      walletAmountUsed: 0,
      amountPaid: 0,
      useWallet: true,
      paymentMethod: '',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'travelers' });
  const travelers = watch('travelers');
  //const paymentMethod = watch('paymentMethod');
  const selectedPaymentMethod = watch('paymentMethod');
  useEffect(() => {
    const basePrice = packageData?.price ?? 0;
    const travelerCount = travelers.length;
    const sub = basePrice * travelerCount;
    const discount = isCouponApplied ? couponDiscount : 0;
    const afterDiscount = sub - discount;

    // Get selected payment method from react-hook-form
    const selectedMethod = watch('paymentMethod');

    let walletAmountToUse = 0;

    if (selectedMethod === 'wallet') {
      // use wallet fully
      walletAmountToUse = Math.min(walletBalance, afterDiscount);
    } else if (selectedMethod === 'wallet+razorpay') {
      // use wallet partially and rest razorpay
      walletAmountToUse = Math.min(walletBalance, afterDiscount);
    } else {
      // razorpay only — do NOT use wallet
      walletAmountToUse = 0;
    }

    const amountToPay = afterDiscount - walletAmountToUse;

    setSubtotal(sub);
    setAmountAfterDiscount(afterDiscount);
    setWalletUsed(walletAmountToUse);
    setFinalPayableAmount(amountToPay);

    // Backend values
    setValue('totalAmount', sub);
    setValue('walletAmountUsed', walletAmountToUse);
    setValue('amountPaid', amountToPay);
    setValue('couponCode', couponCode);
    setValue('discount', couponDiscount);
  }, [
    packageData?.price,
    travelers.length,
    walletBalance,
    isUsingWallet,
    isCouponApplied,
    couponDiscount,
    setValue,
    watch('paymentMethod'),
  ]);

  const initiateRazorpayPayment = (
    razorpayOrder: any,
    booking: any,
    formData: BookingFormSchema
  ) => {
    console.log('razorpayOrder', razorpayOrder);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_ID_KEY,
      amount: razorpayOrder.amount.toString(),
      currency: razorpayOrder.currency,
      name: 'Travel Booking',
      description: 'Package booking payment',
      order_id: razorpayOrder.id,
      handler: async function (response: any) {
        const verified = await verifyRazorpayPayment(response);

        if (verified) {
          toast.success('Payment successful!');
          navigate(`/booking-success/${booking._id}`);
        } else {
          toast.error('Payment verification failed.');
        }
      },
      modal: {
        ondismiss: async () => {
          try {
            await cancelUnpaidBooking(booking._id);
            navigate(`/booking-failed/${booking.bookingCode}`);

            toast.info('Payment cancelled and booking marked as cancelled.');
          } catch (error) {
            console.error('Cancel booking failed', error);
            toast.error('Failed to cancel booking. Try again.');
          }
        },
      },
      prefill: {
        name: formData.contactDetails.name,
        email: formData.contactDetails.email,
        contact: formData.contactDetails.phone,
      },
      theme: { color: '#F97316' },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePayment = async (formData: BookingFormSchema) => {
    try {
      if (formData.paymentMethod === 'wallet') {
        setIsWalletApplied(true); //  enable wallet deduction UI

        if (walletBalance >= finalPayableAmount) {
          const res = await createBookingWithWalletPayment({
            ...formData,
            useWallet: true,
          });

          navigate(`/booking-success/${res.booking._id}`);
        } else {
          toast.error('Insufficient wallet balance.');
        }
      } else if (
        formData.paymentMethod === 'razorpay' ||
        formData.paymentMethod === 'wallet+razorpay'
      ) {
        setIsWalletApplied(formData.paymentMethod === 'wallet+razorpay');

        const razorpayOrderData = await createBookingWithOnlinePayment({
          ...formData,
          useWallet: isUsingWallet,
          walletAmountUsed: walletUsed,
          amountPaid: finalPayableAmount,
        });

        const { booking, razorpayOrder } = razorpayOrderData;

        initiateRazorpayPayment(razorpayOrder, booking, formData);
      } else {
        toast.error('Select a valid payment method.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Payment failed.');
    }
  };

  // const onSubmit = (data: BookingFormSchema) => {
  //   console.log("Submitting...", data);
  // };
  return (
    <form onSubmit={handleSubmit(handlePayment, (err) => console.log('Validation errors:', err))}>
      <div className="min-h-screen bg-bg">
        <div className="bg-orange text-white py-10 shadow-md">
          <div className="max-w-6xl mx-auto px-4 flex items-center gap-6">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
              <Plane className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold">Complete Your Booking</h1>
              <p className="text-sm md:text-base text-white/90 mt-1">
                Just a few steps away from your dream vacation
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Name *" {...register('contactDetails.name')} />
                  {errors.contactDetails?.name && (
                    <p className="text-red-500 text-sm">{errors.contactDetails.name.message}</p>
                  )}

                  <Input placeholder="Email *" {...register('contactDetails.email')} />
                  {errors.contactDetails?.email && (
                    <p className="text-red-500 text-sm">{errors.contactDetails.email.message}</p>
                  )}

                  <Input placeholder="Phone *" {...register('contactDetails.phone')} />
                  {errors.contactDetails?.phone && (
                    <p className="text-red-500 text-sm">{errors.contactDetails.phone.message}</p>
                  )}

                  <Input
                    placeholder="Alternate Phone *"
                    {...register('contactDetails.alternatePhone')}
                  />
                  {errors.contactDetails?.alternatePhone && (
                    <p className="text-red-500 text-sm">
                      {errors.contactDetails.alternatePhone.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Traveler Details</h3>
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-4 p-4 border rounded-lg mb-4">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Traveler {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => remove(index)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Input
                          placeholder="Full Name *"
                          {...register(`travelers.${index}.fullName`)}
                        />
                        {errors.travelers?.[index]?.fullName && (
                          <p className="text-red-500 text-xs">
                            {errors.travelers[index]?.fullName?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Age *"
                          {...register(`travelers.${index}.age`, { valueAsNumber: true })}
                        />
                        {errors.travelers?.[index]?.age && (
                          <p className="text-red-500 text-xs">
                            {errors.travelers[index]?.age?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Input placeholder="ID *" {...register(`travelers.${index}.id`)} />
                        {errors.travelers?.[index]?.id && (
                          <p className="text-red-500 text-xs">
                            {errors.travelers[index]?.id?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <select
                          {...register(`travelers.${index}.gender`)}
                          className="border px-3 py-2 rounded text-sm"
                        >
                          <option value="">Select Gender *</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                        {errors.travelers?.[index]?.gender && (
                          <p className="text-red-500 text-xs">
                            {errors.travelers[index]?.gender?.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ fullName: '', age: 0, gender: 'male', id: '' })}
                  className="w-full text-orange border-orange hover:bg-orange hover:text-white"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Another Traveler
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Travel Date</h3>
                <Input
                  type="date"
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  {...register('travelDate')}
                  className="border-gray-300"
                />
                {errors.travelDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.travelDate.message}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Coupon Code</h3>
                <div className="flex gap-3">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                  />
                  <Button
                    type="button"
                    onClick={handleCouponApply}
                    variant="outline"
                    className="text-orange border-orange hover:bg-orange hover:text-white"
                  >
                    Apply
                  </Button>
                </div>
                {isCouponApplied && !couponError && (
                  <p className="text-green-600 text-sm mt-2">Coupon applied successfully!</p>
                )}
                {couponError && <p className="text-red-600 text-sm mt-2">{couponError}</p>}
              </CardContent>
            </Card>

            {/* 
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
         <Controller
  name="paymentMethod"
  control={control}
  rules={{ required: true }}
  render={({ field }) => (
    <RadioGroup
      value={field.value}
      onValueChange={field.onChange}
      className="space-y-3"
    >
      <div className="flex items-center space-x-3 border p-3 rounded-lg">
        <RadioGroupItem value="razorpay" id="razorpay_full" />
        <Label htmlFor="razorpay">Razorpay (Full Payment)</Label>
      </div>
      <div className="flex items-center space-x-3 border p-3 rounded-lg">
        <RadioGroupItem
          value="wallet"
          id="wallet_only"
          disabled={walletBalance < amountAfterDiscount}
        />
        <Label htmlFor="wallet_only">Wallet Only (₹{walletBalance})</Label>
      </div>
      <div className="flex items-center space-x-3 border p-3 rounded-lg">
        <RadioGroupItem value="wallet+razorpay" id="wallet_razorpay" />
        <Label htmlFor="wallet_razorpay">Wallet + Razorpay</Label>
      </div>
    </RadioGroup>
  )}
/>

                {errors.paymentMethod && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.paymentMethod.message}
                  </p>
                )}
              </CardContent>
            </Card> */}
            <Card className="shadow-travel">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2 font-poppins">
                    Payment Method
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Choose your preferred payment option
                  </p>
                </div>

                <Controller
                  name="paymentMethod"
                  control={control}
                  rules={{ required: 'Please select a payment method' }}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="space-y-4"
                    >
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="relative">
                          <Label
                            htmlFor={method.id}
                            className={cn(
                              'flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
                              field.value === method.id
                                ? 'border-orange bg-orange/5 shadow-md'
                                : 'border-border hover:border-orange/50 hover:bg-muted/30',
                              method.disabled && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            <RadioGroupItem
                              value={method.id}
                              id={method.id}
                              disabled={method.disabled}
                              className={cn(
                                'flex-shrink-0',
                                field.value === method.id && 'border-orange text-orange'
                              )}
                            />

                            <div
                              className={cn(
                                'w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0',
                                `bg-gradient-to-br ${method.color}`
                              )}
                            >
                              <method.icon className="w-6 h-6" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">
                                  {method.label}
                                </span>
                                {method.recommended && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange text-white rounded-full">
                                    <Check className="w-3 h-3" />
                                    Recommended
                                  </span>
                                )}
                                {method.disabled && (
                                  <span className="text-xs text-muted-foreground font-medium">
                                    Insufficient balance
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{method.description}</p>
                            </div>

                            {field.value === method.id && (
                              <div className="w-5 h-5 rounded-full bg-orange flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />

                {errors.paymentMethod && (
                  <p className="text-destructive text-sm mt-3 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-destructive"></span>
                    {errors.paymentMethod.message}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Package Price</span>
                    <span>₹{packageData?.price?.toLocaleString() ?? '0'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Travelers</span>
                    <span>× {travelers.length}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-medium">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>

                  {isCouponApplied && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount</span>
                      <span>-₹{couponDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  {(watch('paymentMethod') === 'wallet' ||
                    watch('paymentMethod') === 'wallet+razorpay') && (
                    <div className="flex justify-between">
                      <span>Wallet Used:</span>
                      <span>- ₹{walletUsed.toLocaleString()}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between font-bold text-lg text-orange-600">
                    <span>Total</span>
                    <span>₹{finalPayableAmount.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  // disabled={!selectedPaymentMethod}
                  className="mt-6 w-full gradient-orange text-white py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5 mr-2" /> Proceed to Pay
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CheckoutPage;
