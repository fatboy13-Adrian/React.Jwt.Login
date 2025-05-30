import React from "react";            //Importing React for JSX syntax
import PropTypes from "prop-types";   //Importing PropTypes for prop validation
import "../styles/SelectRole.css";    //Importing the custom CSS for styling the SelectRole component

//Defining the available roles as an array of objects with value and label pairs
const roles = [
  {value: "ADMIN", label: "Admin"},
  {value: "CUSTOMER", label: "Customer"},
  {value: "USER", label: "User"},
];

export default function SelectRole({id, name, role, onChange, disabled, className = ""}) 
{
  return (
    //Wrapper div for form layout, using flexbox for row alignment
    <div className="form-row">
      {/*Label for the select element, associated with the 'id' prop for accessibility*/}
      <label htmlFor={id} className="form-label">Role</label>
      
      {/*Select input field for role selection*/}
      <select
        id={id}                                 //Setting the 'id' of the select element
        name={name}                             //Setting the 'name' of the select element
        value={role}                            //The selected value for the role, controlled by the 'role' prop
        onChange={onChange}                     //The handler to update the selected role when it changes
        disabled={disabled}                     //Disables the select element based on the 'disabled' prop
        className={`form-select ${className}`}  //Custom class for styling, allows adding extra classes
      >
        {/*Default option when no role is selected*/}
        <option value="" disabled>Select role</option>
        
        {/*Dynamically generating options from the 'roles' array */}
        {roles.map(({value, label}) => (
          <option key={value} value={value}>
            {label} {/*Displaying the label for each role*/}
          </option>
        ))}
      </select>
    </div>
  );
}

//Defining PropTypes to enforce type checking for props
SelectRole.propTypes = 
{
  role: PropTypes.string.isRequired,    //'role' should be a string and is required
  onChange: PropTypes.func.isRequired,  //'onChange' should be a function and is required
  disabled: PropTypes.bool,             //'disabled' should be a boolean (optional)
  className: PropTypes.string,          //'className' should be a string (optional)
};

//Default props to provide fallback values when props are not provided
SelectRole.defaultProps = 
{
  disabled: false,  //Default to 'false' if 'disabled' is not passed
  className: "",    //Default to an empty string if 'className' is not passed
};