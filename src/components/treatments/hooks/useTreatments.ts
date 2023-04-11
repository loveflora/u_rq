import { useQuery, useQueryClient } from 'react-query';

import type { Treatment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
// import { useCustomToast } from '../../app/hooks/useCustomToast';

// for when we need a query function for useQuery
async function getTreatments(): Promise<Treatment[]> {
  const { data } = await axiosInstance.get('/treatments');
  return data;
}

export function useTreatments(): Treatment[] {
  // const toast = useCustomToast();

  // TODO: get data from server via useQuery
  const fallback = []; // server에서 시술 데이터를 받지 않고 캐시가 비어 있는 경우, 아무것도 표시되지 않도록 설정
  const { data = fallback } = useQuery(queryKeys.treatments, getTreatments);
  // useQuery 에 re-fetching 제한
  //   {
  //     // 1) staleTime 증가
  //     staleTime: 600000, // 10min
  //     // 2) cacheTime
  //     // 만료시간이 캐싱시간을 초과하면 안됨. (만료시간 < 캐싱시간)
  //     // 만료된 데이터를 불러오는 동안, 캐싱에 백업된 내용 보여짐.
  //     cacheTime: 900000, // 15min
  //     refetchOnMount: false,
  //     refetchOnWindowFocus: false,
  //     refetchOnReconnect: false,
  //   },
  // );
  // onError: (error) => {
  //   const title =
  //     error instanceof Error ? error.message : 'error connecting to server';
  //   // error 가 Error 클래스의 instance 일 때
  //   toast({ title, status: 'error' });
  // },
  return data;
}

// populate(채우기) the cache --> void
export function usePrefetchTreatments(): void {
  const queryClient = useQueryClient();
  queryClient.prefetchQuery(queryKeys.treatments, getTreatments);

  // {
  //   // staleTime 과 cacheTime 참고해서, 데이터의 새로고침 여부를 결정함.
  //   staleTime: 600000,
  //   cacheTime: 900000,
  // });
  // 어느 쿼리에서 데이터를 찾아야 하는지 알려주기 때문에 키 중요
}
