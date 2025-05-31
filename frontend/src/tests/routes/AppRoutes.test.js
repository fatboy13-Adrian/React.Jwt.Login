//Mock the entire AuthService module to stub the loginUser function
jest.mock('../../services/AuthService', () => ({
  loginUser: jest.fn(), //Replace loginUser with a Jest mock function
}));

import {loginUser} from '../../services/AuthService';   //Import the mocked loginUser function from the AuthService module

describe('loginUser', () => 
{
    //Clear all mocks after each test to avoid interference between tests
    afterEach(() => 
    {
        jest.clearAllMocks();
    });

    //Test case: loginUser resolves successfully and returns expected data
    it('returns data when login is successful', async () => 
    {
        //Setup mock to resolve with a token object
        const mockResponse = {token: 'abc123'};
        loginUser.mockResolvedValueOnce(mockResponse);

        //Call the mocked loginUser function with test credentials
        const result = await loginUser('user1', 'password1');

        //Verify that loginUser was called with correct arguments
        expect(loginUser).toHaveBeenCalledWith('user1', 'password1');
        
        //Verify that the returned result matches the mock response
        expect(result).toEqual(mockResponse);
    });

    //Test case: loginUser rejects with a specific server error message
    it('throws an error when login fails with server message', async () => 
    {
        //Setup mock to reject with an error containing 'Invalid credentials'
        loginUser.mockRejectedValueOnce(new Error('Invalid credentials'));

        //Expect loginUser call to reject with the specific error message
        await expect(loginUser('user1', 'wrongpass')).rejects.toThrow('Invalid credentials');
    });

    //Test case: loginUser rejects with a generic network error
    it('throws a generic error if no specific error message provided', async () => 
    {
        //Setup mock to reject with a generic 'Network error'
        loginUser.mockRejectedValueOnce(new Error('Network error'));

        //Expect loginUser call to reject with the generic error message
        await expect(loginUser('user1', 'pass')).rejects.toThrow('Network error');
    });

    //Test case: loginUser rejects if username is missing
    it('throws an error if username is missing', async () => 
    {
        //Setup mock to reject with a validation error message
        loginUser.mockRejectedValueOnce(new Error('Username and password are required'));

        //Expect loginUser call with empty username to reject with validation error
        await expect(loginUser('', 'password')).rejects.toThrow('Username and password are required');
    });

    //Test case: loginUser rejects if password is missing
    it('throws an error if password is missing', async () => 
    {
        //Setup mock to reject with a validation error message
        loginUser.mockRejectedValueOnce(new Error('Username and password are required'));

        //Expect loginUser call with empty password to reject with validation error
        await expect(loginUser('user', '')).rejects.toThrow('Username and password are required');
    });

    //Test case: loginUser rejects if both username and password are missing
    it('throws an error if both username and password are missing', async () => 
    {
        //Setup mock to reject with a validation error message
        loginUser.mockRejectedValueOnce(new Error('Username and password are required'));

        //Expect loginUser call with empty username and password to reject with validation error
        await expect(loginUser('', '')).rejects.toThrow('Username and password are required');
  });
});