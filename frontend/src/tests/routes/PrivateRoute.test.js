import React from 'react';                              //Import React (required for JSX rendering)
import '@testing-library/jest-dom';                     //Adds custom jest matchers for DOM assertions like toBeInTheDocument() 
import {render} from '@testing-library/react';          //Import render function to render React components in a test environment
import PrivateRoute from '../../routes/PrivateRoute';   //Import the component under test
import {useAuth} from '../../context/AuthContext';      //Import the custom authentication hook to be mocked
import {Navigate} from 'react-router-dom';              //Import Navigate component from react-router-dom to be mocked

//Mock the useAuth hook from AuthContext to control authentication state in tests
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

//Mock Navigate component to prevent actual navigation during tests
//Instead, it will just record calls to it for assertions
jest.mock('react-router-dom', () => ({
  Navigate: jest.fn(() => null),
}));

//Test suite for the PrivateRoute component
describe('PrivateRoute', () => 
{
    //Clear all mock calls and instances after each test to avoid interference
    afterEach(() => 
    {
        jest.clearAllMocks();
    });

    //Test case: should render children components when user is authenticated
    it('renders children when user is authenticated', () => 
    {
        //Mock useAuth to return authenticated state
        useAuth.mockReturnValue({isAuthenticated: true});

        const childText = 'Protected Content';

        //Render PrivateRoute with some child content
        const {getByText} = render(
        <PrivateRoute>
            <div>{childText}</div>
        </PrivateRoute>
        );

        //Verify that the child content is present in the document
        expect(getByText(childText)).toBeInTheDocument();
    });

    //Test case: should redirect to /login when user is not authenticated
    it('redirects to /login when user is not authenticated', () => 
    {
        //Mock useAuth to return unauthenticated state
        useAuth.mockReturnValue({isAuthenticated: false});

        //Render PrivateRoute with some child content
        render(
        <PrivateRoute>
            <div>Protected Content</div>
        </PrivateRoute>
        );

        //Verify that Navigate was called with the redirect to /login
        expect(Navigate).toHaveBeenCalledWith({to: '/login'}, undefined);
    });

    //Test case: should render nothing (null) if no children are provided but user is authenticated
    it('renders null if no children are provided and user is authenticated', () => 
    {
        useAuth.mockReturnValue({isAuthenticated: true});

        //Render PrivateRoute with null as children
        const {container} = render(<PrivateRoute>{null}</PrivateRoute>);

        //Expect the container to be empty (no rendered content)
        expect(container.firstChild).toBeNull();
    });

    //Test case: should render multiple children properly when authenticated
    it('renders multiple children when user is authenticated', () => 
    {
        useAuth.mockReturnValue({isAuthenticated: true});

        //Render PrivateRoute with multiple child elements wrapped in React fragment
        const {getByText} = render(
        <PrivateRoute>
            <>
            <div>Child 1</div>
            <div>Child 2</div>
            </>
        </PrivateRoute>
        );

        //Verify both children are rendered
        expect(getByText('Child 1')).toBeInTheDocument();
        expect(getByText('Child 2')).toBeInTheDocument();
    });

    //Test case: should not render children when user is not authenticated
    it('does not render children when user is not authenticated', () => 
    {
        useAuth.mockReturnValue({isAuthenticated: false});

        //Render PrivateRoute with child content
        const {queryByText} = render(
        <PrivateRoute>
            <div>Should Not Render</div>
        </PrivateRoute>
        );

        //Verify that the child content is NOT rendered
        expect(queryByText('Should Not Render')).toBeNull();
    });

    //Test case: ensure Navigate is called exactly once on redirect
    it('calls Navigate exactly once when user is not authenticated', () => 
    {
        useAuth.mockReturnValue({isAuthenticated: false});

        //Render PrivateRoute which triggers redirect
        render(
        <PrivateRoute>
            <div>Protected Content</div>
        </PrivateRoute>
        );

        expect(Navigate).toHaveBeenCalledTimes(1);  //Expect Navigate to be called once
    });
});
