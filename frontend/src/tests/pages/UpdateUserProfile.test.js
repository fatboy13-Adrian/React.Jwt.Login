import '@testing-library/jest-dom';                                             //Extends jest matchers to include DOM-specific assertions
import React from 'react';                                                      //Import React (required for JSX rendering)
import {render, screen, fireEvent, waitFor, act} from '@testing-library/react'; //Testing utilities
import {MemoryRouter, Route, Routes} from 'react-router-dom';                   //For simulating routing in tests
import UpdateUserProfile from '../../pages/UpdateUserProfile';                  //Component under test
import axios from 'axios';                                                      //HTTP client to be mocked

//Mock axios methods to control API responses during tests
jest.mock('axios', () => ({
  //Mock GET request to resolve with fake user data
  get: jest.fn().mockResolvedValue({
    data: 
    {
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      email: 'test@example.com',
      phone: '1234567890',
      address: '123 Test St',
      password: '',
      role: 'admin',
    },
  }),

  //Mock PATCH request to resolve with empty success response
  patch: jest.fn().mockResolvedValue({data: {}}),
}));

//Mock Button component to simplify and isolate testing of UpdateUserProfile
jest.mock('../../components/Button', () => 
{
  const React = require('react');

  //Just render a native button element passing all props and children
  return (props) => React.createElement('button', props, props.children);
});

//Mock TextField component to simulate labeled input fields
jest.mock('../../components/TextField', () => 
{
  const React = require('react');

  //Render label + input, forwarding name and other props to input for onChange handling
  return ({label, id, name, value, onChange, type = 'text'}) => (
    React.createElement('div', null, [
      React.createElement(
        'label',
        {key: 'label', htmlFor: id},
        label
      ),
        React.createElement('input', 
        {
            key: 'input',
            id,
            name,
            type,
            value,
            onChange,
            'aria-label': label, //accessibility for queries
        }),
        ])
  );
});

//Mock SelectRole component simulating a role selector dropdown
jest.mock('../../components/SelectRole', () => 
{
  const React = require('react');
  
  //Render a label + select with options Admin/User, forwarding props for controlled input
  return ({id, name, value, onChange}) => (
    React.createElement('div', null, [
      React.createElement(
        'label',
        {key: 'label', htmlFor: id},
        'Role'
      ),
      React.createElement(
        'select',
        {
          key: 'select',
          id,
          name,
          value,
          onChange,
          'aria-label': 'Role', //accessibility label for queries
        },
        React.createElement('option', {value: 'admin'}, 'Admin'),
        React.createElement('option', {value: 'user'}, 'User')
      ),
    ])
  );
});

describe('UpdateUserProfile', () => 
{
    //Helper function to render UpdateUserProfile wrapped in router with initial location state
    const renderWithState = (state) => 
    {
        return render(
        <MemoryRouter
            initialEntries={[
            {
                pathname: '/users/123', //route to user profile with ID 123
                state,                  //pass in auth/token info via location.state
            },
            ]}
        >
            <Routes>
            <Route path="/users/:userId" element={<UpdateUserProfile />} />
            <Route path="/login" element={<div>Login Page</div>} />         {/*Mock login page route*/}
            <Route path="/" element={<div>Home Page</div>} />               {/*Mock home page route*/}
            <Route path="/dashboard" element={<div>Dashboard Page</div>} /> {/*Mock dashboard route*/}
            </Routes>
        </MemoryRouter>
        );
    };

    //Reset mocks before each test and set default axios mock responses
    beforeEach(() => 
    {
        jest.clearAllMocks();
        axios.get.mockResolvedValue({
        data: 
        {
            firstName: 'Test',
            lastName: 'User',
            username: 'testuser',
            email: 'test@example.com',
            phone: '1234567890',
            address: '123 Test St',
            password: '',
            role: 'admin',
        },
        });
        axios.patch.mockResolvedValue({data: {}});
    });

    test('renders form with initial data and updates user profile', async () => 
    {
        const state = 
        {
            token: 'fake-token',    //simulate logged in user token
            currentUserId: 123,
            currentUserRole: 'ADMIN',
        };

        //Render component within act to handle all async React updates
        await act(async () => 
        {
            renderWithState(state);
        });

        //Assert axios.get called with correct URL and auth header
        expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/users/123',
        expect.objectContaining({
            headers: {Authorization: 'Bearer fake-token'},
        })
        );

        //Wait for form inputs and Role select to be populated with fetched data
        await waitFor(() => 
        {
            expect(screen.getByLabelText('First Name')).toHaveValue('Test');
            expect(screen.getByLabelText('Last Name')).toHaveValue('User');
            expect(screen.getByLabelText('Username')).toHaveValue('testuser');
            expect(screen.getByLabelText('Email')).toHaveValue('test@example.com');
            expect(screen.getByLabelText('Phone')).toHaveValue('1234567890');
            expect(screen.getByLabelText('Address')).toHaveValue('123 Test St');
            expect(screen.getByLabelText('Role')).toHaveValue('admin');
        });

        //Simulate user changing First Name and Role
        fireEvent.change(screen.getByLabelText('First Name'), 
        {
            target: {name: 'firstName', value: 'NewFirst'},
        });

        fireEvent.change(screen.getByLabelText('Role'), 
        {
            target: {name: 'role', value: 'user'},
        });

        //Simulate clicking the "Update" button
        fireEvent.click(screen.getByRole('button', {name: /update/i}));

        //Wait and assert axios.patch called with only changed fields and auth headers
        await waitFor(() => 
        {
            expect(axios.patch).toHaveBeenCalledWith(
                'http://localhost:8080/users/123',
                expect.objectContaining({
                firstName: 'NewFirst',
                role: 'user',
                }),
                expect.objectContaining({
                headers: {Authorization: 'Bearer fake-token'},
                })
            );
        });
    });

    test('does not call patch if no changes were made', async () => 
    {
        const state = 
        {
            token: 'fake-token',
            currentUserId: 123,
            currentUserRole: 'ADMIN',
        };

        //Render component
        await act(async () => 
        {
            renderWithState(state);
        });

        //Wait for initial data to load in First Name field
        await waitFor(() =>
        expect(screen.getByLabelText('First Name')).toHaveValue('Test')
        );

        //Click "Update" without changing any field
        fireEvent.click(screen.getByRole('button', {name: /update/i}));

        //Assert axios.patch was never called as no data changed
        expect(axios.patch).not.toHaveBeenCalled();
    });

    test('redirects to login page if no token is present', async () => 
    {
        //Render with empty location.state simulating no auth token
        await act(async () => 
        {
            renderWithState({});
        });

        //Expect to see the mock login page content (redirect occurred)
        expect(await screen.findByText('Login Page')).toBeInTheDocument();
    });

    test('redirects to home if user not authorized to edit another profile', async () => 
    {
        const state = 
        {
            token: 'fake-token',
            currentUserId: 999,         //different user ID from URL param 123
            currentUserRole: 'USER',    //non-admin user
        };

        await act(async () => 
        {
            renderWithState(state);
        });

        //Because currentUserId !== userId param and role is USER (not admin),
        //user is unauthorized, so component redirects to home page
        expect(await screen.findByText('Home Page')).toBeInTheDocument();
    });

    test('non-admin cannot change the role field', async () => 
    {
        const state = 
        {
            token: 'fake-token',
            currentUserId: 123,
            currentUserRole: 'USER',    //not admin
        };

        await act(async () => 
        {
            renderWithState(state);
        });

        //Wait for data load
        await waitFor(() =>
        expect(screen.getByLabelText('First Name')).toHaveValue('Test')
        );

        //The "Role" dropdown should NOT be rendered for non-admin users
        expect(screen.queryByLabelText('Role')).not.toBeInTheDocument();
    });

    test('admin can change the role field', async () => 
    {
        const state = 
        {
            token: 'fake-token',
            currentUserId: 999, //admin editing another user
            currentUserRole: 'ADMIN',
        };

        await act(async () => 
        {
            renderWithState(state);
        });

        //Wait for form data to load
        await waitFor(() =>
        expect(screen.getByLabelText('First Name')).toHaveValue('Test')
        );

        //The Role dropdown should be present and enabled for admins
        const roleSelect = screen.getByLabelText('Role');
        expect(roleSelect).toBeInTheDocument();
        expect(roleSelect).toBeEnabled();
    });

    test('cancel button navigates back to dashboard if editing another user', async () => 
    {
        const state = 
        {
            token: 'fake-token',
            currentUserId: 999, //admin editing another user's profile
            currentUserRole: 'ADMIN',
        };

        await act(async () => 
        {
            renderWithState(state);
        });

        //Wait for form to load
        await waitFor(() =>
        expect(screen.getByLabelText('First Name')).toHaveValue('Test')
        );

        //Click the "Cancel" button
        fireEvent.click(screen.getByRole('button', {name: /cancel/i}));

        //Expect redirect to dashboard page
        expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
    });

    test('cancel button navigates back to home if editing own profile', async () => 
    {
        const state = 
        {
            token: 'fake-token',
            currentUserId: 123,
            currentUserRole: 'USER',    //editing own profile
        };

        await act(async () => 
        {
            renderWithState(state);
        });

        await waitFor(() =>
        expect(screen.getByLabelText('First Name')).toHaveValue('Test')
        );

        //Click "Cancel" button
        fireEvent.click(screen.getByRole('button', {name: /cancel/i}));

        //Expect redirect to home page
        expect(await screen.findByText('Home Page')).toBeInTheDocument();
    });

    test('shows an error message if initial fetch fails', async () => 
    {
        //Make axios.get reject once to simulate fetch failure
        axios.get.mockRejectedValueOnce(new Error('Fetch failed'));

        const state = 
        {
            token: 'fake-token',
            currentUserId: 123,
            currentUserRole: 'ADMIN',
        };

        await act(async () => 
        {
            renderWithState(state);
        });

        //Expect error message shown on screen
        expect(
        await screen.findByText('Failed to load user data.')
        ).toBeInTheDocument();
    });

    test('alerts when patch call fails', async () => 
    {
        //Make axios.patch reject once with error message
        axios.patch.mockRejectedValueOnce({
        response: {data: {message: 'Failed to update user.'}},
        });

        const state = 
        {
            token: 'fake-token',
            currentUserId: 123,
            currentUserRole: 'ADMIN',
        };

        //Mock window.alert to spy on calls
        window.alert = jest.fn();

        await act(async () => 
        {
            renderWithState(state);
        });

        await waitFor(() =>
        expect(screen.getByLabelText('First Name')).toHaveValue('Test')
        );

        //Change First Name to trigger patch call
        fireEvent.change(screen.getByLabelText('First Name'), 
        {
            target: {name: 'firstName', value: 'AnotherName'},
        });
        fireEvent.click(screen.getByRole('button', {name: /update/i}));

        await waitFor(() => 
        {
            expect(window.alert).toHaveBeenCalledWith('Failed to update user.');
        });
    });
});