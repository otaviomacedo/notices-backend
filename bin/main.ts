#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { PipelineStack } from '../lib/pipeline';
import { WebsiteStack } from '../lib/website';

const app = new cdk.App();

new PipelineStack(app, 'NoticesPipeline', {
  env: { account: '280619947791', region: 'us-east-1' },
});

new WebsiteStack(app, 'WebsiteStack', {
  domainName: 'dev-otaviom.cdk.dev-tools.aws.dev',
  env: {
    account: '280619947791',
    region: 'us-east-1'
  },
});