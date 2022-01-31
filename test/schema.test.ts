import * as notices from '../data/notices.json';
import { validateNotices } from '../lib/notices';

test('Notices are valid', () => {
  expect(() => validateNotices(notices.notices)).not.toThrow();
});