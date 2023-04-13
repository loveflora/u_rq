import { screen } from '@testing-library/react';
import { rest } from 'msw';

import { server } from '../../../mocks/server';
// import { defaultQueryClientOptions } from '../../../react-query/queryClient';
import { renderWithQueryClient } from '../../../test-utils';
import { Calendar } from '../Calendar';

// mocking useUser to mimic a logged-in user
// jest.mock('../../user/hooks/useUser', () => ({
//   __esModule: true,
//   useUser: () => ({ user: mockUser }),
// }));

test('Reserve appointment error', async () => {
  // (re)set handler to return a 500 error for appointments
  // 핸들러 reset 하는 이유는 특정 날짜에 잡힌 예약정보를 불러올 때, 500 error 가 반환되기 때문.
  server.resetHandlers(
    rest.get(
      'http://localhost:3030/appointments/:month/:year',
      (req, res, ctx) => {
        return res(ctx.status(500));
      },
    ),
  );

  renderWithQueryClient(<Calendar />);

  // check for toast alert
  // alertToast 는 async --> server 에서 동시에 응답을 주지는 않으므로
  const alertToast = await screen.findByRole('alert');
  expect(alertToast).toHaveTextContent('Request failed with status code 500');
  // queryClient 의 error handler 가 에러 내용을 전달하므로
});
