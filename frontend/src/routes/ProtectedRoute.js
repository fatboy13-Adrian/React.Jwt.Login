import React from 'react';                              //Import React library for JSX support
import { Navigate } from 'react-router-dom';            //Import Navigate from React Router to handle redirection
import { useAuth } from '../../context/AuthContext';    //Import custom authentication context hook to access auth state

//Define and export the ProtectedRoute component in one step
export default function ProtectedRoute({ children }) 
{
  const { isAuthenticated } = useAuth();        //Get the isAuthenticated value from context

  //If the user is not authenticated, redirect to login
  if(!isAuthenticated)
    return <Navigate to="/login" replace />;    //Use 'replace' to avoid adding to browser history

  return children;                              //If authenticated, render the protected child components
}