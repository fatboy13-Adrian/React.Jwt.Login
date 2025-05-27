import { Routes, Route, Navigate } from "react-router-dom";             //Routing components
import ProtectedRoute from "../components/Auth/ProtectedRoute";         //Authentication guard for protected routes
import Login from "../pages/Login";                                     //Login page
import ForgotLoginCredential from "../pages/ForgotLoginCredentials";    //Forgot login credentials page
import RegisterNewUser from "../pages/RegisterNewUser";                 //User registration page
import ViewUserDashboard from "../pages/ViewUserDashboard";             //View user dashboard page
import UpdateUserProfile from "../pages/UpdateUserProfile";             //Update user profile page

export default function AppRoutes() 
{
  return (
    <Routes future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {/*Public Routes*/}
      <Route path="/" element={<Navigate to="/login" replace />} />         {/*Redirect root to login*/}
      <Route path="/login" element={<Login />} />                           {/*Login*/}
      <Route path="/forgot-login" element={<ForgotLoginCredential />} />    {/*Forgot login*/}
      <Route path="/create-user" element={<RegisterNewUser />} />           {/*Register user*/}

      {/*Protected Routes*/}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>                                          {/*Authenticated users only*/}
            <ViewUserDashboard />                                   {/*Dashboard*/}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <ViewUserDashboard />                                   {/*Admin dashboard (same component)*/}
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ViewUserDashboard />                                   {/*Profile view (reuse dashboard)*/}
          </ProtectedRoute>
        }
      />
      <Route
        path="/update-user/:userId"
        element={
          <ProtectedRoute>
            <UpdateUserProfile />                                   {/*Update user with param*/}
          </ProtectedRoute>
        }
      />

      {/*Catch-all*/}
      <Route path="*" element={<Navigate to="/login" replace />} /> {/*Redirect unknown paths*/}
    </Routes>
  );
}