import { api } from '../lib/apiClient';

export type TrainerSchedule = {
  id: number;
  trainer_class_name: string;
  trainer_name: string;
  trainer_id?: number;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  location?: string;
  current_participants?: number;
  available_spots?: number;
  is_full?: boolean;
  is_cancelled?: boolean;
};

export type BookingStatus =
  | 'confirmed'
  | 'waitlisted'
  | 'cancelled'
  | 'attended'
  | 'no_show';

export type ScheduleBooking = {
  id: number;
  schedule: number;
  status: BookingStatus;
  schedule_info: {
    class_name: string;
    date: string;
    start_time: string;
    end_time: string;
    location?: string;
    trainer_id?: number;
    trainer_name: string;
  };
};

export type TrainerRating = {
  id: number;
  trainer: number;
  trainer_name?: string;
  rating: number;
  review?: string;
  created_at?: string;
};

/** Public class schedules for the tenant. */
export async function getPublicSchedules(): Promise<TrainerSchedule[]> {
  return api.get<TrainerSchedule[]>('/trainer/schedule/public/');
}

/** The authenticated member's class bookings. */
export async function getMyBookings(): Promise<ScheduleBooking[]> {
  return api.get<ScheduleBooking[]>('/trainer/booking/me/');
}

export async function bookClass(scheduleId: number): Promise<ScheduleBooking> {
  return api.post<ScheduleBooking>('/trainer/booking/', { schedule_id: scheduleId });
}

export async function cancelBooking(bookingId: number): Promise<void> {
  await api.delete(`/trainer/booking/${bookingId}/cancel/`);
}

/** The authenticated member's submitted trainer ratings. */
export async function getMyRatings(): Promise<TrainerRating[]> {
  return api.get<TrainerRating[]>('/trainer/rating/me/');
}

export async function rateTrainer(
  trainerId: number,
  rating: number,
  review: string,
): Promise<TrainerRating> {
  return api.post<TrainerRating>('/trainer/rate/', {
    trainer_id: trainerId,
    rating,
    review,
  });
}
