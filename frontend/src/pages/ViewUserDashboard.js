import React, { useEffect, useState, useCallback } from "react";  //Import React hooks
import axios from "axios";                                        //Import axios for HTTP requests
import { useNavigate } from "react-router-dom";                   //Import navigation hook from react-router
import UserTable from "../components/UserTable";                  //Import UserTable component to display user list
import "../styles/ViewUserDashboard.css";                         //Import CSS styles for dashboard

//Main functional component to view user dashboard
export default function ViewUserDashboard() 
{
  const [users, setUsers] = useState([]);                         //State to store list of users
  const [currentUser, setCurrentUser] = useState(null);           //State for currently logged-in user
  const [loading, setLoading] = useState(true);                   //Loading indicator state
  const [error, setError] = useState("");                         //Error message state
  const [deleteSuccess, setDeleteSuccess] = useState("");         //Success message state after deleting a user
  const [actionsDisabled, setActionsDisabled] = useState(false);  //Disable buttons during async actions
  const navigate = useNavigate();                                 //Hook to programmatically navigate between routes

  //Fetch all users from backend (only accessible to admins)
  const fetchAllUsers = useCallback(async (token, isMounted) => 
  {
    try 
    {
      const res = await axios.get("http://localhost:8080/users", 
      {
        headers: { Authorization: `Bearer ${token}` },  //Pass auth token in headers
      });

      //Check component is still mounted before updating state
      if(isMounted) 
      { 
        setUsers(res.data); //Set user list data
        setError("");       //Clear any previous error
      }
    } 
    
    catch(err) 
    {
      if(isMounted) 
      {
        //Set error message from backend or fallback
        setError(err.response?.data?.message || "Failed to fetch users list.");
      }
    }
  }, []); //Empty dependency array: function created once

  //Fetch the current logged-in user's profile and determine if admin
  const fetchCurrentUser = useCallback(
    async (token, isMounted) => 
    {
      try 
      {
        const res = await axios.get("http://localhost:8080/users/me", 
        {
          headers: { Authorization: `Bearer ${token}` },  //Auth token for current user
        });

        if(!isMounted) return;  //Prevent state updates if unmounted

        const user = res.data;  //Extract user data
        setCurrentUser(user);   //Store current user data

        if(user.role === "ADMIN" || user.role === "ROLE_ADMIN") 
          await fetchAllUsers(token, isMounted);  //If user is admin, fetch all users list

        else 
          setUsers([user]); //Otherwise, only show current user's info
  
        setError("");       //Clear errors on success
      } 
      
      catch(err) 
      {
        if(!isMounted) return;  //Exit if component unmounted
        
        if(err.response?.status === 401) 
        {
          localStorage.clear(); //Clear local storage on unauthorized
          navigate("/login"); //Redirect to login page
        } 
        
        else  //Display other errors  
          setError(err.response?.data?.message || "Failed to fetch user profile.");
        
      } 
      
      finally 
      {
        if(isMounted) setLoading(false);  //Stop loading spinner if mounted
      }
    },
    [fetchAllUsers, navigate] //Dependencies to avoid recreating the function
  );

  //Effect runs once on mount to initiate fetching user data
  useEffect(() => 
  {
    let isMounted = true;                         //Track whether component is still mounted
    const token = localStorage.getItem("token");  //Get auth token from localStorage

    if(!token) 
    {
      setError("No token found. Please log in."); //Show error if no token
      setLoading(false);                          //Stop loading spinner
      return;                                     //Exit early
    }

    fetchCurrentUser(token, isMounted); //Call to fetch current user and possibly all users

    //Cleanup function to mark unmounted component to prevent memory leaks
    return () =>
    {
      isMounted = false;
    };
  }, [fetchCurrentUser]); //Depend on fetchCurrentUser so effect updates accordingly

  //Handler to delete a user by userId
  const handleDelete = async (userId) => 
  {
    const token = localStorage.getItem("token");  //Get auth token
    if(!token) 
    {
      alert("Session expired. Please log in again."); //Alert if no token
      navigate("/login");                             //Redirect to login
      return;
    }

    setActionsDisabled(true); //Disable buttons to prevent multiple requests

    try 
    {
      await axios.delete(`http://localhost:8080/users/${userId}`, 
      {
        headers: { Authorization: `Bearer ${token}` }, //Auth header
      });

      setDeleteSuccess("User deleted successfully. Refreshing list...");  //Show success message
      await fetchAllUsers(token, true);                                   //Refresh users list after deletion
      setTimeout(() => setDeleteSuccess(""), 3000);                       //Clear success message after 3 seconds
    } 
    
    catch(err) 
    {
      alert(err.response?.data?.message || "Failed to delete user."); //Alert error message
    } 
    
    finally 
    {
      setActionsDisabled(false);  //Re-enable buttons after request
    }
  };

  //Handler to navigate to the UpdateUserProfile page for editing user
  const handleUpdate = (user) => 
  {
    const token = localStorage.getItem("token");  //Get auth token
    if (!token || !currentUser) 
    {
      alert("Session expired. Please log in again."); //Alert if no token or user info
      navigate("/login");                             //Redirect to login page
      return;
    }

    //Allow admin or self to update the profile
    if(currentUser.role === "ADMIN" || currentUser.role === "ROLE_ADMIN" || user.userId === currentUser.userId) 
    {
      navigate(`/update-user-profile/${user.userId}`, 
      {
        //Pass token and current user info via state
        state: { token, currentUserId: currentUser.userId, currentUserRole: currentUser.role },
      });
    } 
    
    else
      alert("You are not authorized to update this profile.");  //Alert unauthorized access
  };

  //Logout handler clears storage and redirects to login
  const handleLogout = () => 
  {
    localStorage.clear(); //Clear local storage
    navigate("/login");   //Navigate to login page
  };

  //JSX render function starts here
  return (
    <div className="dashboard-center">
      <h1>View Your Dashboard</h1>

      {loading ? (
        <p>Loading...</p> //Show loading text if loading state is true
      ) : error ? (
        <div className="error-message" role="alert">
          {error}         {/*Show error message if error state is not empty*/}
        </div>
      ) : (
        <>
          {deleteSuccess && (
            <div className="success-message" role="status">
              {deleteSuccess} {/*Show success message after delete*/}
            </div>
          )}

          <div className="user-table-wrapper">
            {/*Render user table component with props*/}
            <UserTable
              users={users}                     //Pass list of users to display
              currentUser={currentUser}         //Pass currently logged-in user
              onUpdate={handleUpdate}           //Pass update handler callback
              onDelete={handleDelete}           //Pass delete handler callback
              actionsDisabled={actionsDisabled} //Disable actions while processing
            />
          </div>

          <div className="buttons-center">
            <button className="btn" onClick={handleLogout}>
              Logout {/*Logout button*/}
            </button>
          </div>
        </>
      )}
    </div>
  );
}