import { useQuery } from 'react-query';

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
  // onError: (error) => {
  //   const title =
  //     error instanceof Error ? error.message : 'error connecting to server';
  //   // error 가 Error 클래스의 instance 일 때
  //   toast({ title, status: 'error' });
  // },
  return data;
}

// commit
