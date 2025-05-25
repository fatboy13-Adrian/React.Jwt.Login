package com.React.Jwt.Login.Security.JWT;                       //Package declaration
import org.springframework.beans.factory.annotation.Value;      //Annotation to inject property values
import org.springframework.context.annotation.Configuration;    //Marks class as a configuration component

@Configuration  //Indicates this class provides configuration properties
public class JwtConfig 
{
    @Value("${jwt.secret}")             //Inject JWT secret from application properties
    private String secretKey;

    @Value("${jwt.expiration}")         //Inject token expiration time
    private long expirationTime;

    @Value("${jwt.refreshExpiration}")  //Inject refresh token expiration time
    private long refreshExpirationTime;

    public String getSecretKey() 
    {
        return secretKey;               //Getter for secret key
    }

    public long getExpirationTime() 
    {
        return expirationTime;          //Getter for token expiration time
    }

    public long getRefreshExpirationTime() 
    {
        return refreshExpirationTime;   //Getter for refresh expiration time
    }
}