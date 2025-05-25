package com.React.Jwt.Login.Security.JWT;                                               //Security package
import jakarta.servlet.FilterChain;                                                     //FilterChain for request filtering
import jakarta.servlet.ServletException;                                                //ServletException for handling servlet errors
import jakarta.servlet.http.HttpServletRequest;                                         //HttpServletRequest to access request data
import jakarta.servlet.http.HttpServletResponse;                                        //HttpServletResponse for sending responses
import org.springframework.security.core.context.SecurityContextHolder;                 //Security context for authentication management
import org.springframework.security.core.authority.SimpleGrantedAuthority;              //Authority for role-based access control
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;  //Authentication details
import org.springframework.stereotype.Component;                                        //Marks the class as a Spring component
import org.springframework.web.filter.OncePerRequestFilter;                             //Ensures the filter runs once per request
import java.io.IOException;                                                             //Handles IO exceptions
import java.util.List;                                                                  //List for roles

@Component  //Spring-managed bean
public class JwtAuthenticationFilter extends OncePerRequestFilter 
{
    private final JwtUtil JwtUtil;    //Utility for JWT operations

    //Constructor
    public JwtAuthenticationFilter(JwtUtil JwtUtil) 
    { 
        this.JwtUtil = JwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException 
    {
        try 
        {
            String token = parseJwt(request); //Get JWT token from request

            //Validate token
            if (token != null && JwtUtil.isTokenValid(token)) 
            { 
                String username = JwtUtil.parseToken(token).getSubject();  //Get username from token
                List<String> roles = JwtUtil.getRolesFromToken(token);     //Get roles from token

                //Map roles to authorities
                List<SimpleGrantedAuthority> authorities = roles.stream() .map(role -> new SimpleGrantedAuthority("ROLE_" + role)).toList();

                JwtAuthenticationToken authentication = new JwtAuthenticationToken(username, authorities, token);   //Create authentication token
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));              //Set request details
                SecurityContextHolder.getContext().setAuthentication(authentication);                               //Set authentication in context
            }
        } 
        
        catch(Exception e) 
        {
            logger.error("JWT Authentication error", e);    //Log error
        }

        filterChain.doFilter(request, response);                    //Continue with filter chain
    }

    //Parse JWT from request header
    private String parseJwt(HttpServletRequest request) 
    { 
        String headerAuth = request.getHeader("Authorization"); //Get Authorization header

        //Check for Bearer prefix and return token
        if(headerAuth != null && headerAuth.startsWith("Bearer")) 
            return headerAuth.substring(7);
        
        return null;    //No token found
    }
}