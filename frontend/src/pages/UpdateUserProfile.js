import React, {useEffect, useState} from "react";                       //Import React and hooks
import {useNavigate, useParams, useLocation} from "react-router-dom";   //Import router hooks
import axios from "axios";                                              //Import axios for HTTP requests
import Button from "../components/Button";                              //Import custom Button component
import TextField from "../components/TextField";                        //Import custom TextField component
import SelectRole from "../components/SelectRole";                      //Import custom SelectRole component
import "../styles/UpdateUserProfile.css";                               //Import CSS styles for this component

//Export the UpdateUserProfile component as default
export default function UpdateUserProfile() 
{
  const {userId} = useParams();   //Get userId param from URL
  const navigate = useNavigate(); //Get navigate function to programmatically navigate
  const location = useLocation(); //Get current location object

  const {token, currentUserId, currentUserRole} = location.state || {}; //Extract auth and user info from location state (fallback to empty object)

  //State to hold the form data for the user profile
  const [formData, setFormData] = useState({
    firstName: "",  //User's first name
    lastName: "",   //User's last name
    username: "",   //Username
    email: "",      //Email address
    phone: "",      //Phone number
    address: "",    //Address
    password: "",   //Password (blank initially)
    role: "",       //User role
  });

  const [originalData, setOriginalData] = useState(null); //Store original data for change detection
  const [loading, setLoading] = useState(true);           //Loading state while fetching user data
  const [error, setError] = useState("");                 //Error message state

  //Determine if current user is an admin (supports two role string formats)
  const isAdmin = currentUserRole === "ADMIN" || currentUserRole === "ROLE_ADMIN";
  const isSelf = Number(userId) === currentUserId;    //Check if current user is editing their own profile
  const canEdit = isAdmin || isSelf;                  //Determine if user can edit (admin or self)
  const canEditRole = isAdmin;                        //Only admins can edit the role field

  //Fetch user data on component mount or when dependencies change
  useEffect(() => 
  {
    //If no token found (user not logged in)
    if(!token) 
    { 
      alert("Please log in to access this page.");  //Show alert
      navigate("/login");                           //Redirect to login page
      return;                                       //Exit effect
    }

    //If user not authorized to edit
    if(!canEdit) 
    { 
      alert("You are not authorized to update this profile.");  //Show alert
      navigate("/");                                            //Redirect to home page
      return;                                                   //Exit effect
    }

    //Async function to fetch user data from backend
    const fetchUser = async () => 
    {
      try 
      {
        setLoading(true); //Start loading
        //GET request for user data with auth header
        const response = await axios.get(`http://localhost:8080/users/${userId}`, 
        {
          headers: {Authorization: `Bearer ${token}`},
        });
        
        const userData = {...response.data, password: ""};    //Copy user data and set password to empty string for form
        setFormData(userData);                                //Populate form with user data
        setOriginalData(userData);                            //Store original data for change detection
        setError("");                                         //Clear any previous errors
      } 
      
      catch 
      {
        setError("Failed to load user data.");  //Show error if fetch fails
      } 
      
      finally 
      {
        setLoading(false);  //Stop loading in any case
      }
    };

    fetchUser();                          //Trigger data fetch
  }, [userId, token, canEdit, navigate]); //Effect dependencies

  //Handle changes to form input fields
  const handleChange = (e) => 
  {
    if(!canEdit) return;                                //Prevent changes if user can't edit
    const {name, value} = e.target;                     //Get input field name and new value
    if(name === "role" && !canEditRole) return;         //Prevent non-admin from editing role
    setFormData((prev) => ({...prev, [name]: value}));  //Update form data state with new value for changed field
  };

  //Helper to get only fields that have changed and are non-empty (except password)
  const getChangedFields = () => 
  {
    if(!originalData) return {};  //If no original data, return empty object
    const changed = {};           //Object to hold changed fields

    //Iterate over all form data fields
    Object.entries(formData).forEach(([key, value]) => 
    {
      if(key === "password") 
      {
        //Include password only if non-empty (means user wants to update it)
        if(value.trim() !== "") changed[key] = value;
        return; //Skip further checks for password
      }

      if(key === "role" && !canEditRole) return;  //Skip role if user cannot edit role

      //Include field if value changed from original
      if(value !== originalData[key])
        changed[key] = value;
    });

    return changed; //Return changed fields only
  };

  //Handle form submission to update user profile
  const handleSubmit = async (e) => 
  {
    e.preventDefault(); //Prevent default form submission behavior

    //If user can't edit, show alert and exit
    if(!canEdit) 
    { 
      alert("You do not have permission to update this user.");
      return;
    }

    //If token expired or missing, redirect to login
    if(!token) 
    { 
      alert("Your session expired. Please log in again.");
      navigate("/login");
      return;
    }

    const updates = getChangedFields(); //Get only changed fields to submit

    //If no changes detected
    if (Object.keys(updates).length === 0) 
    { 
      alert("No changes detected.");  //Alert user
      return;
    }

    try 
    {
      //PATCH request to update user data with auth header
      await axios.patch(`http://localhost:8080/users/${userId}`, updates, 
      {
        headers: {Authorization: `Bearer ${token}`},
      });

      alert("User updated successfully.");  //Notify success

      //Update original data state to keep form in sync, clearing password locally
      setOriginalData((prev) => ({
        ...prev,
        ...updates,
        password: "", //Clear password locally after update
      }));

      //Clear password field in form after update
      setFormData((prev) => ({...prev, password: ""}));

      //Redirect user based on whether updating own profile or another's
      if(isSelf) navigate("/");
      else navigate("/dashboard");
    } 
    
    catch(err) 
    {
      //Show error from response or fallback message
      alert(err.response?.data?.message || "Failed to update user.");
    }
  };

  if(loading) return <p>Loading user data...</p>;             //Show loading indicator while fetching
  if(error) return <p className="error-message">{error}</p>;  //Show error message if fetch failed

  //Render user update form
  return (
    <div className="container form-wrapper">
      <h2 className="dashboard-title">Update User Profile</h2>

      <form onSubmit={handleSubmit} className="register-form" noValidate>
        {/*First Name input*/}
        <TextField
          id="firstName"
          name="firstName"
          label="First Name"
          value={formData.firstName}
          onChange={handleChange}
          disabled={!canEdit} //Disable input if user can't edit
        />

        {/*Last Name input*/}
        <TextField
          id="lastName"
          name="lastName"
          label="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          disabled={!canEdit}
        />

        {/*Username input*/}
        <TextField
          id="username"
          name="username"
          label="Username"
          value={formData.username}
          onChange={handleChange}
          disabled={!canEdit}
        />

        {/*Email input*/}
        <TextField
          id="email"
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          disabled={!canEdit}
        />

        {/*Phone input*/}
        <TextField
          id="phone"
          name="phone"
          label="Phone"
          value={formData.phone}
          onChange={handleChange}
          disabled={!canEdit}
        />

        {/*Address input*/}
        <TextField
          id="address"
          name="address"
          label="Address"
          value={formData.address}
          onChange={handleChange}
          disabled={!canEdit}
        />

        {/*Password input*/}
        <TextField
          id="password"
          name="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Leave blank to keep current password"
          disabled={!canEdit}
        />

        {/*Conditionally render role selector if user can edit role*/}
        {canEditRole && (
          <SelectRole
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            aria-label="Select Role"
            className="form-select"
          />
        )}

        {/*Form action buttons*/}
        <div className="form-actions">
          {/*Submit button, disabled if can't edit*/}
          <Button type="submit" className="action-button" disabled={!canEdit}>
            Update
          </Button>
          {/*Cancel button redirects to different pages based on user*/}
          <Button
            type="button"
            className="action-button"
            onClick={() => navigate(isSelf ? "/" : "/dashboard")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}