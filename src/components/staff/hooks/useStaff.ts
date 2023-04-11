import { Dispatch, SetStateAction, useCallback, useState } from 'react';
// useCallback : React Query 캐싱을 이용해서 안정적으로 함수를 얻음.
import { useQuery } from 'react-query';

import type { Staff } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { filterByTreatment } from '../utils';

// for when we need a query function for useQuery
async function getStaff(): Promise<Staff[]> {
  const { data } = await axiosInstance.get('/staff');
  return data;
}

interface UseStaff {
  staff: Staff[];
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
}

export function useStaff(): UseStaff {
  // for filtering staff by treatment
  const [filter, setFilter] = useState('all');
  const selectFn = useCallback(
    // useCallback 으로 불러온 익명함수는 안정적
    (unfilteredStaff) => filterByTreatment(unfilteredStaff, filter),
    [filter],
    // 현 filter 상태값을 조건으로 함
  );

  // TODO: get data from server via useQuery
  const fallback = [];
  const { data: staff = fallback } = useQuery(queryKeys.staff, getStaff, {
    // filter가 all : filter 함수 필요 X (여과되지 않은 데이터를 얻음)
    // filter가 all이 아닌 경우 : 데이터를 거름
    select: filter !== 'all' ? selectFn : undefined,
  });

  return { staff, filter, setFilter };
}
