import '@testing-library/jest-dom';                             //Import jest-dom for extended DOM matchers in tests
import React from 'react';                                      //Import React library
import {render, screen, waitFor} from '@testing-library/react'; //Import testing utilities from React Testing Library
import {MemoryRouter} from 'react-router-dom';                  //Import MemoryRouter for routing context in tests
import axios from 'axios';                                      //Import axios HTTP client

//Mock axios module with default resolved values for get and patch requests
jest.mock('axios', () => ({
    //Mock axios.get to resolve with default user data
    get: jest.fn().mockResolvedValue({
        data: 
        {
        firstName: 'Test',            //Mock firstName field
        lastName: 'User',             //Mock lastName field
        username: 'testuser',         //Mock username field
        email: 'test@example.com',    //Mock email field
        phone: '1234567890',          //Mock phone field
        address: '123 Test St',       //Mock address field
        password: '',                 //Mock password field (empty)
        role: 'admin',                //Mock user role
        },
    }),
    patch: jest.fn().mockResolvedValue({data: {}}),   //Mock axios.patch to resolve with empty data object
}));

//Create a mock implementation of localStorage with default token
const localStorageMock = (() => 
{
    let store = {token: 'mock-token'};                                    //Internal store with a mock token
    
    return {
        getItem: jest.fn((key) => store[key] || null),                      //Mock getItem method
        setItem: jest.fn((key, value) => {store[key] = value.toString();}), //Mock setItem method
        removeItem: jest.fn((key) => {delete store[key];}),                 //Mock removeItem method
        clear: jest.fn(() => {store = {};}),                                //Mock clear method to reset store
    };
})();

Object.defineProperty(window, 'localStorage', {value: localStorageMock});   //Override window.localStorage with the mock implementation
const ViewUserDashboard = require('../../pages/ViewUserDashboard').default; //Import the ViewUserDashboard component to be tested

//Define test suite for ViewUserDashboard component
describe('ViewUserDashboard', () => 
{
    //Run before each test
    beforeEach(() => 
    {
        jest.clearAllMocks();   //Clear all mocks to reset usage data
        
        //Reset localStorage.getItem mock implementation to return token by default
        window.localStorage.getItem.mockImplementation((key) => key === 'token' ? 'mock-token' : null);
    });

    //Test: renders user dashboard correctly with fetched data
    test('renders user dashboard with fetched data', async () => 
    {
        //Mock axios.get to resolve with user data once
        axios.get.mockResolvedValueOnce({
        data: 
        {
            firstName: 'Test', //Mocked firstName
            lastName: 'User', //Mocked lastName
            username: 'testuser', //Mocked username
            email: 'test@example.com', //Mocked email
            phone: '1234567890', //Mocked phone
            address: '123 Test St', //Mocked address
            password: '', //Mocked password (empty)
            role: 'admin', //Mocked role
        },
        });

        //Ensure localStorage.getItem returns the mock token
        window.localStorage.getItem.mockImplementation((key) => key === 'token' ? 'mock-token' : null);

        //Render the component inside a MemoryRouter to provide routing context
        render(
        <MemoryRouter>
            <ViewUserDashboard />
        </MemoryRouter>
        );

        //Find all elements containing text matching "Test" (case-insensitive)
        const testMatches = await screen.findAllByText(/Test/i);
        
        //Assert that at least one element with "Test" exists in the document
        expect(testMatches.length).toBeGreaterThan(0);

        //Find all elements containing text matching "User" (case-insensitive)
        const userMatches = await screen.findAllByText(/User/i);
        
        //Assert that at least one element with "User" exists in the document
        expect(userMatches.length).toBeGreaterThan(0);

        //Assert the username "testuser" is displayed in the document
        expect(await screen.findByText(/testuser/i)).toBeInTheDocument();
        
        //Assert the email "test@example.com" is displayed in the document
        expect(await screen.findByText(/test@example.com/i)).toBeInTheDocument();
    });

    //Test: shows error message when fetching user data fails
    test('shows error message when fetching user data fails', async () => 
    {
        //Mock axios.get to reject with an error once
        axios.get.mockRejectedValueOnce(new Error('Network Error'));

        //Render the component inside MemoryRouter
        render(
        <MemoryRouter>
            <ViewUserDashboard />
        </MemoryRouter>
        );

        //Wait for the error alert to appear and assert it contains expected text
        await waitFor(() => 
        {
            expect(screen.getByRole('alert')).toHaveTextContent(/Failed to fetch user profile/i);
        });

        //Assert axios.get was called exactly once
        expect(axios.get).toHaveBeenCalledTimes(1);
    });

    //Test: shows login prompt when no token found in localStorage
    test('shows login prompt when no token found in localStorage', async () => 
    {
        //Mock localStorage.getItem to always return null (no token)
        window.localStorage.getItem.mockImplementation(() => null);

        //Render the component inside MemoryRouter
        render(
        <MemoryRouter>
            <ViewUserDashboard />
        </MemoryRouter>
        );

        //Assert the alert with login prompt text appears in the document
        expect(await screen.findByRole('alert')).toHaveTextContent(/No token found\. Please log in\./i);
        
        //Assert axios.get was never called due to missing token
        expect(axios.get).not.toHaveBeenCalled();
  });
});