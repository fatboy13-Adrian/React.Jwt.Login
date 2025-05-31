import '@testing-library/jest-dom';                                         //Adds custom jest matchers for DOM nodes (e.g. toBeInTheDocument)
import React from "react";                                                  //Import React library
import {render, screen, fireEvent, waitFor} from "@testing-library/react";  //Import testing utilities from React Testing Library
import {BrowserRouter} from "react-router-dom";                             //Import BrowserRouter to provide routing context during tests

//Mock axios module to prevent import errors related to ESM axios in Jest environment
jest.mock('axios', () => ({
    //Mock axios.create method to return object with post as jest.fn()
    create: () => ({              
        post: jest.fn(),
    }),
    post: jest.fn(),    //Mock axios.post method as jest.fn()
}));

import Login from "../../pages/Login";                      //Import Login component to be tested
import * as AuthService from "../../services/AuthService";  //Import all exports from AuthService module

//Mock the navigate function from react-router-dom to track navigation calls
const mockedNavigate = jest.fn();   //Create a jest mock function for navigation

//Mock react-router-dom module partially
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),    //Keep all actual exports
  useNavigate: () => mockedNavigate,            //Override useNavigate hook to return our mock function
}));

//Group all tests related to Login component
describe("Login component", () => 
{
    beforeEach(() => 
    {
        jest.clearAllMocks();   //Clear all mocks before each test to avoid interference
    });

    //Test case: renders login form and submits successfully
    test("renders and submits login form", async () => 
    {
        //Spy on loginUser function and mock it to resolve with dummy login data
        jest.spyOn(AuthService, "loginUser").mockResolvedValue({
        token: "fake-token",    //Mock token string
        userId: 1,              //Mock user ID
        role: "user",           //Mock user role
        });

        render(
        <BrowserRouter> {/*Wrap component in BrowserRouter for routing context*/}
            <Login />   {/*Render the Login component*/}
        </BrowserRouter>
        );

        //Select username input field by label text (case insensitive)
        const usernameInput = screen.getByLabelText(/username/i);
        
        //Select password input field by label text (case insensitive)
        const passwordInput = screen.getByLabelText(/password/i);
        
        //Select login button by role and accessible name
        const loginButton = screen.getByRole("button", {name: /login/i});

        //Assert that username input is rendered in the document
        expect(usernameInput).toBeInTheDocument();
        
        //Assert that password input is rendered in the document
        expect(passwordInput).toBeInTheDocument();
        
        //Assert that login button is rendered in the document
        expect(loginButton).toBeInTheDocument();

        //Simulate typing "testuser" into username input
        fireEvent.change(usernameInput, {target: {value: "testuser"}});
        
        //Simulate typing "testpass" into password input
        fireEvent.change(passwordInput, {target: {value: "testpass"}});

        //Assert username input now has value "testuser"
        expect(usernameInput.value).toBe("testuser");
        
        //Assert password input now has value "testpass"
        expect(passwordInput.value).toBe("testpass");

        //Simulate click on the login button to submit form
        fireEvent.click(loginButton);

        //Wait for loginUser function to be called with expected arguments
        await waitFor(() => 
        {
            expect(AuthService.loginUser).toHaveBeenCalledWith("testuser", "testpass");
        });

        //Check that success message "Login successful" is displayed
        expect(await screen.findByText(/login successful/i)).toBeInTheDocument();
    });

    //Test case: shows error message when login fails
    test("shows error message on failed login", async () => 
    {
        //Mock loginUser to reject with an error to simulate login failure
        jest.spyOn(AuthService, "loginUser").mockRejectedValue(new Error("Login failed"));

        render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
        );

        //Simulate entering wrong username
        fireEvent.change(screen.getByLabelText(/username/i), {target: {value: "wronguser"}});

        //Simulate entering wrong password
        fireEvent.change(screen.getByLabelText(/password/i), {target: {value: "wrongpass"}});

        //Click the login button to submit form
        fireEvent.click(screen.getByRole("button", {name: /login/i}));

        //Expect error message about invalid credentials or server error to appear
        expect(await screen.findByText(/invalid credentials or server error/i)).toBeInTheDocument();
    });

    //Test case: navigates to register page on Register button click
    test("navigates to register page when Register button is clicked", () => 
    {
        render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
        );

        //Click on the Register button by its accessible name
        fireEvent.click(screen.getByRole("button", {name: /register/i}));

        //Expect mocked navigate function to be called with the register route
        expect(mockedNavigate).toHaveBeenCalledWith("/register-new-user");
    });

    //Test case: navigates to forgot password page on Forgot Password button click
    test("navigates to forgot password page when Forgot Password button is clicked", () => 
    {
        render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
        );

        //Click on the Forgot Password button by its accessible name
        fireEvent.click(screen.getByRole("button", {name: /forgot password/i}));

        //Expect mocked navigate function to be called with the forgot password route
        expect(mockedNavigate).toHaveBeenCalledWith("/forgot-login-credential");
    });

    //Test case: after successful login, navigation to dashboard happens after 5 seconds
    test("navigates to dashboard after 5 seconds on successful login", async () => 
    {
        jest.useFakeTimers();   //Use fake timers to control setTimeout

        //Mock loginUser to resolve with valid user data
        jest.spyOn(AuthService, "loginUser").mockResolvedValue({
        token: "fake-token",
        userId: 1,
        role: "user",
        });

        render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
        );

        //Simulate typing username and password
        fireEvent.change(screen.getByLabelText(/username/i), {target: {value: "testuser"}});
        fireEvent.change(screen.getByLabelText(/password/i), {target: {value: "testpass"}});
        
        //Click login button
        fireEvent.click(screen.getByRole("button", {name: /login/i}));

        //Wait for loginUser to be called successfully
        await waitFor(() => expect(AuthService.loginUser).toHaveBeenCalled());

        //Fast-forward timers by 5000 milliseconds (5 seconds)
        jest.advanceTimersByTime(5000);

        //Expect navigation to dashboard route after delay
        expect(mockedNavigate).toHaveBeenCalledWith("/dashboard");

        jest.useRealTimers();   //Restore real timers after test
    });
});