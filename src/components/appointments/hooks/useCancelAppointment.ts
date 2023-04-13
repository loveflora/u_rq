import { UseMutateFunction, useMutation, useQueryClient } from 'react-query';

import { Appointment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';

// import { UseMutateFunction, useMutation, useQueryClient } from 'react-query';
// UseMutateFunction : 타이핑 위해 필요
// useMutation : mutate 함수 전달하기 위해 호출할 훅
// useQueryClient : useMutation 호출 시, onSuccess 의 예약 쿼리를 무효화하기 위해 필요

// for when server call is needed
async function removeAppointmentUser(appointment: Appointment): Promise<void> {
  const patchData = [{ op: 'remove', path: '/userId' }];
  await axiosInstance.patch(`/appointment/${appointment.id}`, {
    data: patchData,
  });
}

// TODO: update return type
export function useCancelAppointment(): UseMutateFunction<
  void, // mutation function 은 void 를 반환하고,
  unknown, // 오류 유형은 unknown 임.
  Appointment, // 인수는 Appointment 유형임.
  unknown // onMutate 의 context 는 unknown (context 가 없기 때문. onMutate 함수를 실행하지 않음.)
> {
  const queryClient = useQueryClient();
  const toast = useCustomToast();

  // mutate : useCancelAppointment 훅 사용자에게 전달할 내용
  // => 그래야 예약을 취소하고 싶을 때 실행할 수 있음.
  const { mutate } = useMutation(
    // mutate 실행하면, appointment 인수를 전달 => removeAppointmentUser 에 전달
    // (appointment: Appointment) => removeAppointmentUser(appointment),
    removeAppointmentUser,
    {
      onSuccess: () => {
        // 1) queryKeys.appointments 로 시작하는 모든 쿼리키를 무효화 => 이번 달 예약과 사용자 예약이 포함됨.
        queryClient.invalidateQueries([queryKeys.appointments]);
        // 2) toast : 예약이 취소되었음을 확인
        toast({
          title: 'You have canceled the appointment !',
          status: 'warning',
        });
      },
    },
  );

  return mutate;
}
