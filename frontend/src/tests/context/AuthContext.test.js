import '@testing-library/jest-dom';                             //Import jest-dom for extended DOM matchers
import React from "react";                                      //Import React (required for JSX)
import {render, screen, act} from "@testing-library/react";     //Import testing utilities from React Testing Library
import axios from "axios";                                      //Import axios for mocking HTTP requests

//Import all from AuthContext module
import {AuthProvider, useAuth, isTokenExpired, setAuthHeaders, clearAuthHeaders, initializeAuthState, login, logout} from "../../context/AuthContext";  

//Mock axios defaults to prevent real HTTP calls during tests
jest.mock("axios", () => ({
  defaults:                 //Mock default headers object
  {                                             
    headers: {common: {}},  //Common headers initialized as empty object
  },
}));

//Group of tests related to Auth Context utilities
describe("Auth Context Utilities", () => 
{
    //Cleanup after each test
    afterEach(() => 
    {
        localStorage.clear();               //Clear localStorage after each test
        jest.clearAllMocks();               //Reset all mocks to avoid leakage between tests
        axios.defaults.headers.common = {}; //Reset axios common headers to empty object
    });

    //Tests for isTokenExpired function
    describe("isTokenExpired", () => 
    {
        it("returns true for an expired token", () => 
        {
            //Create an expired token with an expiration date in the past
            const expiredTimestamp = Math.floor(new Date("2000-01-01").getTime() / 1000);
            const expiredPayload = btoa(JSON.stringify({exp: expiredTimestamp}));   //Encode expiry in base64
            const token = `header.${expiredPayload}.signature`;                     //Construct fake JWT
            expect(isTokenExpired(token)).toBe(true);                               //Expect function to detect expiry
        });

        it("returns false for a valid (non-expired) token", () => 
        {
            //Create a valid token with a far future expiration date
            const futureTimestamp = Math.floor(new Date("3000-01-01").getTime() / 1000);
            const validPayload = btoa(JSON.stringify({exp: futureTimestamp}));  //Encode expiry in base64
            const token = `header.${validPayload}.signature`;                   //Construct fake JWT
            expect(isTokenExpired(token)).toBe(false);                          //Expect function to detect valid token
        });

        it("returns true for invalid token format", () => 
        {
            const invalidToken = "invalid.token";                                //Invalid JWT format
            expect(isTokenExpired(invalidToken)).toBe(true);                     //Should treat invalid as expired
        });
    });

    //Tests for setAuthHeaders and clearAuthHeaders utilities
    describe("setAuthHeaders and clearAuthHeaders", () => 
    {
        it("sets Authorization header correctly", () => 
        {
            setAuthHeaders("test-token");                                                   //Set auth header with token
            expect(axios.defaults.headers.common.Authorization).toBe("Bearer test-token");  //Verify header set
        });

        it("clears Authorization header correctly", () => 
        {
            axios.defaults.headers.common.Authorization = "Bearer test-token";      //Manually set header
            clearAuthHeaders();                                                     //Clear header using utility
            expect(axios.defaults.headers.common.Authorization).toBeUndefined();    //Verify header is cleared
        });
    });

    //Tests for initializeAuthState utility
    describe("initializeAuthState", () => 
    {
        it("sets authenticated state and axios header if valid token exists", () => 
        {
            //Prepare a valid token with future expiry
            const futureExp = Math.floor(new Date("3000-01-01").getTime() / 1000);
            const validPayload = btoa(JSON.stringify({exp: futureExp}));
            const token = `header.${validPayload}.signature`;
            localStorage.setItem("token", token);                                           //Store token in localStorage
            const setIsAuthenticatedMock = jest.fn();                                       //Mock setIsAuthenticated function
            initializeAuthState(setIsAuthenticatedMock);                                    //Initialize auth state
            expect(setIsAuthenticatedMock).toHaveBeenCalledWith(true);                      //Should call setIsAuthenticated(true)
            expect(axios.defaults.headers.common.Authorization).toBe(`Bearer ${token}`);    //Axios header should be set
        });

        it("does not authenticate if no token exists", () => 
        {
            const setIsAuthenticatedMock = jest.fn();                               //Mock setIsAuthenticated function
            initializeAuthState(setIsAuthenticatedMock);                            //Run with no token set
            expect(setIsAuthenticatedMock).not.toHaveBeenCalled();                  //Should not call setIsAuthenticated
            expect(axios.defaults.headers.common.Authorization).toBeUndefined();    //Axios header remains undefined
        });

        it("does not authenticate if token is expired", () => 
        {
            //Prepare an expired token with past expiry
            const pastExp = Math.floor(new Date("2000-01-01").getTime() / 1000);
            const expiredPayload = btoa(JSON.stringify({exp: pastExp}));
            const token = `header.${expiredPayload}.signature`;
            localStorage.setItem("token", token);                                   //Store expired token
            const setIsAuthenticatedMock = jest.fn();                               //Mock setIsAuthenticated
            initializeAuthState(setIsAuthenticatedMock);                            //Initialize auth state
            expect(setIsAuthenticatedMock).not.toHaveBeenCalled();                  //Should not authenticate
            expect(axios.defaults.headers.common.Authorization).toBeUndefined();    //Axios header should be cleared
        });
    });

    //Tests for login utility
    describe("login", () => 
    {
        it("updates user, isAuthenticated, localStorage, and axios header", () => 
        {
            const setUserMock = jest.fn();              //Mock setUser function
            const setIsAuthenticatedMock = jest.fn();   //Mock setIsAuthenticated function
            const userData = 
            {
                token: "token123",  //Example token
                role: "admin",      //User role
                name: "Test User",  //User name
            };

            login(userData, setUserMock, setIsAuthenticatedMock);                                   //Call login utility
            expect(setUserMock).toHaveBeenCalledWith(userData);                                     //Should set user data
            expect(setIsAuthenticatedMock).toHaveBeenCalledWith(true);                              //Should set authenticated true
            expect(localStorage.getItem("token")).toBe(userData.token);                             //Token should be saved in localStorage
            expect(localStorage.getItem("role")).toBe(userData.role);                               //Role should be saved in localStorage
            expect(axios.defaults.headers.common.Authorization).toBe(`Bearer ${userData.token}`);   //Axios header set
        });
    });

    //Tests for logout utility
    describe("logout", () => 
    {
        it("clears user, isAuthenticated, localStorage, and axios header", () => 
        {
            const setUserMock = jest.fn();                                          //Mock setUser function
            const setIsAuthenticatedMock = jest.fn();                               //Mock setIsAuthenticated function
            localStorage.setItem("token", "token123");                              //Setup token in localStorage
            localStorage.setItem("role", "admin");                                  //Setup role in localStorage
            axios.defaults.headers.common.Authorization = "Bearer token123";        //Setup axios header
            logout(setUserMock, setIsAuthenticatedMock);                            //Call logout utility
            expect(setUserMock).toHaveBeenCalledWith(null);                         //Should clear user state
            expect(setIsAuthenticatedMock).toHaveBeenCalledWith(false);             //Should set authenticated false
            expect(localStorage.getItem("token")).toBeNull();                       //Token removed from localStorage
            expect(localStorage.getItem("role")).toBeNull();                        //Role removed from localStorage
            expect(axios.defaults.headers.common.Authorization).toBeUndefined();    //Axios header cleared
        });
    });
    });

    //Tests for AuthProvider component and useAuth hook integration
    describe("AuthProvider and useAuth Hook", () => 
    {
        //Test component to use the auth context and expose auth state and actions
        const TestComponent = () => 
        {
            const {isAuthenticated, user, login, logout} = useAuth();   //Use auth context hook

            return (
            <div>
                <div>Authenticated: {isAuthenticated ? "Yes" : "No"}</div>  {/*Show auth state*/}
                <div>User: {user ? user.name : "None"}</div>                {/*Show user name or None*/}
                <button
                onClick={() => login({token: "token123", role: "admin", name: "Jane"})}
                >
                Login
                </button>                                                   {/*Button to trigger login*/}
                <button onClick={logout}>Logout</button>                    {/*Button to trigger logout*/}
            </div>
            );
    };

    //Cleanup after each test in this block
    afterEach(() => 
    {
        localStorage.clear();               //Clear localStorage
        jest.clearAllMocks();               //Reset mocks
        axios.defaults.headers.common = {}; //Reset axios headers
    });

    it("provides initial state as unauthenticated", () => 
    {
        render(
        <AuthProvider>
            <TestComponent />   //Render TestComponent inside AuthProvider
        </AuthProvider>
        );

        expect(screen.getByText("Authenticated: No")).toBeInTheDocument();  //Expect initial auth to be false
        expect(screen.getByText("User: None")).toBeInTheDocument();         //Expect no user initially
    });

    it("login updates auth state, localStorage, and axios headers", () => 
    {
        render(
        <AuthProvider>
            <TestComponent />   //Render TestComponent inside AuthProvider
        </AuthProvider>
        );

        const loginButton = screen.getByText("Login");  //Find login button
        act(() => 
        {
            loginButton.click();                        //Click login button inside act to flush updates
        });

        expect(screen.getByText("Authenticated: Yes")).toBeInTheDocument();             //Authenticated should now be true
        expect(screen.getByText("User: Jane")).toBeInTheDocument();                     //User name should be "Jane"
        expect(localStorage.getItem("token")).toBe("token123");                         //Token saved in localStorage
        expect(localStorage.getItem("role")).toBe("admin");                             //Role saved in localStorage
        expect(axios.defaults.headers.common.Authorization).toBe("Bearer token123");    //Axios header set
    });

    it("logout clears auth state, localStorage, and axios headers", () => 
    {
        render(
        <AuthProvider>
            <TestComponent />   //Render TestComponent inside AuthProvider
        </AuthProvider>
        );

        //Perform login first to set auth state
        const loginButton = screen.getByText("Login");
        act(() =>
        {
            loginButton.click();    //Click login button to authenticate
        });

        //Then logout
        const logoutButton = screen.getByText("Logout");
        act(() => 
        {
            logoutButton.click();   //Click logout button inside act
        });

        expect(screen.getByText("Authenticated: No")).toBeInTheDocument();      //Auth state cleared
        expect(screen.getByText("User: None")).toBeInTheDocument();             //User cleared
        expect(localStorage.getItem("token")).toBeNull();                       //Token removed from localStorage
        expect(localStorage.getItem("role")).toBeNull();                        //Role removed from localStorage
        expect(axios.defaults.headers.common.Authorization).toBeUndefined();    //Axios header cleared
    });

    it("initializes authenticated state on mount if valid token exists", () => 
    {
        //Create a valid token with a far future expiry
        const futureExp = Math.floor(new Date("3000-01-01").getTime() / 1000);
        const validPayload = btoa(JSON.stringify({exp: futureExp}));
        const token = `header.${validPayload}.signature`;
        localStorage.setItem("token", token);   //Set token in localStorage
        localStorage.setItem("role", "admin");  //Set role in localStorage

        render(
        <AuthProvider>
            <TestComponent />   //Render TestComponent inside AuthProvider
        </AuthProvider>
        );

        //Auth should be initialized to true and user loaded from localStorage
        expect(screen.getByText("Authenticated: Yes")).toBeInTheDocument();
        expect(localStorage.getItem("token")).toBe(token);
        expect(axios.defaults.headers.common.Authorization).toBe(`Bearer ${token}`);
    });
});