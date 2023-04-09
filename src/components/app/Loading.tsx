import { Spinner, Text } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { useIsFetching } from 'react-query';

export function Loading(): ReactElement {
  // will use React Query `useIsFetching` to determine whether or not to display
  const isFetching = useIsFetching();
  // 현재 가져오기 상태인 쿼리 호출의 수를 나타내는 정수값을 반환

  const display = isFetching ? 'inherit' : 'none';
  // truthy = 1 이상
  // falsy = 0

  return (
    // 로딩 중 - 돌아가는 원
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="olive.200"
      color="olive.800"
      role="status"
      position="fixed"
      zIndex="9999"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      display={display}
    >
      <Text display="none">Loading...</Text>
    </Spinner>
  );
}
