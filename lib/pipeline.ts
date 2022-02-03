import { Stack, StackProps, Stage } from 'aws-cdk-lib';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { WebsiteStack, WebsiteStackProps } from './website';

export const BACKEND_ACCOUNT = '458101988253';
export const BACKEND_REGION = 'us-east-1';

const DOMAIN_NAME = 'cli.cdk.dev-tools.aws.dev';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      synth: new pipelines.CodeBuildStep('Synth', {
        input: pipelines.CodePipelineSource.gitHub('otaviomacedo/notices-backend', 'main'),
        commands: [
          'npm ci',
          'npm run build',
          'npm test',
        ],
      }),
    });

    pipeline.addStage(new WebsiteStage(this, 'prod', {
      env: {
        account: BACKEND_ACCOUNT,
        region: BACKEND_REGION,
      },
      // domainName: 'dev-otaviom.cdk.dev-tools.aws.dev'
      domainName: DOMAIN_NAME,
    }));
  }
}

class WebsiteStage extends Stage {
  constructor(scope: Construct, id: string, props: WebsiteStackProps) {
    super(scope, id, props);

    new WebsiteStack(this, 'WebsiteStack', props);
  }
}
