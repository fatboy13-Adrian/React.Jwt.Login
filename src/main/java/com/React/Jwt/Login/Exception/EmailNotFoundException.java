package com.React.Jwt.Login.Exception;  //Package declaration

public class EmailNotFoundException extends RuntimeException
{
    public EmailNotFoundException(String email)
    {
        super(email+ " not found in DB");   //Custom error message for eamil not found
    }
}