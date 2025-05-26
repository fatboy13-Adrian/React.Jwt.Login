import React from "react";  //Import the React library to use JSX and React features

//Export a functional component named Button with destructured props
export default function Button({type = "button", onClick, disabled = false, children, className = "",}) 
{
  //Return the JSX for rendering the button element
  return (
    <button
      type={type}                           //Set the button's type attribute
      onClick={onClick}                     //Attach the click event handler
      disabled={disabled}                   //Set the button's disabled attribute
      className={`custom-btn ${className}`} //Combine default and custom CSS classes
    >
      {children}                            //Render any children passed between Button tags
    </button>
  );
}