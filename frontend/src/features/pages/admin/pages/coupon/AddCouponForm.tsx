import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { Input } from '@/features/components/ui/Input';
import { Label } from '@/features/components/ui/Lable';
import { Button } from '@/features/components/Button';
import { createCoupon } from '@/features/services/admin/couponService';

import { type CouponFormSchema, couponSchema } from '@/features/schemas/CouponFormSchema';

const AddCouponForm = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CouponFormSchema>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      type: 'percentage',
      discountValue: 0,
      expiryDate: new Date().toISOString(),
    },
  });

  const onSubmit = async (data: CouponFormSchema) => {
    try {
      await createCoupon(data);
      console.log('Submitted Code:', data.code);
      toast.success('Coupon created successfully');
      navigate('/admin/coupons');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create coupon');
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-xl mx-auto space-y-5 p-6 bg-white shadow rounded"
    >
      <h2 className="text-2xl font-semibold">Add Coupon</h2>

      <div>
        <Label htmlFor="code">Code</Label>
        <Input {...register('code')} />
        {errors.code && <p className="text-red-500 text-sm">{errors.code.message}</p>}
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <select {...register('type')} className="w-full border rounded px-3 py-2">
          <option value="percentage">Percentage</option>
          <option value="flat">Flat</option>
        </select>
      </div>

      <div>
        <Label htmlFor="discountValue">Discount Value</Label>
        <Input type="number" {...register('discountValue', { valueAsNumber: true })} />
        {errors.discountValue && (
          <p className="text-red-500 text-sm">{errors.discountValue.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="expiryDate">Expiry Date</Label>
        <Input type="date" {...register('expiryDate')} />
        {errors.expiryDate && <p className="text-red-500 text-sm">{errors.expiryDate.message}</p>}
      </div>

      <div>
        <Label htmlFor="minAmount">Minimum Amount </Label>
        <Input type="number" {...register('minAmount', { valueAsNumber: true })} />
        {errors.minAmount && <p className="text-red-500 text-sm">{errors.minAmount.message}</p>}
      </div>

      <div>
        <Label htmlFor="maxDiscountAmount">Max Discount Amount </Label>
        <Input type="number" {...register('maxDiscountAmount', { valueAsNumber: true })} />
        {errors.maxDiscountAmount && (
          <p className="text-red-500 text-sm">{errors.maxDiscountAmount.message}</p>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit">Submit</Button>
        <Button type="button" variant="outline" onClick={() => navigate('/admin/coupons')}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default AddCouponForm;
