// import * as github from '@actions/github';
import * as core from '@actions/core';
const { promises: fs } = require('fs');

export async function hello() {
  // const githubToken = core.getInput('github_token', { required: true });
  const content = await fs.readFile('./data/notices.json', 'utf8')
  console.log(content);
}

hello().catch(err => core.setFailed(err.message));