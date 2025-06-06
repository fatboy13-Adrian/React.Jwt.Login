package com.React.Jwt.Login.Service;                                //Package declaration for service layer classes
import com.React.Jwt.Login.Entity.User;                             //Import User entity class
import lombok.RequiredArgsConstructor;                              //Lombok annotation to generate constructor for final fields
import org.springframework.security.access.AccessDeniedException;   //Spring exception for access denial
import org.springframework.stereotype.Service;                      //Marks this class as a Spring service component

@Service                    //Defines this class as a Spring-managed service bean
@RequiredArgsConstructor    //Generates constructor for final fields (dependency injection)
public class UserAuthorizationService 
{
    private final UserAuthService userAuthService;  //Injected service handling authentication details

    //Method to authorize access only for admin users
    public void authorizeAdmin() 
    {
        //Check if current user has admin role; throw exception if not
        if (!userAuthService.hasRole("ROLE_ADMIN"))
            throw new AccessDeniedException("Only admins can access this resource.");
    }

    //Method to authorize either the user themselves or an admin
    public void authorizeUserOrAdmin(Long userId) 
    {
        User currentUser = userAuthService.getAuthenticatedUser();  //Retrieve currently authenticated user
        boolean isSelf = userId.equals(currentUser.getUserId());    //Check if the requested userId matches current user's ID

        //Throw exception if not self and not admin
        if(!isSelf && !userAuthService.hasRole("ROLE_ADMIN"))
            throw new AccessDeniedException("You are not authorized to access this data.");
    }
}