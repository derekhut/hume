import fetch from 'node-fetch';
import fs from 'fs';

async function testRateLimit() {
  console.log('Starting rate limit test...');

  // Read cookie from file and parse Netscape cookie format
  const cookieContent = fs.readFileSync('cookies.txt', 'utf8');
  const lines = cookieContent.split('\n');
  let token = null;

  for (const line of lines) {
    if (line.includes('token')) {
      const fields = line.split('\t');
      token = fields[fields.length - 1];
      break;
    }
  }

  if (!token) {
    console.error('No token found in cookies.txt');
    return;
  }

  console.log('Using token:', token);

  for (let i = 0; i < 70; i++) {
    try {
      const response = await fetch('http://localhost:3001/api/chat/rate-limit', {
        headers: {
          'Cookie': `token=${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log(`Request ${i + 1}:`, response.status, data);

      // Small delay to make output readable
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Request ${i + 1} failed:`, error);
    }
  }
}

testRateLimit();
