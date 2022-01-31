import * as semver from 'semver';

const MAX_TITLE_LENGTH = 100;
const VALID_COMPONENT_NAMES = ['cli', 'framework'];

export interface Component {
  name: string,
  version: string,
}

export interface Notices {
  title:  string,
  issueUrl: string,
  overview: string,
  components: Component[],
  schemaVersion: string,
}

export function validateNotices(notices: Notices[]): void {
  notices.forEach(validateNotice);
}

export function validateNotice(notice: Notices): void {
  if (notice.title.length > MAX_TITLE_LENGTH) {
    throw new Error(`Maximum allowed title length is ${MAX_TITLE_LENGTH}. Title ${notice.title} is ${notice.title.length} characters long`);
  }

  if (!isValidGitHubUrl(notice.issueUrl)) {
    throw new Error(`${notice.issueUrl} is not a valid AWS CDK issue URL`);
  }

  for (const component of notice.components) {
    if (!VALID_COMPONENT_NAMES.includes(component.name)) {
      throw new Error(`${component.name} is not a valid component name. Please choose one of ${VALID_COMPONENT_NAMES}`);
    }

    if (!isValidSemverRange(component.version)) {
      throw new Error(`Component version ${component.version} is not a valid semver range`);
    }
  }

  if (!isValidSemverRange(notice.schemaVersion)) {
    throw new Error(`Schema version ${notice.schemaVersion} is not a valid semver range`);
  }
}

function isValidGitHubUrl(url: string): boolean {
  const issueUrlRegex = /https:\/\/github.com\/aws\/aws-cdk\/issues\/\d+/;
  return issueUrlRegex.test(url)
}

function isValidSemverRange(range: string): boolean {
  try {
    new semver.Range(range);
    return true;
  } catch (_) {
    return false;
  }
}