import * as github from '@actions/github';
import * as core from '@actions/core';
import { promises as fs } from 'fs';

async function run(): Promise<void> {
  const content = await fs.readFile('./data/notices.json', 'utf8');
  const notices = JSON.parse(content).notices;
  await foo(notices[0]);
}

async function foo(notice: any) {
  try {
    const githubToken = core.getInput('github_token', { required: true });
    const [owner, repo] = core.getInput('repo').split('/');
    const title = notice.title;
    const body = notice.overview;
    const client = github.getOctokit(githubToken);
    await client.issues.update({
      owner: owner,
      repo: repo,
      issue_number: 2,
      title: title,
      body: 'TESTESTSTSTS',
      labels: ['p0', 'management/tracking'],
    });
  } catch (e) {
    core.error(e);
    core.setFailed(e.message);
  }
}

run().catch(err => core.setFailed(err.message));