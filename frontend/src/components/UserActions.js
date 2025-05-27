import React from "react";            //Import React                   
import Button from "./Button";        //Import reusable Button component
import "../styles/UserActions.css";   //Import CSS for UserActions styling

//Reusable UserActions component
export default function UserActions({ user, currentUser, onUpdate, onDelete, disabled }) 
{
  //Allow update if current user is admin or updating their own user info
  const canUpdate = currentUser.role === "ADMIN" || user.userId === currentUser.userId;
  
  //Allow delete only if current user is admin and not deleting themselves
  const canDelete = currentUser.role === "ADMIN" && user.userId !== currentUser.userId;

  return (
    <div className="user-actions">
      {/*Update button enabled only if allowed and not globally disabled*/}
      <Button onClick={() => onUpdate(user)} disabled={disabled || !canUpdate}>
        Update
      </Button>

      {/*Conditionally render Delete button if deletion is allowed*/}
      {canDelete && (
        <Button
          onClick={() => 
          {
            //Confirm deletion before proceeding
            if(window.confirm(`Are you sure you want to delete user ${user.username}?`))
              onDelete(user.userId);
          }}
          disabled={disabled}               //Disable button if globally disabled
          className="delete-btn"            //Apply special delete button styles
        >
          Delete
        </Button>
      )}
    </div>
  );
}