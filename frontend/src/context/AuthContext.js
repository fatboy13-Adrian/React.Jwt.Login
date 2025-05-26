//Import necessary React hooks and Axios for HTTP requests
import React, { createContext, useState, useEffect, useContext } from 'react';  
import axios from 'axios';

const AuthContext = createContext();    //Create a context to hold authentication-related values

//Helper function to check if a JWT token is expired
const isTokenExpired = (token) => 
{
  try 
  {
    const decoded = JSON.parse(atob(token.split('.')[1]));  //Decode JWT payload and check if current time is past the expiration
    return decoded.exp * 1000 < Date.now();                 //Compare expiration in ms
  } 
  
  catch(error) 
  {
    return true;    //If decoding fails, treat token as expired
  }
};

//Set the Authorization header globally in Axios
const setAuthHeaders = (token) => 
{
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

//Remove the Authorization header from Axios
const clearAuthHeaders = () => 
{
  delete axios.defaults.headers.common['Authorization'];
};

//Initialize auth state on first load using localStorage token
const initializeAuthState = (setIsAuthenticated) => 
{
  const token = localStorage.getItem('token');  //Get token from localStorage
    if(token && !isTokenExpired(token)) 
    {
        setAuthHeaders(token);                  //Set header for axios requests
        setIsAuthenticated(true);               //Set auth state to true
    }
};

//Handle user login logic and update state
const login = (userData, setUser, setIsAuthenticated) => 
{
  setUser(userData);                                //Store user data in state
  setIsAuthenticated(true);                         //Mark user as authenticated
  localStorage.setItem('token', userData.token);    //Store token in localStorage
  localStorage.setItem('role', userData.role);      //Optionally store user role
  setAuthHeaders(userData.token);                   //Set axios header
};

//Handle logout logic and clear everything
const logout = (setUser, setIsAuthenticated) => 
{
  setUser(null);                          //Clear user state
  setIsAuthenticated(false);             //Mark as unauthenticated
  localStorage.removeItem('token');      //Remove token from localStorage
  localStorage.removeItem('role');       //Remove role if stored
  clearAuthHeaders();                    //Clear axios headers
};

//Define and export the AuthProvider component
export default function AuthProvider({ children }) 
{
  const [isAuthenticated, setIsAuthenticated] = useState(false);    //Track login status
  const [user, setUser] = useState(null);                           //Store user data

    //On mount, check for valid token and update auth state
    useEffect(() => 
    {
        initializeAuthState(setIsAuthenticated);
    }, []);

  return (
    //Provide auth-related values and functions to children components
    <AuthContext.Provider
      value={{
        isAuthenticated,                                                    //Current auth status
        user,                                                               //Current user object
        login: (userData) => login(userData, setUser, setIsAuthenticated),  //Login handler
        logout: () => logout(setUser, setIsAuthenticated),                  //Logout handler
      }}
    >
      {children}    //Render wrapped children components
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);   //Export a custom hook to use the AuthContext more easily