import { AxiosResponse } from 'axios';
import { useQuery, useQueryClient } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import {
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from '../../../user-storage';

// 사용자 데이터를 얻기 위해 서버로 감
// getUser : 낙관적 업데이트 위해 상대적으로 오래 되었을 수 있는 데이터를 서버로부터 가져오는 쿼리
// 낙관적 업데이트 이후, 수동으로 취소할 수 있도록 설정해줘야 하는 쿼리함수
async function getUser(
  user: User | null,
  signal: AbortSignal,
  // AbortSignal : 범용적이기 때문에 import 할 필요도 없음
): Promise<User | null> {
  // 로그인한 유저가 없으면 : 서버에 가지 않고 null을 반환
  if (!user) return null;

  // 로그인한 유저가 있다면 : 서버로 이동 - 로그인한 사용자의 user.id 데이터를 가져옴.
  const { data }: AxiosResponse<{ user: User }> = await axiosInstance.get(
    `/user/${user.id}`,
    {
      // user.id 에 대한 데이터를 가져올 권한이 있는지 서버에서 확인하려면 JWTHeader 포함
      headers: getJWTHeader(user),
      signal,
    },
  );
  return data.user;
}

interface UseUser {
  user: User | null;
  updateUser: (user: User) => void;
  clearUser: () => void;
}

// useUser : localStorage와 query cache에서 사용자의 상태 유지
// useQuery 활용해서 기존 user 값을 사용 -> 서버에서 데이터 가져옴
export function useUser(): UseUser {
  // const [user, setUser] = useState<User | null>(getStoredUser());
  // queryClient 가져오고
  const queryClient = useQueryClient();
  // TODO: call useQuery to update user data from server
  // const { data: user } : 사용자의 데이터를 가져오는 곳 (데이터 값의 출처) - queryKeys에 대한 쿼리캐시의 값
  // useQuery
  const { data: user } = useQuery(
    // (쿼리키1, 쿼리함수2)
    queryKeys.user,
    //  받은 값은 user의 값을 업데이트하는데 사용됨. (기존 user 값을 이용해서 user값을 업데이트)
    // getUser 함수 얻기 위해 useQuer가 쿼리함수에 전달하는 인수로부터 구조분해

    ({ signal }) => getUser(user, signal),
    {
      initialData: getStoredUser,
      // onSuccess : 쿼리함수(반환된 데이터 가져옴)나 setQueryData(전달된 데이터 가져옴)에서 데이터 가져오는 함수
      // received : 1) 쿼리함수나 updateUser에서 받으면 user   2) clearUser에서 가져오면 null (null이라면 사용자 스토리지에 있던 사용자 정보 지우겠다)
      onSuccess: (received: User | null) => {
        if (!received) {
          clearStoredUser();
        } else {
          // 쿼리함수나 updateUser에서 받으면 -> 해당 값으로 localStorage 설정
          setStoredUser(received);
        }
      },
    },
  );

  // useAuth : 쿼리 캐시에 값을 설정 -> 그래야 useQuery 함수 실행할 때 사용할 값이 생김
  // meant to be called from useAuth - setQueryData 호출 (quertClient 필요)
  // updateUser : 사용자 데이터 가져와서 state 설정
  function updateUser(newUser: User): void {
    // // set user in state
    // setUser(newUser);

    // // update user in localStorage
    // setStoredUser(newUser);

    // pre-populate user profile in React Query client
    queryClient.setQueryData(queryKeys.user, newUser); // newUser로 전달된 데이터
    // 쿼리 캐시를 onSuccess 로 설정하게 되는데, useUser 훅에서 updateUser 함수를 호출하는 간접적인 방식으로 함.
  }

  // meant to be called from useAuth (로그아웃) - setQueryData 호출
  function clearUser() {
    // TODO: reset user to null in query cache => onSuccess를 trigger
    queryClient.setQueryData(queryKeys.user, null); // newUser로 전달된 데이터
    // 쿼리 키에 2가지(queryKeys.appointments, queryKeys.user)가 첫 항목으로 포함되어 있는 한, user?.id는 지정할 필요 X
    queryClient.removeQueries([queryKeys.appointments, queryKeys.user]); // 사용자가 로그아웃하면 사용자 예약 쿼리 데이터가 보이지 않음.
    // 결과 : 예약 누름과 동시에 => 캘린더에도 표시되고 + 목록에도 추가되고 !
  }

  return { user, updateUser, clearUser };
}

// useUser : local storage와 query cache에서 사용자 상태를 유지
// useAuth : 내부 함수를 서버와 통신
