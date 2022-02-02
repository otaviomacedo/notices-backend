import { Stack, StackProps, Stage } from 'aws-cdk-lib';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { WebsiteStack, WebsiteStackProps } from './website';

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
          'npx cdk synth',
        ],
      }),
    });

    pipeline.addStage(new WebsiteStage(this, 'alpha', {
      env: {
        account: '280619947791',
        region: 'us-east-1',
      },
      domainName: 'dev-otaviom.cdk.dev-tools.aws.dev'
      // domainName: 'cli.cdk.dev-tools.aws.dev',
    }));
  }
}

class WebsiteStage extends Stage {
  constructor(scope: Construct, id: string, props: WebsiteStackProps) {
    super(scope, id, props);

    new WebsiteStack(this, 'WebsiteStack', props);
  }
}
