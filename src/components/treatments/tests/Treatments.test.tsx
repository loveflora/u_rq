import { screen } from '@testing-library/react';

import { renderWithQueryClient } from '../../../test-utils';
import { Treatments } from '../Treatments';

// 비동기
test('renders response from query', async () => {
  // client 를 제공하는 제공자에 wrapping 된 treatment 를 렌더링
  renderWithQueryClient(<Treatments />);

  // screen : 렌더링 결과에 접근하는 방법
  // findBy : 대기하고 있음 (비동기)
  const treatmentTitles = await screen.findAllByRole('heading', {
    // 아하 이거 띄워쓰기 하면 안되는구나 !
    name: /massage|facial|scrub/i,
  });

  expect(treatmentTitles).toHaveLength(3);
});
