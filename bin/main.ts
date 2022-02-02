#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { WebsiteStack, PipelineStack } from '../lib/website';

const app = new cdk.App();
new PipelineStack(app, 'NoticesPipeline', {
  env: { account: '280619947791', region: 'us-east-1' },
});

new WebsiteStack(app, 'WebsiteStack', {
  name: 'dev-otaviom',
  env: {
    account: '280619947791',
    region: 'us-east-1'
  },
});