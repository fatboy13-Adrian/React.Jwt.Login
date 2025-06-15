import React, {useState} from "react";                //Import React and useState hook to manage local state
import {useNavigate} from "react-router-dom";         //Import useNavigate hook for navigation between routes
import {loginUser} from "../services/AuthService";    //Import loginUser function to authenticate user
import Button from "../components/Button";            //Import custom Button component for reusable buttons
import "../styles/Login.css";                         //Import CSS styles for the Login page

const Login = () => 
{
  //State variables to store user input and handle errors or success messages
  const [username, setUsername] = useState(""); //Username state
  const [password, setPassword] = useState(""); //Password state
  const [error, setError] = useState("");       //Error state to display login errors
  const [success, setSuccess] = useState("");   //Success state to show success messages
  const navigate = useNavigate();               //useNavigate hook for programmatically navigating between pages

  //Handle form submission
  const handleLogin = async (e) => 
  {
    e.preventDefault(); //Prevent form from reloading the page on submit
    setError("");       //Clear any previous error messages
    setSuccess("");     //Clear any previous success messages

    try 
    {
      //Call the loginUser function to authenticate the user with the provided username and password
      const userData = await loginUser(username, password);
      const {token, userId, role} = userData;     //Destructure the response to get token, userId, and role

      const normalizedRole = role?.toUpperCase(); //Normalize role to uppercase for consistency

      //Check if the necessary data exists (token, userId, role)
      if(!token || !userId || !normalizedRole) 
        throw new Error("Missing login data."); //Throw an error if any data is missing
    
      //Store the token, userId, and role in localStorage for persistence
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId.toString());
      localStorage.setItem("role", normalizedRole);

      //Set success message and redirect to dashboard
      setSuccess("Login successful! Redirecting to dashboard...");

      //Redirect user to the dashboard after 5 seconds
      navigate("/dashboard"); //Navigate to the dashboard route
    } 
    
    catch(err) 
    {
      console.error("Login error:", err);               //Log any errors to the console for debugging
      setError("Invalid credentials or server error."); //Set error message if login fails
    }
  };

  return (
    <div className="login-wrapper">     {/*Wrapper div for the entire login page*/}
      <div className="login-container"> {/*Container for the login form*/}
        <h2>Welcome to Login Page</h2>  {/*Heading for the login page*/}
        
        {/*Login form*/}
        <form onSubmit={handleLogin} className="login-form">
          
          {/*Username input field*/}
          <div className="form-row-horizontal">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              id="username"
              type="text"
              value={username}                              //Bind input value to the username state
              onChange={(e) => setUsername(e.target.value)} //Update username state on change
              required                                      //Make the username input required
              className="form-input"
            />
          </div>

          {/*Password input field*/}
          <div className="form-row-horizontal">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              value={password}                              //Bind input value to the password state
              onChange={(e) => setPassword(e.target.value)} //Update password state on change
              required                                      //Make the password input required
              className="form-input"
            />
          </div>

          {/*Display error message if login fails*/}
          {error && <div className="error-message">{error}</div>}

          {/*Display success message if login is successful*/}
          {success && <div className="success-message">{success}</div>}

          {/*Group of buttons for login, register, and forgot password*/}
          <div className="buttons-group-inline">
            {/*Login button*/}
            <Button type="submit" className="full-button">Login</Button>
            
            {/*Register button navigates to the registration page*/}
            <Button type="button" onClick={() => navigate("/register-new-user")} className="full-button">
              Register
            </Button>
            
            {/*Forgot Password button navigates to the reset password page*/}
            <Button type="button" onClick={() => navigate("/forgot-login-credential")} className="full-button">
              Forgot Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; //Export the Login component as default