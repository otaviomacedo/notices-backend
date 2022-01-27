import { Stack, StackProps, Stage, StageProps } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as pipelines from 'aws-cdk-lib/pipelines';
import * as route53 from 'aws-cdk-lib/aws-route53';
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

    pipeline.addStage(new NoticesBackend(this, 'alpha', {
      env: {
        account: '280619947791',
        region: 'us-east-1',
      },
      name: 'alpha'
    }));
  }
}

interface NoticesBackendProps extends StageProps {
  name: string,
}

class NoticesBackend extends Stage {
  constructor(scope: Construct, id: string, props: NoticesBackendProps) {
    super(scope, id, props);

    new NoticesStack(this, 'NoticesStack', {name: props.name});
  }
}

interface NoticesBackendStackProps extends StackProps {
  name: string,
}

export class NoticesStack extends Stack {
  constructor(scope: Construct, id: string, props: NoticesBackendStackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'DataSource');

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'hostedZone', {
      hostedZoneId: 'Z07404673IUTK24ZA0GMQ',
      zoneName: 'cdk.dev-tools.aws.dev',
    });

    let domainName = `${props.name}.notices.cdk.dev-tools.aws.dev`;
    const certificate = new acm.DnsValidatedCertificate(this, 'certificate', {
      domainName,
      hostedZone,
    });

    const distribution = new cloudfront.Distribution(this, 'distribution', {
      defaultBehavior: { origin: new origins.S3Origin(bucket) },
      certificate,
      domainNames: [domainName],
    });

    new s3deploy.BucketDeployment(this, 'deployment', {
      destinationBucket: bucket,
      distribution,
      sources: [s3deploy.Source.asset('./data')],
    });
  }
}