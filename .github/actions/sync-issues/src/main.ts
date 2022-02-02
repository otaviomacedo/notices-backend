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
      authStrategy: createAppAuth({
        installationId: 22878443,
        appId: 169197,
        privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA6cDrjeZyu3BFn+Yn6RwbvGrpIC7Aai5Htcvo6GU4Vd0JZavC
zVTgsxDjx5ciCW3wb87BdkDIGIVVtqo476g8MkrW3hX23PbBA6mJKeI9T15wgsYV
rUY0VKjRywO+u68vzEZGDr70mY4sznnPawyMERehCsfy4tOrkbn8C+yBLxae2Akj
4YG6G+Sr846KempkZeRxAmgP5vmWP5ZTdPu4qhm4df5TqnA86zEyOIHPuShTAtBi
MxW52jMQ/nvXF/iq1DhAiWRfbhX7ZbLDvzVfeblG/z+43tEEPkzi0b69zWHUx41I
kjcx6GthuP+2q8Je4wK1YMeKlgKS88Bw3mibrQIDAQABAoIBAQCCum4CUhtgUI3f
uywe5qVsXq46XWsm9vML7Ro4vkMfYhrbTZAInat8+bkp6pASjfWl0g/IPrqpXAhv
vAtTnNbtmYVJdyc0tJuFnM8lKW34cWyi9n0xBs5FepS54UJOXM9yguqzXIAXULgm
UWF7EO1Usc5S5TglOxP8z/LyCDbHSeFwzXZkgZpjJ5SqusIVg0mWsTIm0uTHEC5L
wwGbTXHKUf0hDwx768c+vCPfRE+VK+zcHlutzTEby+niyhycUpCwnvVozCJH3mQa
g5OulUvVeYoYPf+fw6cvC70PteATalBdWmuxnylyyFNZYmyPgSmrFx+56HYHvPJ+
TaTxvtnRAoGBAP+0DTIwnd3gHkJd+Trv7I64Bwx46dQwSxf/Nyqh2Fmy1ax9bwbM
RiD/1K+BYhtzKqb73+BxfEFdLb0jhgEKuHxfRxh2FhzpzP9nopiikKPC835oICau
+rSUIRTcYhX1SvW9s9KcCCt3K2g1xIwgXSul0cg11C3kFmoQj6htg0GzAoGBAOoG
WWA6y1aK8FlrdMG5ORWdzwbGiAO2FpUT207x0jrmJB3xJ6NJ5LAWXOlWXykS3fKZ
bR0e745/OIbobTioUJoqSv4OxNZIffvYrwn9X5/lVh3YlRvpPeLo0Q9ISmnPzYjL
eKy4gOtUGQN5hirWnxu9s9OKf7KFQY1NsOLRtD0fAoGAAYeKLKqtxw34IF1/iCK3
P4NKR4DRpTtEt7gHFHIzYRX4wTde2qOOJ9Rf6UzU0WU29Bi9lhIXtCxigaccvhTa
VaQcQME0EKg1WbG8/zy5sMERw8fLqW+SgFICgKVw0MDO2flwgen9AoWL9OudaVko
NYKgZpor0rpyh9/hfBhrmJECgYB0rbOz8bxdqqoIuzWcPKAEcgi9JRC9YPTDYQIP
yyt46DOLpieQFxBo5s1uHP0W+mwkP3CSe1EO58kkIhAKloiRRJLdNjnXaI8/mJo0
zdn2W55jBQ/auaB8WH2bM/y94rhkAqZo3xiPu/84p0dIZncvmpZk2wGt3RiAvgJ6
I/nMGwKBgQD1RDyh1Y4xo8xpYZozhGHOvscCO9Yggnpg9xRTmbH4Fhh8jjEGO8nB
aG9q3E415hqq5h+ffePoYDZ3Ed7N9PZe9hfq4Xsgx/0+3VD9Hlyn65R/7oAYubB5
GikHEvWOblfzeMQywK6WiROoxwQPIXN7rdjaXsya9V9rb6qwnyNdKQ==
-----END RSA PRIVATE KEY-----
`,
        clientId: "Iv1.8a7a56e67a2e2c27",
        clientSecret: "85b1aae0e843fab34b625a3a08d58c2c49c8299a"
      }),
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