import React from "react";                        //Importing React for JSX functionality
import {Navigate} from "react-router-dom";        //Import Navigate from react-router-dom to handle redirection
import {useAuth} from "../context/AuthContext";   //Import useAuth hook to access authentication state

//Default export for the ProtectedRoute component function
export default function ProtectedRoute({children}) 
{
  //Using useAuth hook to access authentication state from context
  const {isAuthenticated} = useAuth();    //Destructure 'isAuthenticated' to check if the user is logged in

  //Return the children (protected component) if the user is authenticated
  return isAuthenticated ? (
    children                              //If authenticated, render the children passed to this component
  ) : (
    <Navigate to="/login" replace />      //If not authenticated, redirect to the login page
  );
}