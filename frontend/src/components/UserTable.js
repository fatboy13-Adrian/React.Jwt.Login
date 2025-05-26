import React from "react";                //Import the React library to use JSX and define functional components
import UserActions from "./UserActions";  //Import the UserActions component to render action buttons for each user row

//Define and export the UserTable component with props
export default function UserTable({users, currentUser, onUpdate, onDelete, actionsDisabled}) 
{
  return (
    //Wrapper div for the table, can be styled using CSS
    <div className="user-table-wrapper">
      {/*Render the HTML table with class for custom styling*/}
      <table className="user-table">
        {/*Table header row defining column titles*/}
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        {/*Table body containing dynamic user rows*/}
        <tbody>
          {/*Iterate over each user in the users array and render a table row*/}
          {users.map((user) => (
            //Each row must have a unique key for React's reconciliation
            <tr key={user.userId}>
              {/*Render each user attribute in a separate table cell*/}
              <td>{user.userId}</td>
              <td>{user.firstName || "-"}</td>          {/*Fallback to "-" if value is missing*/}
              <td>{user.lastName || "-"}</td>           {/*Fallback to "-" if value is missing*/}
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.phoneNumber || "-"}</td>        {/*Fallback to "-" if value is missing*/}
              <td>{user.homeAddress || "-"}</td>        {/*Fallback to "-" if value is missing*/}
              <td>{user.role || "-"}</td>               {/*Fallback to "-" if value is missing*/}
              <td>
                {/*Render UserActions component to handle Update/Delete for this user*/}
                <UserActions
                  user={user}                          //Current user data for the row
                  currentUser={currentUser}            //Logged-in user for permission checks
                  onUpdate={onUpdate}                  //Callback to update user
                  onDelete={onDelete}                  //Callback to delete user
                  disabled={actionsDisabled}           //Disable actions if needed
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}