import http from 'k6/http';     //Import HTTP module for requests
import {check, fail} from 'k6'; //Import check and fail for assertions

const BASE_URL = 'http://localhost:8080'; //Base URL for API endpoints

export default function () 
{
  //1. Prepare login payload and headers
  const loginPayload = JSON.stringify({username: 'admin', password: 'admin123'});
  const headers = {'Content-Type': 'application/json'};

  //2. POST login request to get auth token
  const authRes = http.post(`${BASE_URL}/auth/login`, loginPayload, {headers});
  check(authRes, {'login successful': (r) => r.status === 200}) || fail('Login failed');

  //3. Extract token from login response
  const token = authRes.json('token');
  if(!token) 
    fail('Token missing');

  //4. Setup authenticated headers with Bearer token
  const authHeaders = 
  {
    headers: 
    {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  //5. Extract logged in userId if present
  const loggedInUserId = authRes.json('userId');

  //6. Create unique ID for new user to avoid duplicates
  const uniqueId = Math.floor(Math.random() * 1000000);

  //7. Prepare payload to register new user with unique username, email, and phone
  const newUserPayload = JSON.stringify({
    firstName: 'Test',
    lastName: 'User',
    username: `testuser${uniqueId}`,
    password: 'testpass123',
    email: `testuser${uniqueId}@example.com`,
    phone: `+65${Math.floor(10000000 + Math.random() * 89999999)}`,
    address: '123 Test Street',
    role: 'USER',
  });

  //8. POST request to register the new user
  const registerRes = http.post(`${BASE_URL}/users/register`, newUserPayload, authHeaders);
  check(registerRes, 
  {
    '/users/register status 200': (r) => r.status === 200,
  }) || console.error('Register user failed', registerRes.status, registerRes.body);

  //9. Extract userId of the newly created user
  const createdUserId = registerRes.json('userId');

  //10. Choose which userId to test (new user or logged-in user)
  const userIdToTest = createdUserId || loggedInUserId;

  //11. GET request to fetch specific user details
  const getUserRes = http.get(`${BASE_URL}/users/${userIdToTest}`, authHeaders);
  check(getUserRes, {[`/users/${userIdToTest} GET status 200`]: (r) => r.status === 200});

  //12. GET request to fetch all users
  const allUsersRes = http.get(`${BASE_URL}/users`, authHeaders);
  check(allUsersRes, {'/users GET status 200': (r) => r.status === 200});

  //13. Prepare payload for updating user details
  const updatePayload = JSON.stringify({
    firstName: 'UpdatedFirstName',
    lastName: 'UpdatedLastName',
  });

  //14. PATCH request to update user details
  const patchRes = http.patch(`${BASE_URL}/users/${userIdToTest}`, updatePayload, authHeaders);
  check(patchRes, {[`/users/${userIdToTest} PATCH status 200`]: (r) => r.status === 200});

  //15. DELETE request to remove user
  const deleteRes = http.del(`${BASE_URL}/users/${userIdToTest}`, null, authHeaders);
  check(deleteRes, {[`/users/${userIdToTest} DELETE status 204`]: (r) => r.status === 204});

  //16. GET request to fetch current user's username
  const meUsernameRes = http.get(`${BASE_URL}/me/username`, authHeaders);
  check(meUsernameRes, {'/me/username GET status 200': (r) => r.status === 200});

  //17. GET request to check if current user has ADMIN role
  const roleToCheck = 'ADMIN';
  const hasRoleRes = http.get(`${BASE_URL}/me/has-role/${roleToCheck}`, authHeaders);
  check(hasRoleRes, {[`/me/has-role/${roleToCheck} GET status 200`]: (r) => r.status === 200});
}