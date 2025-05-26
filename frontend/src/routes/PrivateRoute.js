import { Navigate } from 'react-router-dom';        //Import Navigate to redirect users to another route
import { useAuth } from '../context/AuthContext';   //Import custom hook to access authentication status from context


//Define and export the PrivateRoute component in one step
export default function PrivateRoute({ children }) 
{
  const { isAuthenticated } = useAuth();    //Get the authentication status from the AuthContext

  if (!isAuthenticated)                     //If the user is not authenticated
    return <Navigate to="/login" />;        //Redirect to the login page

  return children;                         //If authenticated, render the protected child components
}