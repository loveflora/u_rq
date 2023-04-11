import { createStandaloneToast } from '@chakra-ui/react';
import { QueryClient } from 'react-query';

import { theme } from '../theme';

const toast = createStandaloneToast({ theme });

function queryErrorHandler(error: unknown): void {
  // error is type unknown because in js, anything can be an error (e.g. throw(5))
  const title =
    error instanceof Error ? error.message : 'error connecting to server';

  // prevent duplicate toasts
  toast.closeAll(); // toast 가 점차 쌓이기 때문에, toast 가 중복되지 않도록
  toast({ title, status: 'error', variant: 'subtle', isClosable: true });
}

// queryClient로 어떻게 전역 Re-fetching options 을 설정할 수 있는지
// 기본 옵션으로 설정 => useQuery 를 모두 커버 (하나하나 적용 안해도 됨)
// re-fetching 이 자주 발생하지 않는다. (정보 변동성이 적음)
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: queryErrorHandler,
      staleTime: 600000,
      cacheTime: 900000,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: queryErrorHandler,
    },
  },
});
