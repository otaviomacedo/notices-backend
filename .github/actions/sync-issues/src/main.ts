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
    // These are the credentials of a GitHub app installed in the repository that
    // contains the issues to be updated
    const client = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: 169197,
        privateKey: `-----BEGIN RSA PRIVATE KEY-----...`, // TODO Where do we store this securely?
        clientId: "Iv1.8a7a56e67a2e2c27",
        clientSecret: "blablablabalbalbal",
        installationId: 22878443,
      },
    });

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
      body, // TODO Use a template instead of the raw body
      labels,
    });
  } catch (e) {
    core.error(e);
    core.setFailed(e.message);
  }
}

run().catch(err => core.setFailed(err.message));