const http = require('http');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Import server app
const app = require('./server');

let server;
const PORT = 3001; // Use separate port for test runner
const BASE_URL = `http://localhost:${PORT}`;
const DATA_FILE = path.join(__dirname, 'data', 'users.json');

// Helper to reset database before testing
function resetDatabase() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Helper to make HTTP requests preserving cookies
function makeRequest(method, path, body = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (cookie) {
      options.headers['Cookie'] = cookie;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }

        const responseCookie = res.headers['set-cookie']
          ? res.headers['set-cookie'][0]
          : null;

        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed,
          cookie: responseCookie || cookie,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Test Runner
async function runTests() {
  console.log('🚀 Starting Login Authentication System Automated Tests...\n');
  resetDatabase();

  server = app.listen(PORT);
  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      testsFailed++;
    }
  }

  try {
    // 1. Password Complexity Validation - Registration Rejection (Short Password)
    console.log('--- Test 1: Password complexity (min 8 chars) ---');
    let res = await makeRequest('POST', '/api/auth/register', {
      username: 'user_short',
      email: 'short@example.com',
      password: 'Pass1', // only 5 chars
    });
    assert(
      res.status === 400 && res.data.message.includes('at least 8 characters'),
      'Rejects registration with password under 8 characters'
    );

    // 2. Password Complexity Validation - Registration Rejection (No Number)
    console.log('--- Test 2: Password complexity (at least 1 number) ---');
    res = await makeRequest('POST', '/api/auth/register', {
      username: 'user_nonum',
      email: 'nonum@example.com',
      password: 'NoNumbersHere', // 13 chars but no digit
    });
    assert(
      res.status === 400 && res.data.message.includes('at least 1 number'),
      'Rejects registration with password missing numbers'
    );

    // 3. Basic Form Validation (no empty submissions)
    console.log('--- Test 3: Basic form validation (no empty fields) ---');
    res = await makeRequest('POST', '/api/auth/register', {
      username: '',
      email: 'test@example.com',
      password: 'ValidPassword1',
    });
    assert(
      res.status === 400 && res.data.message.includes('required'),
      'Rejects registration with empty username'
    );

    res = await makeRequest('POST', '/api/auth/login', {
      identifier: '',
      password: 'ValidPassword1',
    });
    assert(
      res.status === 400 && res.data.message.includes('required'),
      'Rejects login with empty identifier'
    );

    // 4. Successful User Registration
    console.log('--- Test 4: Valid Registration ---');
    res = await makeRequest('POST', '/api/auth/register', {
      username: 'alice',
      email: 'alice@example.com',
      password: 'SecurePassword123',
    });
    assert(
      res.status === 201 && res.data.success === true,
      'Registers user successfully with 201 Created'
    );

    // 5. Password Hashing Verification
    console.log('--- Test 5: Password Hashing in Database ---');
    const dbContent = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const registeredUser = dbContent.find((u) => u.username === 'alice');
    assert(
      registeredUser && registeredUser.passwordHash && !registeredUser.password,
      'User password is stored hashed in database without plain text'
    );
    const hashValid = await bcrypt.compare('SecurePassword123', registeredUser.passwordHash);
    assert(hashValid === true, 'Stored bcrypt hash correctly matches original password');

    // 6. Duplicate Username/Email Check
    console.log('--- Test 6: Duplicate Username & Email Check ---');
    res = await makeRequest('POST', '/api/auth/register', {
      username: 'ALICE', // duplicate case-insensitive
      email: 'different@example.com',
      password: 'SecurePassword123',
    });
    assert(
      res.status === 400 && res.data.message.includes('taken'),
      'Rejects duplicate username'
    );

    res = await makeRequest('POST', '/api/auth/register', {
      username: 'bob',
      email: 'ALICE@example.com', // duplicate email
      password: 'SecurePassword123',
    });
    assert(
      res.status === 400 && res.data.message.includes('registered'),
      'Rejects duplicate email'
    );

    // 7. Login with Incorrect Credentials
    console.log('--- Test 7: Incorrect credential handling ---');
    res = await makeRequest('POST', '/api/auth/login', {
      identifier: 'alice',
      password: 'WrongPassword999',
    });
    assert(
      res.status === 401 && res.data.message === 'Invalid username/email or password.',
      'Displays generic error message for invalid password without revealing specific field'
    );

    res = await makeRequest('POST', '/api/auth/login', {
      identifier: 'nonexistent_user',
      password: 'SecurePassword123',
    });
    assert(
      res.status === 401 && res.data.message === 'Invalid username/email or password.',
      'Displays same generic error message for non-existent username'
    );

    // 8. Protected Route Access Without Session
    console.log('--- Test 8: Unauthenticated Access to Protected Endpoint ---');
    res = await makeRequest('GET', '/api/auth/me');
    assert(
      res.status === 401 && res.data.authenticated === false,
      'Denies access to /api/auth/me when unauthenticated'
    );

    // 9. Successful Login & Session Creation
    console.log('--- Test 9: Successful Login & Session Access ---');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      identifier: 'alice@example.com', // Login using email
      password: 'SecurePassword123',
    });
    assert(
      loginRes.status === 200 && loginRes.data.user.username === 'alice',
      'Logs in successfully using email address'
    );
    const sessionCookie = loginRes.cookie;
    assert(!!sessionCookie, 'Returns active HTTP session cookie');

    // 10. Access Protected Route With Session Cookie
    console.log('--- Test 10: Authenticated Access to Protected Endpoint ---');
    res = await makeRequest('GET', '/api/auth/me', null, sessionCookie);
    assert(
      res.status === 200 && res.data.authenticated === true && res.data.user.username === 'alice',
      'Grants access to protected user profile when session cookie is provided'
    );

    // 11. Session Logout
    console.log('--- Test 11: Session Logout ---');
    const logoutRes = await makeRequest('POST', '/api/auth/logout', null, sessionCookie);
    assert(
      logoutRes.status === 200 && logoutRes.data.success === true,
      'Logs out session successfully'
    );

    // Verify session is destroyed
    res = await makeRequest('GET', '/api/auth/me', null, sessionCookie);
    assert(
      res.status === 401 && res.data.authenticated === false,
      'Subsequent protected request fails after logout'
    );

    console.log(`\n==================================================`);
    console.log(`SUMMARY: ${testsPassed} Passed, ${testsFailed} Failed`);
    console.log(`==================================================\n`);

    server.close();
    process.exit(testsFailed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    if (server) server.close();
    process.exit(1);
  }
}

runTests();

