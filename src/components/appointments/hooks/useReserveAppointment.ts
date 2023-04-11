import { UseMutateFunction, useMutation, useQueryClient } from 'react-query';

import { Appointment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from '../../user/hooks/useUser';

// for when we need functions for useMutation
async function setAppointmentUser(
  appointment: Appointment,
  userId: number | undefined,
): Promise<void> {
  if (!userId) return;
  const patchOp = appointment.userId ? 'replace' : 'add';
  const patchData = [{ op: patchOp, path: '/userId', value: userId }];
  await axiosInstance.patch(`/appointment/${appointment.id}`, {
    data: patchData,
  });
}

// TS : returning mutate function
// Type for returning mutate function from custom hook
// UseMutateFunction<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>
// TData : 변이함수 자체에서 반환된 Data 유형 (여기에선 데이터 반환하지 않으므로 void)
// TError : 발생할 것으로 예상되는 Error 유형 (Error)
// TVariables : mutate function로 전달될 변수유형 (Appointment)
// TContext : 낙관적 업데이트 롤백을 위해 onMutate 에 설정하는 유형 (Appointment)

// AppointmentMutationFunction 를 반환 : 캘린더가 예약으로 MutationFunction 을 실행하고, 사용자가 예약할 수 있도록 Appointment를 업데이트할 수 있음.
// TS<TData, TError, TVariables, TContext>
// TS<void, unknown, Appointment, unknown>
export function useReserveAppointment(): UseMutateFunction<
  void,
  unknown,
  Appointment,
  unknown
> {
  const { user } = useUser();
  const toast = useCustomToast();
  const queryClient = useQueryClient();

  // TODO: replace with mutate function
  // useMutation : 캐시에 있는 쿼리와 관련 없음.
  const { mutate } = useMutation(
    (appointment: Appointment) => setAppointmentUser(appointment, user?.id),
    {
      // 쿼리를 무효화하는 함수 실행
      onSuccess: () => {
        // 1) 접두사로 queryKeys 상수와 Appointments 속성이 있는 쿼리를 무효화
        // => 예약한 내용이 캘린더에는 즉시 표시
        // => (but 목록에는 새로고침해야 추가됨)
        queryClient.invalidateQueries([queryKeys.appointments]);
        // 사용자에게 피드백을 주기 위해
        toast({
          title: 'You have reserved the appointment !',
          status: 'success',
        });
      },
    },
  );

  return mutate;
}

// 커스텀 변이 훅
