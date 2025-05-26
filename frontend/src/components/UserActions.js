import React from "react";      //Import the React library to use JSX and create a functional component
import Button from "./Button";  //Import a reusable Button component

//Define and export the UserActions component with props
export default function UserActions({user, currentUser, onUpdate, onDelete, disabled}) 
{
  //Determine if the current user is allowed to update this user
  const canUpdate = currentUser.role === "ADMIN" || user.userId === currentUser.userId;

  //Determine if the current user is allowed to delete this user
  const canDelete = currentUser.role === "ADMIN" && user.userId !== currentUser.userId;

  return (
    //Wrapper div for the action buttons, can be styled via CSS
    <div className="user-actions">
      {/*Render the Update button, enabled only if canUpdate is true and not disabled globally*/}
      <Button onClick={() => onUpdate(user)} disabled={disabled || !canUpdate}>
        Update
      </Button>

      {/*Conditionally render the Delete button only if canDelete is true*/}
      {canDelete && (
        <Button
          onClick={() => 
          {
            //Prompt the user for confirmation before deleting
            if(window.confirm(`Are you sure you want to delete user ${user.username}?`)) 
              onDelete(user.userId);  //Call the onDelete handler with the user's ID if confirmed
          }}
          disabled={disabled}         //Disable the button if globally disabled
          className="delete-btn"      //Apply additional styling for delete button
        >
          Delete
        </Button>
      )}
    </div>
  );
}