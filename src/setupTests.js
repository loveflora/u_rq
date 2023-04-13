// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
// msw 에서 가져온 상용구 (boilerplate)
import '@testing-library/jest-dom';

import { server } from './mocks/server';

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
// 각 테스트가 끝난 뒤, 모든 테스트가 핸들러 초기화하기 전에 네트워크 요청 차단할 수 있도록 구성
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
// 끝난 뒤에는 서버 닫음
afterAll(() => server.close());
