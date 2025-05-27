import React from "react";                  //Import React for JSX support
import "../styles/Button.css";              //Import external CSS for styling

//Define reusable Button component with props
export default function Button({             type = "button", onClick, disabled = false, children, className = "",}) 
{
  return (
    <button
      type={type}                           //Set button type attribute
      onClick={onClick}                     //Attach onClick event handler
      disabled={disabled}                   //Set disabled attribute if true
      className={`custom-btn ${className}`} //Apply base and additional CSS classes
    >
      {children}                            //Render button content (text or elements)
    </button>
  );
}