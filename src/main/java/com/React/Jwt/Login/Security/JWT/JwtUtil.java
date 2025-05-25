package com.React.Jwt.Login.Security.JWT;           //Package declaration
import io.jsonwebtoken.Claims;                      //JWT claims (payload)
import io.jsonwebtoken.Jwts;                        //JWT builder/parser
import io.jsonwebtoken.SignatureAlgorithm;          //Signing algorithms
import io.jsonwebtoken.security.Keys;               //Key generation
import org.springframework.stereotype.Component;    //Marks class as a Spring bean
import java.security.Key;                           //Security key type
import java.util.Date;                              //For timestamps
import java.util.List;                              //For roles list

@Component  //Registers this class as a Spring component
public class JwtUtil
{
    private final Key secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);  //Secret key for signing
    private final long expirationMillis = 1000 * 60 * 60;                       //Token valid for 1 hour

    //Generate JWT with username and roles
    public String generateToken(String username, List<String> roles) 
    {
        return Jwts.builder().setSubject(username).claim("roles", roles).setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + expirationMillis)).signWith(secretKey).compact();
    }

    //Parse JWT and return claims
    public Claims parseToken(String token) 
    {
        return Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token).getBody();
    }

    //Check if token is valid (not expired)
    public boolean isTokenValid(String token) 
    {
        try 
        {
            Claims claims = parseToken(token);                  //Get claims
            return !claims.getExpiration().before(new Date());  //Check expiry
        } 
        
        catch (Exception e) 
        {
            return false;                                       //Invalid token
        }
    }

    //Extract username from token
    public String getUsernameFromToken(String token) 
    {
        return parseToken(token).getSubject();  //Return subject
    }

    //Extract roles from token
    public List<String> getRolesFromToken(String token) 
    {
        Claims claims = parseToken(token);                                              //Get claims
        Object rolesObject = claims.get("roles");                                   //Get roles claim
        if(rolesObject instanceof List<?>) 
            return ((List<?>) rolesObject).stream().map(Object::toString) .toList();    //Convert to string list

        throw new RuntimeException("Roles claim is missing or invalid");        //Handle error
    }
}