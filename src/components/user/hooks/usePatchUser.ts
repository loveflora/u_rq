import jsonpatch from 'fast-json-patch';
import { UseMutateFunction, useMutation } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from './useUser';

// QueryClient 는 필요 X => useUser 훅으로 쿼리 캐시를 업데이트할 거라서

// for when we need a server function
async function patchUserOnServer(
  newData: User | null,
  originalData: User | null,
): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData),
    },
  );
  return data.user;
}

// TODO: update type to UseMutateFunction type
export function usePatchUser(): UseMutateFunction<
  User,
  unknown,
  User,
  unknown
> {
  const { user, updateUser } = useUser();
  const toast = useCustomToast();

  // useMutation 호출해서 mutate 함수를 구조분해
  // mutate 는 newUserData 를 인수로 받아, patchUserOnServer 로 전달 (useUser 훅에 있던 원본 사용자 데이터와 함께)
  const { mutate: patchUser } = useMutation(
    (newUserData: User) => patchUserOnServer(newUserData, user),
    {
      // 기존 사용자 데이터의 스냅샷
      // onMutate 함수는 onError 핸들러에 적용될 context 를 반환하기 때문 (onMutate returns context that is passed to onError)

      // 변이함수가 취한 것을 무엇이 됐든 가져오는 비동기 함수
      onMutate: async (newData: User | null) => {
        // cancel any outgoing queries for user data,
        // so old server data doesn't overwrite our optimistic update
        // snapshot of previous user value
        // optimistically update the cache with new value
        // return context object with snapshotted value
      },
      // 서버에서 받은 응답으로 -> 사용자를 업데이트
      // onSuccess 는 변이함수에서 반환된 모든 값을 인자로 받음
      onSuccess: (userData: User | null) => {
        // null 일 경우) 사용자 업데이트는 건너뛰고 toast 게시
        if (user) {
          updateUser(userData);
          // toast : 성공한 것을 알림
          toast({
            title: 'User updated!',
            status: 'success',
          });
        }
        // 변이함수에서 얻은 응답을 가져와서 updateUser에 전달
        // => updateUser 은 user 훅의 state 와 localStorage 에 저장된 user 를 update 하고 queryClient 캐시도 update
      },
    },
  );

  return patchUser;
}
