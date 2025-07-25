import adminApi from '@/lib/axios/adminAxios';

export const getAllBooking = async (
  page: number,
  limit: number,
  packageQuery?: string,
  status?: string,
  startDate?: string,
  endDate?: string
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (packageQuery) params.append('package', packageQuery);
  if (status) params.append('status', status);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await adminApi.get(`/booking?${params.toString()}`);
  return response.data;
};

export const getBookingById = async (id: string) => {
  const response = await adminApi.get(`/booking/${id}`);
  return response.data;
};

export const cancelBooking = async (id: string, reason: string) => {
  const response = await adminApi.patch(`/booking/cancel/${id}`, { reason });
  return response.data;
};
