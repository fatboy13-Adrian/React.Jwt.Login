package com.React.Jwt.Login.Exception;  //Package declaration

public class UserNotFoundException extends RuntimeException 
{ 
    public UserNotFoundException(String userId) 
    {
        super("User ID " + userId + " not found");  //Custom error message for user not found
    }
}