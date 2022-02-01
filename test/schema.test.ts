import { IncomingMessage } from 'http';
import * as notices from '../data/notices.json';
import { validateNotices } from '../lib/notice';
const https = require('https');

test('Notices are valid', () => {
  expect(() => validateNotices(notices.notices)).not.toThrow();
});

test('Issue exists', () => {
  for (const notice of notices.notices) {
    const url = `https://github.com/otaviomacedo/notices-backend/issues/${notice.issueNumber}`;
    https.get(url, (res: IncomingMessage) => {
      if (res.statusCode !== 200) {
        fail(`Couldn't find issue ${url}`);
      }
    }).on('error', function(e: Error) {
      fail(e);
    });
  }
});