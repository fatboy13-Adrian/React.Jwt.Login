package com.React.Jwt.Login.Controller;                 //Package declaration for the user controller
import com.React.Jwt.Login.DTO.Auth.AuthResponseDTO;    //Importing DTO for authentication responses
import com.React.Jwt.Login.DTO.UserDTO;                 //Importing DTO for user data transfer
import com.React.Jwt.Login.Service.UserService;         //Importing service handling user-related operations
import lombok.RequiredArgsConstructor;                  //Lombok annotation to auto-generate constructor for final fields
import org.springframework.http.ResponseEntity;         //Spring wrapper for HTTP responses
import org.springframework.web.bind.annotation.*;       //Spring annotations for REST controllers and request mapping
import java.util.List;                                  //Import List interface for collections

@RestController             //Marks the class as a REST controller
@RequestMapping("/users")   //Base URL mapping for this controller's endpoints
@RequiredArgsConstructor    //Lombok annotation for constructor injection of final fields
public class UserController 
{
    private final UserService userService;  //Injected service for user operations

    //Handles POST requests to /users/register to register a new user
    @PostMapping("/register")
    public ResponseEntity<UserDTO> RegisterNewUser(@RequestBody UserDTO userDTO) 
    {
        UserDTO registeredUser = userService.registerNewUser(userDTO);  //Registers new user with data from request body
        return ResponseEntity.ok(registeredUser);                       //Returns HTTP 200 OK with the registered user data
    }

    //Handles GET requests to /users/{userId} to view a specific user's profile
    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> ViewUserProfile(@PathVariable Long userId) 
    {
        UserDTO user = userService.viewUserProfile(userId); //Retrieves user profile by userId path variable
        return ResponseEntity.ok(user);                     //Returns HTTP 200 OK with the user profile
    }

    //Handles GET requests to /users to get all user profiles
    @GetMapping
    public ResponseEntity<List<UserDTO>> ViewUserProfiles() 
    {
        List<UserDTO> users = userService.viewUserProfiles();   //Retrieves list of all user profiles
        return ResponseEntity.ok(users);                        //Returns HTTP 200 OK with the list of users
    }

    //Handles PATCH requests to /users/{userId} to update a user profile
    @PatchMapping("/{userId}")
    public ResponseEntity<AuthResponseDTO> updateUserProfile(@PathVariable Long userId, @RequestBody UserDTO userDTO) 
    {
        AuthResponseDTO response = userService.updateUserProfile(userId, userDTO);  //Updates user profile and returns authentication response
        return ResponseEntity.ok(response);                                         //Returns HTTP 200 OK with update response
    }

    //Handles DELETE requests to /users/{userId} to delete a user profile
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUserProfile(@PathVariable Long userId) 
    {
        userService.deleteUserProfile(userId);      //Deletes user profile by userId
        return ResponseEntity.noContent().build();  //Returns HTTP 204 No Content indicating successful deletion
    }
}