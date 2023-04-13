import { screen } from '@testing-library/react';

// import { rest } from 'msw';
// import { defaultQueryClientOptions } from '../../../react-query/queryClient';
// import { server } from '../../../mocks/server';
import { renderWithQueryClient } from '../../../test-utils';
import { AllStaff } from '../AllStaff';

test('renders response from query', async () => {
  // Allstaff 는 컴포넌트를 렌더링할 때, useStaff 훅을 실행하며 직원 엔드포인트를 쿼리함.
  renderWithQueryClient(<AllStaff />);
  const staffNames = await screen.findAllByRole('heading', {
    name: /divya|sandra|michael|mateo/i,
  });

  expect(staffNames).toHaveLength(4);
});

test('handles query error', async () => {
  // (re)set handler to return a 500 error for staff
  // server.resetHandlers(
  //   rest.get('http://localhost:3030/staff', (req, res, ctx) => {
  //     return res(ctx.status(500));
  //   }),
  // );
});
