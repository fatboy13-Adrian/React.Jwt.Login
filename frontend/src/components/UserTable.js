import React from "react";                //Importing React for JSX functionality
import UserActions from "./UserActions";  //Importing the 'UserActions' component for handling update/delete actions
import "../styles/UserTable.css";         //Importing the CSS file for table styling

//Helper function to clean and format text (e.g., handle null or empty values)
function cleanText(text) 
{
  if(!text) return "-";                        //Return "-" if the text is null, undefined, or falsy
  const trimmed = text.toString().trim();       //Trim any leading/trailing spaces
  return trimmed.length === 0 ? "-" : trimmed;  //Return "-" if the text is empty, else return the trimmed text
}

//Default export of the UserTable component
export default function UserTable({users, currentUser, onUpdate, onDelete, actionsDisabled}) 
{
  return (
    <div className="user-table-wrapper">                {/*Wrapper div for the table*/}
      <table className="user-table">                    {/*Table for displaying user data*/}
        <thead>                                         {/*Table header*/}
          <tr>                                          {/*Row containing table headers*/}
            <th>ID</th>                                 {/*Table column for ID*/}
            <th>First Name</th>                         {/*Table column for First Name*/}
            <th>Last Name</th>                          {/*Table column for Last Name*/}
            <th>Username</th>                           {/*Table column for Username*/}
            <th>Email</th>                              {/*Table column for Email*/}
            <th>Phone</th>                              {/*Table column for Phone*/}
            <th className="address-col">Address</th>    {/*Table column for Address, with specific class for styling*/}
            <th>Role</th>                               {/*Table column for Role*/}
            <th className="center-content">Actions</th> {/*Table column for Actions, centered content*/}
          </tr>
        </thead>
        <tbody>                                                           {/*Table body to display rows*/}
          {users.map((user) => (                                          //Mapping through each user object in 'users' array
            <tr key={user.userId}>                                        {/*Each row is uniquely identified by the user's userId*/}
              <td>{user.userId}</td>                                      {/*Display the user's ID*/}
              <td>{cleanText(user.firstName)}</td>                        {/*Display the first name, cleaned*/}
              <td>{cleanText(user.lastName)}</td>                         {/*Display the last name, cleaned*/}
              <td>{cleanText(user.username)}</td>                         {/*Display the username, cleaned*/}
              <td>{cleanText(user.email)}</td>                            {/*Display the email, cleaned*/}
              <td>{cleanText(user.phone)}</td>                            {/*Display the phone number, cleaned*/}
              <td className="address-col">{cleanText(user.address)}</td>  {/*Display the address, cleaned, with specific styling*/}
              <td>{cleanText(user.role)}</td>                             {/*Display the role, cleaned*/}
              <td className="center-content">                             {/*Column for the action buttons*/}
                <UserActions                                              //Render the UserActions component for each user
                  user={user}                                             //Pass the user data to UserActions
                  currentUser={currentUser}                               //Pass the current logged-in user for restricting actions
                  onUpdate={onUpdate}                                     //Pass the update action function
                  onDelete={onDelete}                                     //Pass the delete action function
                  disabled={actionsDisabled}                              //Pass the disabled prop to conditionally disable actions
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}