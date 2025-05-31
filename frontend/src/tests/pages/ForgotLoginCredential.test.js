import '@testing-library/jest-dom';                                               //Adds custom jest matchers for DOM assertions
import React from "react";                                                        //Import React (required for JSX rendering)
import {render, fireEvent, waitFor, screen, act} from "@testing-library/react";   //Import testing utilities from React Testing Library
import ForgotLoginCredential from "../../pages/ForgotLoginCredential";            //Import the component to test

//Create a mock function to simulate the navigation hook from react-router-dom
const mockedUsedNavigate = jest.fn();

//Mock the react-router-dom module, overriding only useNavigate to use our mock function
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),  //Keep other functionalities intact
  useNavigate: () => mockedUsedNavigate,      //Replace useNavigate with mocked function
}));

jest.useFakeTimers(); //Use Jest's fake timers to control timing functions like setTimeout

describe("ForgotLoginCredential component", () => 
{
  //Runs before each test in this suite
  beforeEach(() => 
  {
    mockedUsedNavigate.mockClear(); //Reset mock call count and history for navigation
    global.fetch = jest.fn();       //Mock global fetch to intercept API calls
  });

  //Runs after each test in this suite
  afterEach(() => 
  {
    jest.clearAllTimers();  //Clear any pending timers to avoid leaks between tests
    jest.clearAllMocks();   //Reset all mocks to clean state
  });

  //Test to verify that all expected inputs and buttons render
  test("renders all input fields and buttons", () => 
  {
    render(<ForgotLoginCredential />);  //Render the component

    //Assert that email input with label containing "Email (required)" is present
    expect(screen.getByLabelText(/Email \(required\)/i)).toBeInTheDocument();

    //Assert that new username input with label "New Username (optional)" is present
    expect(screen.getByLabelText(/New Username \(optional\)/i)).toBeInTheDocument();

    //Assert that new password input with label "New Password (optional)" is present
    expect(screen.getByLabelText(/New Password \(optional\)/i)).toBeInTheDocument();

    //Assert that Reset button is rendered
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();

    //Assert that Back button is rendered
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  //Test that clicking Back button triggers navigation to "/login"
  test("clicking Back button calls navigate('/login')", () => 
  {
    render(<ForgotLoginCredential />); //Render the component

    const backButton = screen.getByRole('button', { name: /back/i }); //Find Back button
    fireEvent.click(backButton); //Simulate user click

    //Verify navigate was called with the "/login" route
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/login');
  });

  //Test validation error: submitting form without email input should show error and no fetch call
  test("displays error when submitting without email", async () => 
  {
    render(<ForgotLoginCredential />); //Render component

    const resetButton = screen.getByRole('button', { name: /reset/i }); //Find Reset button

    fireEvent.click(resetButton); //Simulate click without filling email

    //Wait for the error message about email requirement to appear
    expect(await screen.findByText(/Email is required/i)).toBeInTheDocument();

    //Verify that fetch was never called since validation failed
    expect(global.fetch).not.toHaveBeenCalled();
  });

  //Test successful form submission flow: success message, inputs/buttons disabled, and redirect after delay
  test("successful form submission shows success message and disables inputs/buttons", async () => 
  {
    const successMessage = "Credentials reset successful! Redirecting to login...";

    //Mock fetch to resolve with a successful response and message
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: successMessage }),
    });

    render(<ForgotLoginCredential />); //Render component

    //Simulate filling email input with valid value
    fireEvent.change(screen.getByLabelText(/Email \(required\)/i), {target: {value: "user@example.com"}});
    
    //Simulate filling optional username input
    fireEvent.change(screen.getByLabelText(/New Username \(optional\)/i), {target: {value: "newuser"}});
    
    //Simulate filling optional password input
    fireEvent.change(screen.getByLabelText(/New Password \(optional\)/i), {target: {value: "newpassword"}});

    const resetButton = screen.getByRole('button', {name: /reset/i}); //Find Reset button
    fireEvent.click(resetButton);                                     //Click Reset to submit form

    //Immediately after click, Reset button should be disabled
    expect(resetButton).toBeDisabled();
    
    //Button text changes to indicate processing
    expect(resetButton).toHaveTextContent(/Processing.../i);

    //Wait for the success message to appear in the document
    expect(await screen.findByText(successMessage)).toBeInTheDocument();

    //After success, all inputs should be disabled
    expect(screen.getByLabelText(/Email \(required\)/i)).toBeDisabled();
    expect(screen.getByLabelText(/New Username \(optional\)/i)).toBeDisabled();
    expect(screen.getByLabelText(/New Password \(optional\)/i)).toBeDisabled();
    expect(resetButton).toBeDisabled(); //Reset button remains disabled

    //Advance Jest timers by 5 seconds to simulate redirect delay
    act(() => 
    {
      jest.advanceTimersByTime(5000);
    });

    //Confirm navigation to "/login" after delay
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/login");
  });

  //Test failed form submission: shows error message and re-enables inputs/buttons
  test("failed form submission shows error message and re-enables inputs/buttons", async () => 
  {
    const errorMessage = "Reset failed. Please try again";

    //Mock fetch to return an error response with message
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({message: errorMessage}),
    });

    render(<ForgotLoginCredential />);  //Render component

    //Fill in required email input
    fireEvent.change(screen.getByLabelText(/Email \(required\)/i), {target: {value: "user@example.com"}});

    const resetButton = screen.getByRole('button', { name: /reset/i});  //Find Reset button
    fireEvent.click(resetButton); //Click to submit

    //Reset button should be disabled during processing
    expect(resetButton).toBeDisabled();

    //Button text indicates processing
    expect(resetButton).toHaveTextContent(/Processing.../i);

    //Wait for error message to appear after fetch failure
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();

    //Inputs and Reset button should be enabled again to allow retry
    expect(screen.getByLabelText(/Email \(required\)/i)).not.toBeDisabled();
    expect(resetButton).not.toBeDisabled();
  });

  //Test network error case: shows generic error and re-enables inputs/buttons
  test("network error during submission shows generic error message", async () => 
  {
    //Mock fetch to reject with a network error
    global.fetch.mockRejectedValueOnce(new Error("Network error"));
    render(<ForgotLoginCredential />); //Render component

    //Fill email input
    fireEvent.change(screen.getByLabelText(/Email \(required\)/i), {target: {value: "user@example.com"}});

    const resetButton = screen.getByRole('button', {name: /reset/i}); //Find Reset button
    fireEvent.click(resetButton); //Submit form

    //Button disabled during processing
    expect(resetButton).toBeDisabled();
    expect(resetButton).toHaveTextContent(/Processing.../i);

    //Wait for generic network error message to appear
    expect(await screen.findByText(/Network or server error/i)).toBeInTheDocument();

    //Inputs and button should be enabled again after error
    expect(screen.getByLabelText(/Email \(required\)/i)).not.toBeDisabled();
    expect(resetButton).not.toBeDisabled();
  });

  //Test that inputs and buttons are disabled while loading (fetch pending)
  test("inputs and buttons disabled while loading", async () => 
  {
    //Create a promise to control when fetch resolves
    let resolveFetch;
    global.fetch.mockImplementationOnce(() => new Promise(resolve => (resolveFetch = resolve)));
    render(<ForgotLoginCredential />); //Render component

    //Fill in required email input
    fireEvent.change(screen.getByLabelText(/Email \(required\)/i), {target: {value: "user@example.com"}});
    const resetButton = screen.getByRole('button', {name: /reset/i}); //Find Reset button
    fireEvent.click(resetButton);                                     //Click Reset to start submission

    //During fetch pending, inputs and buttons must be disabled
    expect(resetButton).toBeDisabled();
    expect(resetButton).toHaveTextContent(/Processing.../i);
    expect(screen.getByLabelText(/Email \(required\)/i)).toBeDisabled();
    expect(screen.getByLabelText(/New Username \(optional\)/i)).toBeDisabled();
    expect(screen.getByLabelText(/New Password \(optional\)/i)).toBeDisabled();

    //Resolve fetch promise to end loading state
    await act(async () => 
    {
      resolveFetch({
        ok: true,
        json: async () => ({message: "OK"}),
      });
    });
  });
});