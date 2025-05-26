package com.React.Jwt.Login.Controller;                 //Define the package for this controller class
import com.React.Jwt.Login.DTO.UserDTO;                 //Import the UserDTO class for data transfer
import com.React.Jwt.Login.DTO.Auth.AuthResponseDTO;    //Import the AuthResponseDTO class for response after user updates
import com.React.Jwt.Login.Service.UserService;         //Import the UserService class to handle business logic
import lombok.RequiredArgsConstructor;                  //Lombok annotation to generate constructor for final fields
import org.springframework.http.ResponseEntity;         //Import ResponseEntity for HTTP response handling
import org.springframework.web.bind.annotation.*;       //Import Spring Web annotations for defining REST endpoints
import java.util.List;                                  //Import List collection for multiple users

@CrossOrigin(origins = "http://localhost:3000")     //Enable Cross-Origin Resource Sharing for frontend on localhost:3000
@RestController                                     //Mark this class as a REST controller
@RequestMapping("/users")                           //Base path for all endpoints in this controller
@RequiredArgsConstructor                            //Generate constructor for injecting dependencies (UserService)
public class UserController 
{
    private final UserService userService;  //Inject UserService to handle user-related operations

    //Handle POST request to create a new user
    @PostMapping
    public ResponseEntity<UserDTO> RegisterNewUser(@RequestBody UserDTO userDTO) 
    {
        UserDTO createdUser = userService.RegisterNewUser(userDTO); //Call service to create user and return result
        return ResponseEntity.ok(createdUser);                      //Respond with created user
    }

    //Handle GET request to fetch currently authenticated user
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() 
    {
        UserDTO currentUser = userService.getCurrentUser(); //Call service to get current user
        return ResponseEntity.ok(currentUser);              //Respond with user data
    }

    //Handle GET request to fetch a user by ID
    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> ViewUserProfile(@PathVariable("userId") Long userId) 
    {
        UserDTO user = userService.ViewUserProfile(userId); //Call service to get user by ID
        return ResponseEntity.ok(user);                     //Respond with user data
    }

    //Handle GET request to fetch all users
    @GetMapping
    public ResponseEntity<List<UserDTO>> ViewUserProfiles() 
    {
        List<UserDTO> users = userService.ViewUserProfiles();   //Call service to get list of users
        return ResponseEntity.ok(users);                        //Respond with user list
    }

    //Handle PATCH request to update user by ID
    @PatchMapping("/{userId}")
    public ResponseEntity<AuthResponseDTO> UpdateUserProfile(@PathVariable("userId") Long userId, @RequestBody UserDTO userDTO) 
    {
        //Call service to update user and return auth response
        AuthResponseDTO updatedUser = userService.UpdateUserProfile(userId, userDTO);
        return ResponseEntity.ok(updatedUser);  //Respond with updated user info
    }

    //Handle DELETE request to delete user by ID
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> DeleteUserProfile(@PathVariable("userId") Long userId) 
    {
        userService.DeleteUserProfile(userId);      //Call service to delete user
        return ResponseEntity.noContent().build();  //Return 204 No Content
    }
}