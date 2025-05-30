import React, {useState} from "react";          //React and useState hook for managing component state
import {useNavigate} from "react-router-dom";   //Navigation hook to programmatically navigate between routes
import "../styles/ForgotLoginCredential.css";   //Importing component-specific styles

//Exporting the ForgotLoginCredential component as default
export default function ForgotLoginCredential() 
{
  //Form data state initialized with empty values for email, new username, and new password
  const [formData, setFormData] = useState({
    email: "",
    newUsername: "",
    newPassword: "",
  });

  //State to manage success, error messages, and loading status
  const [message, setMessage] = useState("");     //Success message state
  const [error, setError] = useState("");         //Error message state
  const [success, setSuccess] = useState(false);  //Flag to indicate successful submission
  const [loading, setLoading] = useState(false);  //Flag to indicate loading state while submitting the form
  const navigate = useNavigate();                 //Hook to navigate programmatically to other routes

  //Event handler for input changes, updating the formData state
  const handleChange = (e) => 
  {
    const {id, value} = e.target;   //Destructure target id and value
    setFormData((prev) => ({
      ...prev,
      [id]: value,                  //Dynamically update the state based on the input field ID
    }));
  };

  //Handle form submission logic
  const handleSubmit = async (e) => 
  {
    e.preventDefault(); //Prevent form from reloading the page on submit
    setMessage("");     //Clear previous messages
    setError("");       //Clear previous errors

    //Prepare payload with trimmed form data values to prevent leading/trailing spaces
    const payload = 
    {
      email: formData.email.trim(),
      username: formData.newUsername.trim(),
      password: formData.newPassword.trim(),
    };

    //Check if email is provided; if not, show error and exit
    if(!payload.email) 
    {
      setError("Email is required");
      return;
    }

    setLoading(true); //Set loading flag to true to indicate processing

    try 
    {
      //Make a POST request to the backend for resetting login credentials
      const response = await fetch("http://localhost:8080/auth/forgotLogin", 
      {
        method: "POST",                                 //Use POST method to send data to the server
        headers: {"Content-Type": "application/json"},  //Specify content type as JSON
        body: JSON.stringify(payload),                  //Convert the payload to JSON format
      });

      const data = await response.json(); //Parse the JSON response from the backend

      if(response.ok) 
        {
        //If the response is successful, display success message
        setMessage(data.message || "Credentials reset successful! Redirecting to login...");
        setError("");                               //Clear any errors
        setSuccess(true);                           //Set success flag to true
        setTimeout(() => navigate("/login"), 5000); //Redirect to login page after 5 seconds
      } 
      
      else 
      {
        //If the response is not successful, show the error message
        setError(data.message || "Reset failed. Please try again");
        setMessage(""); //Clear success message
      }
    } 
    
    catch 
    {
      //If there is a network or server error, show a generic error message
      setError("Network or server error");
      setMessage(""); //Clear any success message
    } 
    
    finally 
    {
      setLoading(false);  //Stop the loading state once the request is completed (either success or failure)
    }
  };

  return (
    <div className="forgot-login-container">
      <h2>Reset Your Login Credentials</h2>

      {/*Display success message if available*/}
      {message && <div className="success-message">{message}</div>}

      {/*Display error message if available*/}
      {error && <div className="error-message">{error}</div>}

      {/*Form to reset credentials*/}
      <form onSubmit={handleSubmit} className="forgot-login-form">
        {/*Email input field*/}
        <div className="form-row">
          <label htmlFor="email" className="form-label">Email (required)</label>
          <input
            id="email"
            type="email"
            value={formData.email}        //Controlled input value
            onChange={handleChange}       //Update form data on change
            required                      //Make this field required
            disabled={loading || success} //Disable input if loading or success state is true
            className="form-input"
          />
        </div>

        {/*New Username input field (optional)*/}
        <div className="form-row">
          <label htmlFor="newUsername" className="form-label">New Username (optional)</label>
          <input
            id="newUsername"
            type="text"
            value={formData.newUsername}  //Controlled input value
            onChange={handleChange}       //Update form data on change
            disabled={loading || success} //Disable input if loading or success state is true
            className="form-input"
          />
        </div>

        {/*New Password input field (optional)*/}
        <div className="form-row">
          <label htmlFor="newPassword" className="form-label">New Password (optional)</label>
          <input
            id="newPassword"
            type="password"
            value={formData.newPassword}  //Controlled input value
            onChange={handleChange}       //Update form data on change
            disabled={loading || success} //Disable input if loading or success state is true
            className="form-input"
          />
        </div>

        {/*Button group*/}
        <div className="buttons-group">
          {/*Submit button*/}
          <button
            type="submit"
            disabled={loading || success} //Disable submit button if loading or success state is true
            className={`reset-button btn${loading || success ? " disabled" : ""}`}
          >
            {loading ? "Processing..." : "Reset"} {/*Change button text based on loading state*/}
          </button>

          {/*Back button*/}
          <button
            type="button"
            onClick={() => navigate("/login")}  //Navigate back to the login page
            className="back-button btn"
          >
            Back  {/*Button text for navigation*/}
          </button>
        </div>
      </form>
    </div>
  );
}