# Smart School Finder

A modern React application for finding and applying to schools with an integrated PDF generation system.

## Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables

1. **For Local Development:**
   ```bash
   # Copy the example file
   cp .env.example .env.local

   # Edit .env.local and set:
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

2. **For Production:**
   Environment variables are configured in the deployment platform (Render) and should not be committed to version control.

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Deployment

This application is configured for deployment on Render. The `render.yaml` file contains the deployment configuration with the necessary environment variables.

## Features

- Student application system
- School portal for managing applications
- Automatic PDF generation after application submission
- Application tracking and status updates
- Responsive design with modern UI
