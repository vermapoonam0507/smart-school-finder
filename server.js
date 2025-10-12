import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.path}`);
  next();
});

// Handle React routing - return index.html for all non-API routes
app.get('*', (req, res) => {
  console.log(`Serving index.html for route: ${req.path}`);
  
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    console.log(`API route requested: ${req.path}`);
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve index.html for all other routes
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  console.log(`Serving index.html from: ${indexPath}`);
  res.sendFile(indexPath);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Static files served from: ${path.join(__dirname, 'dist')}`);
});
