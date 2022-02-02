import * as github from '@actions/github';
import * as core from '@actions/core';
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from '@octokit/rest';
import { promises as fs } from 'fs';

async function run(): Promise<void> {
  const content = await fs.readFile('./data/notices.json', 'utf8');
  const notices = JSON.parse(content).notices;
  for (const notice of notices) {
    await updateIssue(notice);
  }
}

async function updateIssue(notice: any) {
  try {
    const client = new Octokit({
      authStrategy: createAppAuth,
    });


    // const githubToken = core.getInput('github_token', { required: true });
    // const client = github.getOctokit(githubToken);

    const [owner, repo] = core.getInput('repo').split('/');

    const title = notice.title;
    const body = notice.overview;
    const issueNumber = notice.issueNumber;
    const labels = ['p0', 'management/tracking'];

    await client.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      title,
      body,
      labels,
    });
  } catch (e) {
    core.error(e);
    core.setFailed(e.message);
  }
}

run().catch(err => core.setFailed(err.message));