import http from 'http';
import { MOCK_SEED_DATA } from './seed/seedData.js';
import { handleApiRoutes } from './routes/api.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;
let db = JSON.parse(JSON.stringify(MOCK_SEED_DATA));

connectDB();

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const body = await parseBody(req);

  try {
    if (pathname === '/api/health') {
      return sendJSON(res, 200, { status: 'OK', system: 'SmileCare Express API Server v1.0', time: new Date().toISOString() });
    }

    const response = await handleApiRoutes(req, res, db, pathname, body);
    return sendJSON(res, 200, response);
  } catch (err) {
    console.error('Server error:', err);
    return sendJSON(res, 500, { error: 'Internal Server Error' });
  }
});

server.listen(PORT, () => {
  console.log(`SmileCare REST API Server running on port ${PORT}`);
});
