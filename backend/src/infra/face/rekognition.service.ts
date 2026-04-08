import { Injectable } from "@nestjs/common";
import { CompareFacesCommand, RekognitionClient } from "@aws-sdk/client-rekognition";

@Injectable()
export class RekognitionService {
  private readonly client = new RekognitionClient({
    region: process.env.AWS_REGION
  });

  async compareByS3(
    sourceBucket: string,
    sourceKey: string,
    targetBucket: string,
    targetKey: string
  ): Promise<number> {
    const output = await this.client.send(
      new CompareFacesCommand({
        SourceImage: { S3Object: { Bucket: sourceBucket, Name: sourceKey } },
        TargetImage: { S3Object: { Bucket: targetBucket, Name: targetKey } },
        SimilarityThreshold: 85
      })
    );
    return output.FaceMatches?.[0]?.Similarity ?? 0;
  }
}
