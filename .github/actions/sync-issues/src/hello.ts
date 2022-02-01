// import * as github from '@actions/github';
import * as core from '@actions/core';

export function hello() {
  const githubToken = core.getInput('github_token', { required: true });
  console.log(githubToken);
}

hello();