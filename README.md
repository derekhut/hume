This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## AWS Configuration

To enable AWS S3 image upload functionality, you'll need to set up the following environment variables in your `.env.local` file:

```bash
NEXT_PUBLIC_AWS_S3_BUCKET_NAME=your-bucket-name
NEXT_PUBLIC_AWS_REGION=your-aws-region
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your-access-key
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your-secret-key
```

Make sure to:
1. Create an S3 bucket in your AWS account
2. Configure CORS settings for your S3 bucket
3. Create an IAM user with appropriate S3 permissions
4. Never commit the `.env.local` file to version control

Note: The image upload currently uses local storage. AWS S3 functionality is prepared but not enabled by default.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
