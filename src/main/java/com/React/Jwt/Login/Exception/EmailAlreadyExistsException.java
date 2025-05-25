package com.React.Jwt.Login.Exception;  //Package declaration

public class EmailAlreadyExistsException extends RuntimeException 
{ 
    public EmailAlreadyExistsException(String email) 
    {
        super(email + " already exists in database");   //Custom error message for email already in use
    }
}