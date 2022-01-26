import { Stack, StackProps, Stage, StageProps } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.gitHub('otaviomacedo/notices-backend', 'main'),
        commands: [
          'npm ci',
          'npm run build',
          'npx cdk synth',
        ],
      }),
    });

    pipeline.addStage(new NoticesBackend(this, 'Prod', {
      env: {
        account: '280619947791',
        region: 'us-east-1',
      },
    }));
  }
}

class NoticesBackend extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new NoticesStack(this, 'NoticesStack');
  }
}

export class NoticesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'DataSource');

    const distribution = new cloudfront.Distribution(this, 'distribution', {
      defaultBehavior: { origin: new origins.S3Origin(bucket) },
    });

    new s3deploy.BucketDeployment(this, 'deployment', {
      destinationBucket: bucket,
      distribution,
      sources: [s3deploy.Source.asset('./data')],
    });
  }
}