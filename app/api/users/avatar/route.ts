import { NextResponse } from 'next/server';
import { S3 } from 'aws-sdk';
import { getDb } from '@/utils/db';

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const username = formData.get('username') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: `avatars/${filename}`,
      Body: buffer,
      ContentType: file.type
    };

    try {
      const uploadResult = await s3.upload(params).promise();
      
      // Update user's avatar_url in the database
      const db = getDb();
      const result = await db.query(
        `
        UPDATE users 
        SET avatar_url = $1
        WHERE username = $2
        RETURNING id, username, avatar_url
        `,
        [uploadResult.Location, username]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user: result.rows[0]
      });
    } catch (error) {
      console.error('S3 Upload Error:', error);
      return NextResponse.json(
        { error: 'Failed to upload to S3' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}
