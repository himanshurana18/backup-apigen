# API Generator

A Next.js application for generating and managing APIs with ease.

## Features

- 🚀 Built with Next.js 15.2.4 and React 18.3.1
- 🎨 Styled with Tailwind CSS
- 🔐 Authentication ready with NextAuth
- 📊 MongoDB integration
- 🔧 TypeScript support
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- MongoDB instance (local or cloud)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Update the environment variables in `.env.local`:
   ```env
   MONGODB_URI=your-mongodb-connection-string
   NEXT_PUBLIC_API_URL=http://localhost:3005
   NODE_ENV=development
   API_SECURE_JWT=your-secure-jwt-secret
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:3005
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3005](http://localhost:3005) in your browser.

## Deployment

### Vercel Deployment

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Set the following environment variables in Vercel:
   - `MONGODB_URI`: Your MongoDB connection string
   - `API_SECURE_JWT`: A secure JWT secret
   - `NEXTAUTH_SECRET`: A secure NextAuth secret
   - `NEXTAUTH_URL`: Your production URL
   - `NEXT_PUBLIC_API_URL`: Your production URL

4. Deploy!

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard pages
│   ├── docs/          # Documentation pages
│   └── globals.css    # Global styles
├── lib/               # Utility libraries
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXT_PUBLIC_API_URL` | Public API URL | Yes |
| `API_SECURE_JWT` | JWT secret for API authentication | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret | Yes |
| `NEXTAUTH_URL` | NextAuth URL | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |

## License

This project is licensed under the MIT License.