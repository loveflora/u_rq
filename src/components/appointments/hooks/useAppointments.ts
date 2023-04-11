// @ts-nocheck
import dayjs from 'dayjs';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
// useEffect : pre-fetch를 trigger 하는 방법
import { useQuery, useQueryClient } from 'react-query';

// useQueryClient : pre-fetch 메서드를 실행할 QueryClient 를 얻는 방법
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useUser } from '../../user/hooks/useUser';
import { AppointmentDateMap } from '../types';
import { getAvailableAppointments } from '../utils';
import { getMonthYearDetails, getNewMonthYear, MonthYear } from './monthYear';

// common options for both useQuery and perfetchQuery
const commonOptions = {
  staleTime: 0, // 즉시 만료됨.
  cacheTime: 500000, // 5 min
};

// for useQuery call
async function getAppointments(
  year: string,
  month: string,
): Promise<AppointmentDateMap> {
  const { data } = await axiosInstance.get(`/appointments/${year}/${month}`);
  return data;
}

// useUserAppointments
// - only logged in users
// - all time

// useAppointments
// - all users
// - only for display month
// types for hook return object
interface UseAppointments {
  appointments: AppointmentDateMap;
  monthYear: MonthYear;
  updateMonthYear: (monthIncrement: number) => void;
  showAll: boolean;
  setShowAll: Dispatch<SetStateAction<boolean>>;
}

// The purpose of this hook:
//   1. track the current month/year (aka monthYear) selected by the user
//     1a. provide a way to update state
//   2. return the appointments for that particular monthYear
//     2a. return in AppointmentDateMap format (appointment arrays indexed by day of month)
//     2b. prefetch the appointments for adjacent monthYears
//         이전/다음 달 이동 시 기다릴 필요가 없도록 !
//   3. track the state of the filter (all appointments / available appointments)
//     3a. return the only the applicable appointments for the current monthYear
export function useAppointments(): UseAppointments {
  /** ****************** START 1: monthYear state *********************** */
  // get the monthYear for the current date (for default monthYear state)
  const currentMonthYear = getMonthYearDetails(dayjs());

  // state to track current monthYear chosen by user
  // state value is returned in hook return object
  const [monthYear, setMonthYear] = useState(currentMonthYear);

  // setter to update monthYear obj in state when user changes month in view,
  // returned in hook return object
  function updateMonthYear(monthIncrement: number): void {
    setMonthYear((prevData) => getNewMonthYear(prevData, monthIncrement));
  }
  /** ****************** END 1: monthYear state ************************* */
  /** ****************** START 2: filter appointments  ****************** */
  // State and functions for filtering appointments to show all or only available
  const [showAll, setShowAll] = useState(false);

  // We will need imported function getAvailableAppointments here
  // We need the user to pass to getAvailableAppointments so we can show
  //   appointments that the logged-in user has reserved (in white)
  const { user } = useUser();

  // selectFn은 익명함수 -> 최적화 X
  // 최적화 : 데이터/함수 변경여부 확인 -> 변경사항 없으면 해당 함수를 다시 실행하지 않음.
  const selectFn = useCallback(
    (data) => getAvailableAppointments(data, user),
    [user],
  );
  // 안정적인 함수로 만들기 위해 useCallback 실행
  // [user] : 사용자가 로그아웃할 때마다 함수변경
  // selectFn 은 pre-fetch 옵션이 아니므로 pre-fetch된 데이터에 추가할 수 없음.

  /** ****************** END 2: filter appointments  ******************** */
  /** ****************** START 3: useQuery  ***************************** */
  // useQuery call for appointments for the current monthYear

  // TODO: update with useQuery!
  // Notes:
  //    1. appointments is an AppointmentDateMap (object with days of month
  //       as properties, and arrays of appointments for that day as values)
  //
  //    2. The getAppointments query function needs monthYear.year and
  //       monthYear.month
  const queryClient = useQueryClient();
  useEffect(() => {
    const nextMonthYear = getNewMonthYear(monthYear, 1);
    // prefetch
    queryClient.prefetchQuery(
      // 쿼리키 - 의존성 배열
      [queryKeys.appointments, nextMonthYear.year, nextMonthYear.month],
      // 서버 호출 (쿼리 함수)
      () => getAppointments(nextMonthYear.year, nextMonthYear.month),
      commonOptions,
    );
    // 의존성
  }, [queryClient, monthYear]);
  // pre-fetch : 데이터로 캐시를 키워서 사용자가 다음달 클릭할 때 표시되게 함
  const fallback = {};
  const { data: appointments = fallback } = useQuery(
    [queryKeys.appointments, monthYear.year, monthYear.month],
    // 공통 접두사가 있으면, 한번에 모두 무효화할 수 있음.
    () => getAppointments(monthYear.year, monthYear.month),
    // keepPreviousData: true 라고 하면 => 배경은 변하는데, 데이터는 이전꺼

    {
      select: showAll ? undefined : selectFn,
      ...commonOptions,
      // re-fetching => pre-fetching에 적용되진 않음.
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      refetchInterval: 60000, // polling (데이터 주기적 업데이트) - every second : not recommended for production
    },
    // showAll이 '참'일 경우 : selectFn 실행하지 않고, 모든 데이터 반환
    // showAll이 '거짓'일 경우 : selectFn(원래 반환되었을 data를 가져와서, 변환한 다음, 변환된 데이터를 return) 실행
  );

  /** ****************** END 3: useQuery  ******************************* */

  return { appointments, monthYear, updateMonthYear, showAll, setShowAll };
}

// appointments 사이트는 실시간 정보가 up-to-date 되는 것이 중요
// 사용자 활동이 없어도 서버에서 변경이 일어나야 함. (일정표 보는 동안 다른 사용자가 예약하려 하는 경우)
// 풀링 -> 데이터를 주기적으로 서버에서 불러옴.
