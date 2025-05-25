package com.React.Jwt.Login.Exception;  //Package declaration

public class UsernameAlreadyExistsException extends RuntimeException 
{ 
    public UsernameAlreadyExistsException(String username) 
    {
        super(username + " already exists in database");    //Custom error message for username already in use
    }
}