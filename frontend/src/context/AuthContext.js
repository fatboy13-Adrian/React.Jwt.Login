import React, {createContext, useState, useEffect, useContext} from 'react';    //Import React hooks and context API
import axios from 'axios';                                                      //Import axios for making HTTP requests

//Create an authentication context to share auth state across components
const AuthContext = createContext();  

//Helper function to check if a JWT token is expired
const isTokenExpired = (token) => 
{
  try
  {
    //Decode the JWT token and extract the expiry time
    const decoded = JSON.parse(atob(token.split('.')[1])); 
    
    //Compare the expiry time with the current time (converted to milliseconds)
    return decoded.exp * 1000 < Date.now();
  } 
  
  catch(error) 
  {
    return true;  //If decoding fails (invalid token), treat it as expired
  }
};

//Set the Authorization header for all Axios requests with the provided token
const setAuthHeaders = (token) => 
{
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; //Set the token in the Authorization header
};

//Remove the Authorization header from Axios (for logout or token expiry)
const clearAuthHeaders = () => 
{
  delete axios.defaults.headers.common['Authorization'];  //Remove the Authorization header
};

//Check for a valid token on initial load and set authentication state accordingly
const initializeAuthState = (setIsAuthenticated) => 
{
  const token = localStorage.getItem('token');  //Retrieve the token from localStorage
  if(token && !isTokenExpired(token))           //If the token is valid (not expired)
  {  
    setAuthHeaders(token);                      //Set the token for future requests
    setIsAuthenticated(true);                   //Mark user as authenticated
  }
};

//Handle user login: update state, localStorage, and Axios headers
const login = (userData, setUser, setIsAuthenticated) => 
{
  setUser(userData);                              //Set the user data in the state
  setIsAuthenticated(true);                       //Mark the user as authenticated
  localStorage.setItem('token', userData.token);  //Save the token to localStorage
  localStorage.setItem('role', userData.role);    //Save the user's role to localStorage
  setAuthHeaders(userData.token);                 //Set the token for future HTTP requests
};

//Handle user logout: clear state, localStorage, and Axios headers
const logout = (setUser, setIsAuthenticated) => 
{
  setUser(null);                    //Clear user data from the state
  setIsAuthenticated(false);        //Mark the user as not authenticated
  localStorage.removeItem('token'); //Remove the token from localStorage
  localStorage.removeItem('role');  //Remove the user's role from localStorage
  clearAuthHeaders();               //Remove the Authorization header
};

//Provider component to wrap around the app and manage authentication state
export const AuthProvider = ({children}) => 
{
  const [isAuthenticated, setIsAuthenticated] = useState(false);  //Track the login state (authenticated or not)
  const [user, setUser] = useState(null);                         //Track the current user data

  //On component mount, check for existing auth state (by looking for a valid token)
  useEffect(() => 
  {
    initializeAuthState(setIsAuthenticated);  //Initialize auth state based on the token in localStorage
  }, []);                                     //Empty dependency array ensures this runs only on mount

  return (
    <AuthContext.Provider 
      value={{
        isAuthenticated,                                                    //Provide the current authentication status
        user,                                                               //Provide the current user data
        login: (userData) => login(userData, setUser, setIsAuthenticated),  //Login function
        logout: () => logout(setUser, setIsAuthenticated),                  //Logout function
      }}
    >
      {children}  {/*Render the children components wrapped with the AuthContext provider*/}
    </AuthContext.Provider>
  );
};

//Custom hook to access the AuthContext from other components
export const useAuth = () => useContext(AuthContext);  //Returns the current auth context (auth state, login, logout)

//Named exports for helper functions (for testing or external usage)
export {isTokenExpired, setAuthHeaders, clearAuthHeaders, initializeAuthState, login, logout,};