package com.React.Jwt.Login.Service;                                    //Package declaration for service classes
import com.React.Jwt.Login.DTO.UserDTO;                                 //Import UserDTO data transfer object
import com.React.Jwt.Login.Entity.User;                                 //Import User entity class
import com.React.Jwt.Login.Exception.UsernameNotFoundException;         //Custom exception for missing username
import com.React.Jwt.Login.Mapper.UserMapper;                           //Mapper for converting between User and UserDTO
import com.React.Jwt.Login.Repository.UserRepository;                   //Repository interface for User database operations
import lombok.RequiredArgsConstructor;                                  //Lombok annotation to generate constructor for final fields
import org.springframework.security.access.AccessDeniedException;       //Exception for access denial
import org.springframework.security.core.Authentication;                //Core Spring Security class representing authentication token
import org.springframework.security.core.GrantedAuthority;              //Interface representing granted authorities (roles/permissions)
import org.springframework.security.core.context.SecurityContextHolder; //Holder for security context, including authentication info
import org.springframework.stereotype.Service;                          //Marks this class as a Spring service component

@Service                    //Spring-managed service bean
@RequiredArgsConstructor    //Generates constructor for final fields (dependency injection)
public class UserAuthService 
{
    private final UserRepository userRepository;    //Injected repository for user data access
    private final UserMapper userMapper;            //Injected mapper for User <-> UserDTO conversion

    //Retrieve username of currently authenticated user
    public String getAuthenticatedUsername() 
    {
        //Get authentication info from security context
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        //Check if authentication is missing or unauthenticated, throw exception
        if(auth == null || !auth.isAuthenticated())
            throw new AccessDeniedException("User not authenticated");
        
        return auth.getName();  //Return username (principal name)
    }

    //Get current user's profile as a UserDTO
    public UserDTO getCurrentUser() 
    {
        return userMapper.toDTO(getAuthenticatedUser());        //Convert authenticated User entity to UserDTO
    }

    //Retrieve the User entity of currently authenticated user
    public User getAuthenticatedUser() 
    {
        return findUserByUsername(getAuthenticatedUsername());  //Find user entity by authenticated username
    }

    //Check if the current user has a specific role
    public boolean hasRole(String roleName) 
    {
        //Get authentication info from security context
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        //Return false if authentication or authorities are null
        if(auth == null || auth.getAuthorities() == null) return false;
        
        //Check if any authority matches the given role name
        return auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).anyMatch(role -> role.equals(roleName));
    }

    //Helper method to find User entity by username or throw exception
    private User findUserByUsername(String username) 
    {
        //Query userRepository; throw custom exception if user not found
        return userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(username));
    }
}