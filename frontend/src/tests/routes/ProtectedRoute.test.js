import React from 'react';                                  //Import React (required for JSX rendering)
import '@testing-library/jest-dom';                         //Adds custom jest matchers for DOM assertions like toBeInTheDocument()
import {render} from '@testing-library/react';              //Import the render method from the testing library to render components in tests
import ProtectedRoute from '../../routes/ProtectedRoute';   //Import the ProtectedRoute component to be tested
import {useAuth} from '../../context/AuthContext';          //Import the useAuth hook to mock authentication state
import {Navigate} from 'react-router-dom';                  //Import Navigate to simulate navigation in tests

//Mock the useAuth hook to control authentication state during tests
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),               //Mock the useAuth hook and replace its behavior with a mock function
}));

//Mock the Navigate component to avoid actual navigation during tests
jest.mock('react-router-dom', () => ({
  Navigate: jest.fn(() => null),    //Mock Navigate to prevent actual redirects and just return null
}));

describe('ProtectedRoute', () => 
{
    afterEach(() => 
    {
        jest.clearAllMocks();   //Clear mocks after each test to ensure a clean state for each test case
    });

    //Test case: should render children when user is authenticated
    it('renders children when user is authenticated', () => 
    {
        useAuth.mockReturnValue({isAuthenticated: true});   //Mock the useAuth hook to return authenticated state
        const childText = 'Protected Content';              //Define the text content to be passed as a child

        //Render ProtectedRoute with the child content
        const {getByText} = render(
        <ProtectedRoute>
            <div>{childText}</div>
        </ProtectedRoute>
        );

        expect(getByText(childText)).toBeInTheDocument();   //Verify that the child content is rendered within the ProtectedRoute component
    });

    //Test case: should redirect to /login when user is not authenticated
    it('redirects to /login when user is not authenticated', () => 
    {
        useAuth.mockReturnValue({isAuthenticated: false});  //Mock the useAuth hook to return unauthenticated state

        //Render ProtectedRoute with child content
        render(
        <ProtectedRoute>
            <div>Protected Content</div>
        </ProtectedRoute>
        );

        //Verify that Navigate is called with the /login route when the user is not authenticated
        expect(Navigate).toHaveBeenCalledWith({to: '/login', replace: true}, undefined);
    });

    //Test case: should render null when no children are provided and user is authenticated
    it('renders null when no children are provided and user is authenticated', () => 
    {
        useAuth.mockReturnValue({isAuthenticated: true});                       //Mock the useAuth hook to return authenticated state
        const {container} = render(<ProtectedRoute>{null}</ProtectedRoute>);    //Render ProtectedRoute with no children (null)
        expect(container.firstChild).toBeNull();                                //Verify that nothing is rendered when children is null (empty container)
    });

    //Test case: should render multiple children when user is authenticated
    it('renders multiple children when user is authenticated', () => 
    {
        useAuth.mockReturnValue({isAuthenticated: true});   //Mock the useAuth hook to return authenticated state

        //Render ProtectedRoute with multiple children elements
        const {getByText} = render(
        <ProtectedRoute>
            <>
            <div>Child 1</div>
            <div>Child 2</div>
            </>
        </ProtectedRoute>
        );

        //Verify that all child elements are rendered within the ProtectedRoute component
        expect(getByText('Child 1')).toBeInTheDocument();
        expect(getByText('Child 2')).toBeInTheDocument();
    });

    //Test case: should not render children when user is not authenticated
    it('does not render children when user is not authenticated', () => 
    {
        useAuth.mockReturnValue({isAuthenticated: false});      //Mock the useAuth hook to return unauthenticated state

        //Render ProtectedRoute with child content
        const {queryByText} = render(
        <ProtectedRoute>
            <div>Should Not Render</div>
        </ProtectedRoute>
        );

        expect(queryByText('Should Not Render')).toBeNull();    //Verify that child content is NOT rendered when user is unauthenticated    
    });

    //Test case: should call Navigate exactly once when user is not authenticated
    it('calls Navigate exactly once when user is not authenticated', () => 
    {
        useAuth.mockReturnValue({isAuthenticated: false});  //Mock the useAuth hook to return unauthenticated state

        //Render ProtectedRoute with child content
        render(
        <ProtectedRoute>
            <div>Protected Content</div>
        </ProtectedRoute>
        );

        expect(Navigate).toHaveBeenCalledTimes(1);          //Verify that Navigate was called exactly once to handle redirection
  });
});