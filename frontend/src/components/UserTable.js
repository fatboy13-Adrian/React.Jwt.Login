import React from "react";                //Import React library for JSX and component creation
import UserActions from "./UserActions";  //Import UserActions component for row action buttons
import "../styles/UserTable.css";         //Import external CSS for table styling

//Define and export UserTable component
export default function UserTable({           users, currentUser, onUpdate, onDelete, actionsDisabled,}) 
{
  return (
    <div className="user-table-wrapper">              {/*Container div for responsive table styling*/}
      <table className="user-table">                  {/*Table element with custom styling*/}
        <thead>                                       {/*Table header*/}
          <tr>                                        {/*Header row*/}
            <th>ID</th>                               {/*User ID column*/}
            <th>First Name</th>                       {/*First Name column*/}
            <th>Last Name</th>                        {/*Last Name column*/}
            <th>Username</th>                         {/*Username column*/}
            <th>Email</th>                            {/*Email column*/}
            <th>Phone</th>                            {/*Phone number column*/}
            <th className="address-col">Address</th>  {/*Address column with wider width*/}
            <th>Role</th>                             {/*Role column*/}
            <th>Actions</th>                          {/*Actions column for buttons*/}
          </tr>
        </thead>
        <tbody>                                   {/*Table body for user data rows*/}
          {users.map((user) => (                  //Map over users to create one row per user
            <tr key={user.userId}>                {/*Unique key for each row*/}
              <td>{user.userId}</td>              {/*Display user ID*/}
              <td>{user.firstName || "-"}</td>    {/*Display first name or "-" if missing*/}
              <td>{user.lastName || "-"}</td>     {/*Display last name or "-" if missing*/}
              <td>{user.username}</td>            {/*Display username*/}
              <td>{user.email}</td>               {/*Display email*/}
              <td>{user.phoneNumber || "-"}</td>  {/*Display phone or fallback*/}
              <td>{user.homeAddress || "-"}</td>  {/*Display address or fallback*/}
              <td>{user.role || "-"}</td>         {/*Display role or fallback*/}
              <td>                                {/*Actions cell*/}
                <UserActions
                  user={user}                     //Pass current user data to actions
                  currentUser={currentUser}       //Pass logged-in user for permissions
                  onUpdate={onUpdate}             //Update callback function
                  onDelete={onDelete}             //Delete callback function
                  disabled={actionsDisabled}      //Disable actions if flagged
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}