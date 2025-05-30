import React from "react";                                          //Importing React for JSX functionality
import {Routes, Route, Navigate} from "react-router-dom";           //Importing necessary components from react-router-dom for routing
import Login from "../pages/Login";                                 //Import Login page
import ForgotLoginCredential from "../pages/ForgotLoginCredential"; //Import ForgotLoginCredential page
import RegisterNewUser from "../pages/RegisterNewUser";             //Import RegisterNewUser page
import ViewUserDashboard from "../pages/ViewUserDashboard";         //Import ViewUserDashboard page
import UpdateUserProfile from "../pages/UpdateUserProfile";         //Import UpdateUserProfile page
import ProtectedRoute from "./ProtectedRoute";                      //Import the ProtectedRoute component to protect certain routes

//Default export for AppRoutes function component that handles routing logic
export default function AppRoutes() 
{
  return (
    <Routes>
      {/*Public routes*/}
      <Route path="/" element={<Navigate to="/login" replace />} />                 {/*Redirect the root path ("/") to the login page*/}
      <Route path="/login" element={<Login />} />                                   {/*Login route, renders Login page*/}
      <Route path="/forgot-login-credential" element={<ForgotLoginCredential />} /> {/*Forgot Login Credential route, renders ForgotLoginCredential page*/}
      <Route path="/register-new-user" element={<RegisterNewUser />} />             {/*Register route, renders RegisterNewUser page*/}

      {/*Protected routes*/}
      <Route 
        path="/dashboard" 
        element={ 
          <ProtectedRoute>    {/*Protected route that wraps ViewUserDashboard component*/}
            <ViewUserDashboard /> 
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={ 
          <ProtectedRoute>    {/*Protected route that wraps ViewUserDashboard component for admin*/}
            <ViewUserDashboard /> 
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={ 
          <ProtectedRoute>    {/*Protected route that wraps ViewUserDashboard component for profile view*/}
            <ViewUserDashboard /> 
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/update-user-profile/:userId" 
        element={ 
          <ProtectedRoute>    {/*Protected route that wraps UpdateUserProfile component*/}
            <UpdateUserProfile /> 
          </ProtectedRoute>
        } 
      />

      {/*Fallback route*/}
      <Route path="*" element={<Navigate to="/login" replace />} /> {/*Redirect all unmatched routes to login*/}
    </Routes>
  );
}