import '@testing-library/jest-dom';                                             //Import custom matchers for Jest to improve DOM testing assertions

const React = require("react");                                                 //Import React library
const {render, screen, fireEvent, waitFor} = require("@testing-library/react"); //Import testing utilities from React Testing Library
const {BrowserRouter} = require("react-router-dom");                            //Import BrowserRouter for testing components that use routing

//Create a manual mock of axios with a mocked 'post' method
const mockAxios = 
{
  post: jest.fn(),
};

//Mock the 'axios' module to use the manual mock instead of the real axios
jest.mock("axios", () => mockAxios);

//Import the component under test
const RegisterNewUser = require("../../pages/RegisterNewUser").default;

//Begin test suite for the RegisterNewUser component
describe("RegisterNewUser", () => 
{

    //Reset all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    //Test that the registration form renders properly
    it("renders registration form", () => 
    {
        render(
        <BrowserRouter>
            <RegisterNewUser />
        </BrowserRouter>
        );

        //Check for heading
        expect(screen.getByText("Register New User Account")).toBeInTheDocument();

        //Check for Register button
        expect(screen.getByRole("button", {name: /register/i})).toBeInTheDocument();

        //Check for Back button
        expect(screen.getByRole("button", {name: /back/i})).toBeInTheDocument();
    });

    //Test successful form submission
    it("submits form successfully", async () => 
    {
        //Mock successful response from axios
        mockAxios.post.mockResolvedValueOnce({status: 200});

        render(
        <BrowserRouter>
            <RegisterNewUser />
        </BrowserRouter>
        );

        //Simulate user filling in the form
        fireEvent.change(screen.getByLabelText(/first name/i), {target: {value: "John"}});
        fireEvent.change(screen.getByLabelText(/last name/i), {target: {value: "Doe"}});
        fireEvent.change(screen.getByLabelText(/username/i), {target: {value: "johndoe"}});
        fireEvent.change(screen.getByLabelText(/email/i), {target: {value: "john@example.com"}});
        fireEvent.change(screen.getByLabelText(/phone/i), {target: {value: "12345678"}});
        fireEvent.change(screen.getByLabelText(/address/i), {target: {value: "123 Street"}});
        fireEvent.change(screen.getByLabelText(/password/i), {target: {value: "password123"}});
        fireEvent.change(screen.getByLabelText(/role/i), {target: {value: "User"}});

        //Simulate clicking the register button
        fireEvent.click(screen.getByRole("button", {name: /register/i}));

        //Wait for success message to appear
        await waitFor(() => 
        {
            expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
        });
    });

    //Test error when registration fails due to duplicate user (status 409)
    it("shows error when registration fails with 409", async () => {
        //Mock 409 error response from axios
        mockAxios.post.mockRejectedValueOnce({
        response: {status: 409},
        });

        render(
        <BrowserRouter>
            <RegisterNewUser />
        </BrowserRouter>
        );

        //Simulate user input
        fireEvent.change(screen.getByLabelText(/first name/i), {target: {value: "Jane"}});
        fireEvent.change(screen.getByLabelText(/last name/i), {target: {value: "Smith"}});
        fireEvent.change(screen.getByLabelText(/username/i), {target: {value: "janesmith"}});
        fireEvent.change(screen.getByLabelText(/email/i), {target: {value: "jane@example.com"}});
        fireEvent.change(screen.getByLabelText(/phone/i), {target: {value: "98765432"}});
        fireEvent.change(screen.getByLabelText(/address/i), {target: {value: "456 Avenue"}});
        fireEvent.change(screen.getByLabelText(/password/i), {target: {value: "password456"}});
        fireEvent.change(screen.getByLabelText(/role/i), {target: {value: "Admin"}});

        //Trigger form submission
        fireEvent.click(screen.getByRole("button", {name: /register/i}));

        //Check that duplicate error message is shown
        await waitFor(() => 
        {
            expect(screen.getByText(/user with this email or username already exists/i)).toBeInTheDocument();
        });
    });

    //Test error when there's no response from the server
    it("shows network error when no response from server", async () => 
    {
        //Mock a network error (no response object)
        mockAxios.post.mockRejectedValueOnce(new Error("Network error"));

        render(
        <BrowserRouter>
            <RegisterNewUser />
        </BrowserRouter>
        );

        //Fill out form
        fireEvent.change(screen.getByLabelText(/first name/i), {target: {value: "Alice"}});
        fireEvent.change(screen.getByLabelText(/last name/i), {target: {value: "Walker"}});
        fireEvent.change(screen.getByLabelText(/username/i), {target: {value: "alicewalker"}});
        fireEvent.change(screen.getByLabelText(/email/i), {target: {value: "alice@example.com"}});
        fireEvent.change(screen.getByLabelText(/phone/i), {target: {value: "1231231234"}});
        fireEvent.change(screen.getByLabelText(/address/i), {target: {value: "789 Road"}});
        fireEvent.change(screen.getByLabelText(/password/i), {target: {value: "securepass"}});
        fireEvent.change(screen.getByLabelText(/role/i), {target: {value: "User"}});

        //Submit form
        fireEvent.click(screen.getByRole("button", {name: /register/i}));

        //Wait for network error message
        await waitFor(() => 
        {
            expect(screen.getByText(/network error/i)).toBeInTheDocument();
        });
    });

    //Test error handling for unknown server error (e.g. 500 Internal Server Error)
    it("shows generic error message when unknown server error occurs", async () => 
    {
        //Mock 500 server error response
        mockAxios.post.mockRejectedValueOnce({
        response: {
            status: 500,
            statusText: "Internal Server Error"
        }
        });

        render(
        <BrowserRouter>
            <RegisterNewUser />
        </BrowserRouter>
        );

        //Fill form with data
        fireEvent.change(screen.getByLabelText(/first name/i), {target: {value: "Tom"}});
        fireEvent.change(screen.getByLabelText(/last name/i), {target: {value: "Hardy"}});
        fireEvent.change(screen.getByLabelText(/username/i), {target: {value: "tomhardy"}});
        fireEvent.change(screen.getByLabelText(/email/i), {target: {value: "tom@example.com"}});
        fireEvent.change(screen.getByLabelText(/phone/i), {target: {value: "99999999"}});
        fireEvent.change(screen.getByLabelText(/address/i), {target: {value: "1 Hollywood Blvd"}});
        fireEvent.change(screen.getByLabelText(/password/i), {target: {value: "actorpass"}});
        fireEvent.change(screen.getByLabelText(/role/i), {target: {value: "Admin"}});

        //Click register
        fireEvent.click(screen.getByRole("button", {name: /register/i}));

        //Assert generic error message is displayed
        await waitFor(() => 
        {
            expect(screen.getByText(/error: 500 - internal server error/i)).toBeInTheDocument();
        });
    });

    //Test for displaying custom error message returned from backend (e.g. validation)
    it("shows custom error message from backend", async () => 
    {
        //Mock custom error message in response
        mockAxios.post.mockRejectedValueOnce({
        response: 
        {
            status: 400,
            data: {message: "Custom backend validation failed."}
        }
        });

        render(
        <BrowserRouter>
            <RegisterNewUser />
        </BrowserRouter>
        );

        //Fill in form
        fireEvent.change(screen.getByLabelText(/first name/i), {target: {value: "Sam"}});
        fireEvent.change(screen.getByLabelText(/last name/i), {target: {value: "Green"}});
        fireEvent.change(screen.getByLabelText(/username/i), {target: {value: "samgreen"}});
        fireEvent.change(screen.getByLabelText(/email/i), {target: {value: "sam@example.com"}});
        fireEvent.change(screen.getByLabelText(/phone/i), {target: {value: "12345678"}});
        fireEvent.change(screen.getByLabelText(/address/i), {target: {value: "789 Lane"}});
        fireEvent.change(screen.getByLabelText(/password/i), {target: {value: "pass1234"}});
        fireEvent.change(screen.getByLabelText(/role/i), {target: {value: "User"}});

        //Submit the form
        fireEvent.click(screen.getByRole("button", {name: /register/i}));

        //Expect custom backend message
        await waitFor(() => 
        {
            expect(screen.getByText(/custom backend validation failed/i)).toBeInTheDocument();
        });
  });
});