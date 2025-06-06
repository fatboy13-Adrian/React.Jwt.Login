package com.React.Jwt.Login.Controller;             //Package declaration for the controller class
import com.React.Jwt.Login.DTO.UserDTO;             //Importing DTO for transferring user data
import com.React.Jwt.Login.Service.UserAuthService; //Importing service layer to handle user authentication logic
import lombok.RequiredArgsConstructor;              //Lombok annotation to auto-generate constructor for final fields
import org.springframework.http.ResponseEntity;     //Provides a generic HTTP response wrapper
import org.springframework.web.bind.annotation.*;   //Marks the class as a REST controller

@RestController             //Marks this class as a REST controller with request mapping
@RequestMapping("/me")      //Base URL mapping for all endpoints in this controller
@RequiredArgsConstructor    //Lombok annotation to generate a constructor for final fields
public class UserAuthController 
{
    private final UserAuthService userAuthService;  //Injected service to handle authentication-related logic

    //Handles GET requests to /me/username and returns the authenticated username
    @GetMapping("/username")
    public ResponseEntity<String> getAuthenticatedUsername() 
    {
        String username = userAuthService.getAuthenticatedUsername();   //Retrieves the username of the currently authenticated user
        return ResponseEntity.ok(username);                             //Returns HTTP 200 OK with the username
    }

    //Handles GET requests to /me and returns the current user's profile
    @GetMapping
    public ResponseEntity<UserDTO> getCurrentUserProfile() 
    {
        UserDTO currentUser = userAuthService.getCurrentUser(); //Retrieves the current user's profile as a DTO
        return ResponseEntity.ok(currentUser);                  //Returns HTTP 200 OK with the user profile
    }

    //Handles GET requests to /me/has-role/{role} to check for a specific role
    @GetMapping("/has-role/{role}")
    public ResponseEntity<Boolean> hasRole(@PathVariable String role) 
    {
        boolean hasRole = userAuthService.hasRole(role);    //Checks if the authenticated user has the specified role
        return ResponseEntity.ok(hasRole);                  //Returns HTTP 200 OK with the result (true/false)
    }
}