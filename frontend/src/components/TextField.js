import React from "react";  //Import the React library to use JSX and define functional components

//Export a reusable TextField component that accepts multiple props
export default function TextField({name, label, type = "text", value, onChange, required = false, maxLength, minLength, autoComplete, disabled,}) 
{
  return (
    //Wrapper div for styling and layout
    <div className="text-field-row">
      {/*Label associated with the input using htmlFor matching the input's ID*/}
      <label htmlFor={name} className="text-field-label">
        {label} {/*Render the provided label text*/}
      </label>
      {/*Input element with all necessary props for flexibility and validation*/}
      <input
        id={name}                    //Set the input's ID
        name={name}                  //Set the input's name (used in form submissions)
        type={type}                  //Set the input type (text, password, etc.)
        value={value}                //Controlled component value
        onChange={onChange}          //Call onChange function when the user types
        required={required}          //Apply required validation if true
        maxLength={maxLength}        //Limit the number of characters
        minLength={minLength}        //Enforce a minimum number of characters
        autoComplete={autoComplete}  //Set browser autocomplete behavior
        disabled={disabled}          //Disable input if true
        className="text-field-input" //Apply custom styling from CSS
      />
    </div>
  );
}