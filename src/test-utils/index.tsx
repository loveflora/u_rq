/* eslint-disable no-console */
import { render, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';

import { generateQueryClient } from '../react-query/queryClient';

// import { defaultQueryClientOptions } from '../react-query/queryClient';

// error 제거
setLogger({
  log: console.log,
  warn: console.warn,
  error: () => {
    // swallow errors without printing out
  },
});

// toast 가 없음
// QueryClient 에 기본값이 설정되어 있지 않음.
// test 시에 toast 가 없는 것은, QueryClient 에 error handler 가 없기 때문임.

// make a function to generate a unique query client for each test
// 새로운 queryClient 생성
const generateTestQueryClient = () => {
  const client = generateQueryClient();
  // Timing out : 더이상 재시도하지 않게끔 수정
  const options = client.getDefaultOptions();
  // query 에 쓰이는 설정에서 retry 를 false 로 지정
  options.queries = { ...options.queries, retry: false };
  return client;
  // 배포 쿼리클라이언트 설정이 업데이트되어 재시도가 더이상 이루어지지 않음.
};

// wrapping 해줄 함수를 실제 생성
export function renderWithQueryClient(
  // 1) ui: ReactElement ===> react 요소에 해당하는 ui 를 받음
  // 2) client?: QueryClient ===> generateTestQueryClient 에서 생성하는 queryClient를 특정 테스트에서 오버라이딩하려면
  // 3) RenderResult ===> 테스팅 라이브러리 렌더링하면 받는 결과를 반환
  ui: ReactElement,
  client?: QueryClient,
): RenderResult {
  // client 가 제공되지 않는다면, queryClient 새로 생성
  // client 가 제공되면, 해당 queryClient 사용
  const queryClient = client ?? generateTestQueryClient();

  // ui 를 queryClient 와 wrapping
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

// ** FOR TESTING CUSTOM HOOKS **
// from https://tkdodo.eu/blog/testing-react-query#for-custom-hooks
export const createQueryClientWrapper = (): React.FC => {
  const queryClient = generateTestQueryClient();
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// 전달하는 모든 UI(쿼리 제공자에 부여하는 모든 JSX)를 wrapping 하도록 만듦 => test 올바르게 실행됨
