package com.React.Jwt.Login.Exception;  //Package declaration

public class UsernameNotFoundException extends RuntimeException 
{ 
    public UsernameNotFoundException(String username) 
    {
        super("Username " + username + " not found");   //Custom error message for username not found
    }
}