import * as notices from '../data/notices.json';
import { validateNotices } from '../lib/notice';

test('Notices are valid', () => {
  expect(() => validateNotices(notices.notices)).not.toThrow();
});