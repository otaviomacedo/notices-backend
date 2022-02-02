import { Stack, StackProps, Stage, StageProps } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import { AccountPrincipal, Effect } from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { RecordTarget } from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

// TODO Put the pipeline and the application code in different files

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      synth: new pipelines.CodeBuildStep('Synth', {
        input: pipelines.CodePipelineSource.gitHub('otaviomacedo/notices-backend', 'main'),
        commands: [
          'npm ci',
          'npm run build',
          'npx cdk synth',
        ],
        // TODO https://docs.aws.amazon.com/cdk/api/v1/docs/pipelines-readme.html#context-lookups
        rolePolicyStatements: [
          new iam.PolicyStatement({
            actions: ['route53:ListHostedZonesByName'],
            effect: Effect.ALLOW,
            resources: ['*']
          }),
        ],
      }),
    });

    // TODO Add a validation step (part of the build) and in the PR

    pipeline.addStage(new WebsiteStage(this, 'alpha', {
      env: {
        account: '280619947791',
        region: 'us-east-1',
      },
      name: 'dev-otaviom' // TODO remove this and keep a single stage
    }));
  }
}

interface NoticesBackendProps extends StageProps {
  name: string,
}

class WebsiteStage extends Stage {
  constructor(scope: Construct, id: string, props: NoticesBackendProps) {
    super(scope, id, props);

    new WebsiteStack(this, 'WebsiteStack', {name: props.name});
  }
}

interface NoticesBackendStackProps extends StackProps {
  name: string, // TODO Make this the full domain name
}

interface StaticWebsiteProps {
  domainName: string,
  sources: s3deploy.ISource[],
}

/**
 * A website with a custom domain name.
 */
class StaticWebsite extends Construct {
  constructor(scope: Construct, id: string, props: StaticWebsiteProps) {
    super(scope, id);

    const bucket = new s3.Bucket(this, 'DataSource');

    const domainName = props.domainName;

    const hostedZone = route53.HostedZone.fromLookup(this, 'hostedZone', {
      domainName,
    });

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
      sources: props.sources,
    });

    new route53.ARecord(this, 'alias', {
      zone: hostedZone,
      recordName: domainName,
      target: RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });
  }
}

export class WebsiteStack extends Stack {
  constructor(scope: Construct, id: string, props: NoticesBackendStackProps) {
    super(scope, id, props);

    new StaticWebsite(this, 'website', {
      domainName: `cli.cdk.dev-tools.aws.dev`,
      sources: [s3deploy.Source.asset('./data')],
    });
  }
}