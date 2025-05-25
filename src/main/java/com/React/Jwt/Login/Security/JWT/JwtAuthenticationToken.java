package com.React.Jwt.Login.Security.JWT;                                       //Package declaration
import org.springframework.security.authentication.AbstractAuthenticationToken; //Base class for auth tokens
import org.springframework.security.core.authority.SimpleGrantedAuthority;      //Represents user roles
import java.util.List;                                                          //List interface

// Custom JWT auth token class
public class JwtAuthenticationToken extends AbstractAuthenticationToken 
{ 
    private final String principal;     //Stores username
    private final String credentials;   //Stores JWT token

    //Constructor to initialize username, roles, and token
    public JwtAuthenticationToken(String principal, List<SimpleGrantedAuthority> authorities, String credentials) 
    {
        super(authorities);                     //Calls superclass with roles
        this.principal = principal;             //Sets username
        this.credentials = credentials;         //Sets token
        setAuthenticated(true); //Marks as authenticated
    }

    @Override
    public Object getCredentials() 
    {
        return credentials;     //Returns token
    }

    @Override
    public Object getPrincipal() 
    {
        return principal;       //Returns username
    }

    public String getToken() 
    {
        return credentials;     //Returns token
    }
}