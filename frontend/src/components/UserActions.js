import React from "react";        //Importing React library for JSX syntax and the custom button styles
import "../styles/UserTable.css"; //Importing CSS for styling

//Define the 'UserActions' component as a default function export
export default function UserActions({user, currentUser, onUpdate, onDelete, disabled}) 
{
  //Check if the logged-in user is the same as the current user to enable actions for their own profile
  const isLoggedInUser = currentUser && user.userId === currentUser.userId;

  //Check if the logged-in user is an admin
  const isAdmin = currentUser && currentUser.role === "ADMIN";

  return (
    <div className="action-buttons">
      {/*Update button: Admins can update any profile, normal users can only update their own profile*/}
      <button
        onClick={() => onUpdate(user)}                        //Trigger the 'onUpdate' function when clicked, passing the 'user' object
        disabled={disabled || (!isLoggedInUser && !isAdmin)}  //Enable for admin and the logged-in user only
      >
        Update  {/*Button text for updating the user*/}
      </button>

      {/*Delete button: Only admin can delete any user's profile except for their own*/}
      {isAdmin && user.userId !== currentUser.userId && (
        <button
          onClick={() => onDelete(user.userId)} //Trigger the 'onDelete' function when clicked, passing the 'userId' of the user
          disabled={disabled}                   //Disable if any other actions are disabled
        >
          Delete                                {/*Button text for deleting the user*/}
        </button>
      )}
    </div>
  );
}