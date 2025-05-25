package com.React.Jwt.Login.DTO;                            //Package declaration
import org.springframework.web.bind.annotation.CrossOrigin; //Enables CORS for cross-origin requests
import com.React.Jwt.Login.Enum.Role;                       //Importing Role enum
import jakarta.validation.constraints.Email;                //Validates that the email format is correct
import jakarta.validation.constraints.NotBlank;             //Ensures the field is not null or empty
import jakarta.validation.constraints.NotNull;              //Ensures the field is not null (used for non-String fields)
import jakarta.validation.constraints.Pattern;              //Validates string against a regular expression pattern
import jakarta.validation.constraints.Size;                 //Validates the length of a string
import lombok.*;                                            //Imports Lombok annotations to reduce boilerplate code (e.g., getters, setters, constructors)

@Getter             //Lombok: generates getter methods for all fields
@Setter             //Lombok: generates setter methods for all fields
@NoArgsConstructor  //Lombok: generates a no-argument constructor
@AllArgsConstructor //Lombok: generates a constructor with all fields as parameters
@Builder            //Lombok: enables the builder pattern for creating instances of this class
@CrossOrigin(origins = "http://localhost:3000")
public class UserDTO 
{ 
    private Long userId;                                                                    //ID of the user (typically auto-generated; not validated manually)

    @NotBlank(message = "First name is required")                                           //Validates that username is not null or empty
    @Size(min = 4, max = 30, message = "First name must be between 4 and 30 characters")    //Validates username length
    private String firstName;                                                               //Field to store the user's firstName

    @NotBlank(message = "Last name is required")                                            //Validates that username is not null or empty
    @Size(min = 4, max = 20, message = "Username must be between 4 and 30 characters")      //Validates username length
    private String lastName;                                                                //Field to store the user's lastName

    @NotBlank(message = "Username is required")                                             //Validates that username is not null or empty
    @Size(min = 4, max = 20, message = "Username must be between 4 and 20 characters")      //Validates username length
    private String username;                                                                //Field to store the user's username

    @NotBlank(message = "Email is required")                                                //Validates that email is not null or empty
    @Email(message = "Email must be valid")                                                 //Validates email format
    private String email;                                                                   //Field to store the user's email address

    @NotBlank(message = "Phone number is required")                                         //Validates that phone number is not null or empty
    @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Invalid phone number")                //Valiate phone number format
    private String phoneNumber;                                                             //Field to store phone number

    @NotBlank(message = "Home address is required")                                         //Validates that home address is not null or empty
    private String homeAddress;                                                             //Field to store the user's home address

    @NotBlank(message = "Password is required")                                             //Validates that password is not null or empty
    @Size(min = 8, message = "Password must be at least 8 characters")                      //Validates password length
    private String password;                                                                //Field to store the user's password

    @NotNull(message = "Role is required")                                                  //Ensures the role is not null
    private Role role;                                                                      //Field to store the user's role (e.g., ADMIN, CUSTOMER)
}