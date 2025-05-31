import React from "react";              //Import React for JSX rendering
import UserActions from "./UserActions" //Import component to handle update/delete buttons
import "../styles/UserTable.css";       //Import custom CSS styles for the table

//Utility function to clean text: returns '-' if text is null/empty
function cleanText(text) 
{
  if(!text) return "-";                         //Handle null, undefined, or falsy values
  const trimmed = text.toString().trim();       //Trim leading/trailing whitespace
  return trimmed.length === 0 ? "-" : trimmed;  //Replace empty string with '-'
}

//Main UserTable component
export default function UserTable({users, currentUser, onUpdate, onDelete, actionsDisabled}) 
{
  return (
    <div className="user-table-wrapper"> {/*Wrapper div for layout control*/}
      <table className="user-table">     {/*Main table structure*/}
        <thead>                          {/*Table header row*/}
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Phone</th>
            <th className="address-col">Address</th>
            <th>Role</th>
            <th className="center-content">Actions</th>
          </tr>
        </thead>

        {/*Table body for user data rows*/}
        <tbody>
          {/*Map through users and generate a row for each*/}
          {users.map((user) => (
            <tr key={user.userId}>
              <td>{user.userId}</td>
              <td>{cleanText(user.firstName)}</td>
              <td>{cleanText(user.lastName)}</td>
              <td>{cleanText(user.username)}</td>
              <td>{cleanText(user.email)}</td>
              <td>{cleanText(user.phone)}</td>
              <td className="address-col">{cleanText(user.address)}</td>
              <td>{cleanText(user.role)}</td>

              {/*Render action buttons for each row*/}
              <td className="center-content">
                <UserActions
                  user={user}                 //Current row's user object
                  currentUser={currentUser}   //Context: logged-in user
                  onUpdate={onUpdate}         //Callback for Update button
                  onDelete={onDelete}         //Callback for Delete button
                  disabled={actionsDisabled}  //Disable if true
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}