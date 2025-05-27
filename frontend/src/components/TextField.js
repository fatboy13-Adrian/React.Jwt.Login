import React from "react";        //Import React for JSX support
import "../styles/TextField.css"; //Import TextField styles

export default function TextField({name, label, type = "text", value, onChange, required = false, maxLength, minLength, autoComplete, disabled,}) 
{
  return (
    <div className="text-field-row">  {/*container for label and input*/}
      <label htmlFor={name} className="text-field-label">
        {label}
      </label>
      <input
        id={name}                     //link input to label
        name={name}                   //form input name
        type={type}                   //input type
        value={value}                 //controlled value
        onChange={onChange}           //onChange handler
        required={required}           //required validation
        maxLength={maxLength}         //max length limit
        minLength={minLength}         //min length limit
        autoComplete={autoComplete}   //browser autocomplete
        disabled={disabled}           //disable input if true
        className="text-field-input"
      />
    </div>
  );
}