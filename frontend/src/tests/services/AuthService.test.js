//Mock the 'axios' module with a manual mock object having a mock function 'post'
jest.mock('axios', () => ({
  post: jest.fn(),  //mock implementation of axios.post to be controlled in tests
}));

const {loginUser} = require('../../services/AuthService');  //Import the 'loginUser' function from the AuthService module to test
const axios = require('axios');                             //Import the mocked axios instance for use inside the tests (to set mockResolvedValue/mockRejectedValue)

//Group related tests under the 'loginUser' test suite
describe('loginUser', () => 
{
    //After each test, clear all mock usage data to avoid test interference
    afterEach(() => 
    {
        jest.clearAllMocks();
    });

    //Test case: loginUser returns correct data on successful login
    it('returns data when login is successful', async () => 
    {
        //Mock response data expected from successful login
        const mockResponse = {token: 'abc123'};
        
        //Setup axios.post to resolve with the mock response data once
        axios.post.mockResolvedValueOnce({data: mockResponse});

        //Call loginUser with valid username and password
        const result = await loginUser('user1', 'password1');

        //Assert that axios.post was called with correct URL and payload
        expect(axios.post).toHaveBeenCalledWith('http://localhost:8080/auth/login', 
        {
            username: 'user1',
            password: 'password1',
        });

        //Assert that loginUser returns the expected mockResponse data
        expect(result).toEqual(mockResponse);
    });

    //Test case: loginUser throws error with message from server response when login fails
    it('throws an error with message from server response on failure', async () => 
    {
        //Create an error object simulating axios error response with message
        const error = 
        {
            response: 
            {
                data: 
                {
                    message: 'Invalid credentials',
                },
            },
        };

        //Setup axios.post to reject with the above error once
        axios.post.mockRejectedValueOnce(error);

        //Expect loginUser to reject with the specific server error message
        await expect(loginUser('user1', 'wrongpass')).rejects.toThrow('Invalid credentials');
    });

    //Test case: loginUser throws a generic error when axios rejects with an Error object (no server message)
    it('throws a generic error if no server message is provided', async () => 
    {
        //Setup axios.post to reject with a generic Error object
        axios.post.mockRejectedValueOnce(new Error('Network error'));

        //Expect loginUser to reject with the error's message (generic network error message)
        await expect(loginUser('user1', 'pass')).rejects.toThrow('Network error');
    });

    //Test case: loginUser throws generic error if response exists but no message in data
    it('throws a generic error if response exists but no message in data', async () => 
    {
        //Create an error object with empty response data (no message)
        const error = 
        {
            response: 
            {
                data: {}
            }
        };
        //Setup axios.post to reject with the above error once
        axios.post.mockRejectedValueOnce(error);

        //Expect loginUser to reject with the fallback generic error message
        await expect(loginUser('user1', 'pass')).rejects.toThrow('Failed to login. Please try again.');
    });

    //Test case: loginUser throws generic error if error object is empty
    it('throws a generic error if error object is empty', async () => 
    {
        //Setup axios.post to reject with an empty object
        axios.post.mockRejectedValueOnce({});

        //Expect loginUser to reject with the fallback generic error message
        await expect(loginUser('user1', 'pass')).rejects.toThrow('Failed to login. Please try again.');
    });

    //Test case: loginUser calls axios.post with correct URL and payload
    it('calls axios.post with correct URL and payload', async () => 
    {
        //Setup axios.post to resolve with mock token data
        axios.post.mockResolvedValueOnce({data: {token: 'token123'}});

        //Call loginUser with test credentials
        await loginUser('testUser', 'testPass');

        //Expect axios.post to have been called exactly once
        expect(axios.post).toHaveBeenCalledTimes(1);
        
        //Expect axios.post to have been called with the expected URL and payload
        expect(axios.post).toHaveBeenCalledWith('http://localhost:8080/auth/login', 
        {
            username: 'testUser',
            password: 'testPass',
        });
    });

    //Test case: loginUser throws error if username is missing
    it('throws error when username is missing', async () => 
    {
        //Expect loginUser to reject when called with empty username
        await expect(loginUser('', 'password')).rejects.toThrow();
    });

    //Test case: loginUser throws error if password is missing
    it('throws error when password is missing', async () => 
    {
        //Expect loginUser to reject when called with empty password
        await expect(loginUser('user', '')).rejects.toThrow();
    });
});