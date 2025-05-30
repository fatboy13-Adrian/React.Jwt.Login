import React from "react";      //Importing React library for JSX syntax and the custom button styles
import "../styles/Button.css";  //Importing the CSS file for button styling

//Defining the Button component with props for customization
export default function Button({type = "button", onClick, disabled = false, children, className = ""}) 
{
  return (
    //Wrapper div to center the button or apply additional styles if needed
    <div className="button-wrapper">
      <button
        //Setting the button type (default is 'button' if not provided)
        type={type}
        
        //Handling the click event passed from the parent component
        onClick={onClick}
        
        //Disabling the button based on the 'disabled' prop (defaults to false)
        disabled={disabled}
        
        //Applying a combination of default button styles with any custom class passed via props
        className={`custom-btn small-btn ${className}`}
      >
        {/*Rendering the children prop as the button text or content*/}
        {children}
      </button>
    </div>
  );
}