import React from "react";        //Importing React for JSX
import "../styles/TextField.css"; //Importing custom CSS for styling

//The TextField component accepts several props for customizable behavior
export default function TextField({id, label, name, type = "text", value, onChange, autoComplete, disabled = false, required = false, className = ""}) 
{
  return (
    //Wrapper div for the form layout, arranging the label and input in a row
    <div className="form-row">
      
      {/*Label element associated with the input via 'htmlFor'*/}
      <label htmlFor={id} className="form-label">{label}</label>
      
      {/*Input field with multiple customizable attributes*/}
      <input
        id={id}                                       //Setting the 'id' for the input element
        name={name}                                   //Setting the 'name' for form submission
        type={type}                                   //Input field type, can be text, password, email, etc.
        value={value}                                 //Value of the input, passed from parent component
        onChange={onChange}                           //Event handler to update the value on change
        disabled={disabled}                           //Whether the input is disabled
        autoComplete={autoComplete}                   //Auto-complete attribute for browser behavior
        required={required}                           //Whether the input is required for form submission
        className={`form-input ${className}`.trim()}  //Class names for styling, including custom ones
      />
    </div>
  );
}