import React, {useState} from "react";              //Importing React and useState hook from 'react'
import axios from "axios";                          //Importing axios for making HTTP requests
import {useNavigate} from "react-router-dom";       //Importing 'useNavigate' from react-router-dom for navigation
import Button from "../components/Button";          //Importing Button component
import SelectRole from "../components/SelectRole";  //Importing SelectRole component
import TextField from "../components/TextField";    //Importing TextField component
import "../styles/RegisterNewUser.css";             //Importing the CSS styles for this component

//Exporting the RegisterNewUser component as default
export default function RegisterNewUser() 
{ 
  const navigate = useNavigate(); //Hook for navigation to different routes

  //Initial state for user details (firstName, lastName, etc.)
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    role: "",
  });

  const [error, setError] = useState(null);       //State to track errors
  const [success, setSuccess] = useState(false);  //State to track success
  const [loading, setLoading] = useState(false);  //State to track loading status

  //Handler function for form input changes
  const onInputChange = (e) => 
  {
    const {name, value} = e.target;                         //Extract name and value from the event target
    setUser((prevUser) => ({...prevUser, [name]: value}));  //Update the user state with new input value
  };

  //Handler function for form submission
  const onSubmit = async (e) => 
  {
    e.preventDefault();   //Prevent default form submission
    setError(null);       //Reset any previous error
    setSuccess(false);    //Reset success status

    //Trim whitespace from input fields to ensure clean data
    const trimmedUser = 
    {
      firstName: user.firstName.trim(),
      lastName: user.lastName.trim(),
      username: user.username.trim(),
      email: user.email.trim(),
      phone: user.phone.trim(),
      address: user.address.trim(),
      password: user.password,
      role: user.role,
    };

    setLoading(true); //Set loading state to true before making the API request

    try 
    {
      //Send POST request to backend to register the new user
      await axios.post("http://localhost:8080/users/register", trimmedUser);
      setSuccess(true);  //Set success state if registration is successful
      setTimeout(() => navigate("/"), 5000);  //Redirect to home page after 5 seconds
    } 
    
    catch(err) 
    {
      //Handle errors based on different response statuses
      if(err.response) 
      {
        if(err.response.status === 409)     //If user already exists
          setError("User with this email or username already exists.");
        
        else if(err.response.data?.message) //Custom error message from backend
          setError(err.response.data.message);
        
          else
          setError(`Error: ${err.response.status} - ${err.response.statusText}`);
      } 
      
      else 
        setError("Network error. Please check your connection."); //Handle network errors
      
    } 
    
    finally 
    {
      setLoading(false);  //Reset loading state after request is complete
    }
  };

  //Fields configuration for the registration form
  const fields = [
    {name: "firstName", label: "First Name", type: "text", required: true, maxLength: 30, minLength: 2, autoComplete: "given-name"},
    {name: "lastName", label: "Last Name", type: "text", required: true, maxLength: 30, minLength: 2, autoComplete: "family-name"},
    {name: "username", label: "Username", type: "text", required: true, maxLength: 20, minLength: 4, autoComplete: "username"},
    {name: "email", label: "Email", type: "email", required: true, minLength: 5, autoComplete: "email"},
    {name: "phone", label: "Phone", type: "tel", required: false, maxLength: 15, minLength: 7, autoComplete: "tel"},
    {name: "address", label: "Address", type: "text", required: false, maxLength: 50, autoComplete: "street-address"},
    {name: "password", label: "Password", type: "password", required: true, minLength: 6, maxLength: 50, autoComplete: "new-password"},
  ];

  return (
    <div className="container-centered">                            {/*Centered container for the form*/}
      <div className="form-wrapper">                                {/*Wrapper for the form*/}
        <h2 className="text-center">Register New User Account</h2>  {/*Heading for the registration form*/}

        {/*Display error message if there is an error*/}
        {error && <div className="alert alert-danger">{error}</div>}  

        {/*Display success message if registration is successful*/}
        {success && <div className="alert alert-success">Registration successful! Redirecting...</div>}

        <form onSubmit={onSubmit} noValidate> {/*Form submission handler*/}
          {fields.map(({name, label, type, required, maxLength, minLength, autoComplete }) => (
            //Dynamically create TextField components based on fields configuration
            <TextField
              key={name}
              id={name}
              label={label}
              name={name}
              type={type}
              value={user[name]}
              onChange={onInputChange}
              disabled={loading || success} //Disable inputs while loading or on success
              required={required}
              maxLength={maxLength}
              minLength={minLength}
              autoComplete={autoComplete}
              className="mb-3 full-width"   //Styling classes
            />
          ))}

          {/*Role selection field*/}
          <SelectRole
            id="role"
            name="role"
            role={user.role}
            onChange={onInputChange}
            disabled={loading || success} //Disable role selection while loading or on success
            className="mb-4 full-width"   //Styling classes
          />

          <div className="button-wrapper">              {/*Wrapper for buttons*/}
            {/*Submit button for the form*/}
            <Button type="submit" disabled={loading || success}>
              {loading ? "Registering..." : "Register"} {/*Show "Registering..." while loading*/}
            </Button>

            {/*Back button to navigate to the login page*/}
            <Button type="button" onClick={() => navigate("/login")} disabled={loading || success}>
              Back
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}