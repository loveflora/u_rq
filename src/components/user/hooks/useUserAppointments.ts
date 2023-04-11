import dayjs from 'dayjs';
import { useQuery } from 'react-query';

import type { Appointment, User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useUser } from './useUser';

// for when we need a query function for useQuery
async function getUserAppointments(
  // user가 거짓일 때 null : 경쟁상태(Race condition)가 있거나 고려하지 못한 요소가 있을 때를 대비해 보수적으로 프로그래밍
  user: User | null,
): Promise<Appointment[] | null> {
  if (!user) return null;
  const { data } = await axiosInstance.get(`/user/${user.id}/appointments`, {
    headers: getJWTHeader(user),
  });
  return data.appointments;
}

export function useUserAppointments(): Appointment[] {
  const { user } = useUser();
  const fallback: Appointment[] = [];

  const { data: userAppointments = fallback } = useQuery(
    // 쿼리 키 update
    [queryKeys.appointments, queryKeys.user, user?.id],
    () => getUserAppointments(user),
    { enabled: !!user },
    // user (User type)  --- !user (boolean형 반댓값) --- !!user (boolean형 동일값)
  );

  return userAppointments;
}
