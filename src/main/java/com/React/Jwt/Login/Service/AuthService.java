package com.React.Jwt.Login.Service;                                        //Package declaration
import com.React.Jwt.Login.Entity.Auth.AuthRequest;                         //AuthRequest entity for user authentication input
import com.React.Jwt.Login.Entity.Auth.AuthResponse;                        //AuthResponse entity for response after authentication
import com.React.Jwt.Login.Entity.Auth.ForgotLoginCredential;               //ForgotLoginCredential entity for resetting username and password
import com.React.Jwt.Login.Exception.EmailNotFoundException;                //Custom exception for email not found
import com.React.Jwt.Login.DTO.Auth.AuthResponseDTO;                        //DTO for formatted response after authentication
import com.React.Jwt.Login.DTO.Auth.ForgotLoginCredentialDTO;               //DTO for resetting username and password
import com.React.Jwt.Login.Entity.User;                                     //User entity for user data
import com.React.Jwt.Login.Repository.UserRepository;                       //User repository for querying user data
import com.React.Jwt.Login.Security.JWT.JwtAuthenticationToken;             //Custom authentication token for JWT authentication
import com.React.Jwt.Login.Security.JWT.JwtUtil;                            //Utility class for JWT token generation and validation
import org.springframework.beans.factory.annotation.Autowired;              //For dependency injection
import org.springframework.security.core.Authentication;                    //Authentication interface for user details
import org.springframework.security.core.authority.SimpleGrantedAuthority;  //Simple authority object for roles
import org.springframework.security.core.context.SecurityContextHolder;     //Holds authentication details
import org.springframework.security.crypto.password.PasswordEncoder;        //For encoding and matching passwords
import org.springframework.stereotype.Service;                              //Marks the class as a service
import java.util.List;                                                      //For handling lists of roles
import java.util.stream.Collectors;                                         //For collecting stream elements into a list

@Service    //Marks the class as a service, so Spring can manage it
public class AuthService 
{
    private final UserRepository userRepository;    //User repository for interacting with the user database
    private final JwtUtil JwtUtil;                //Utility for working with JWT tokens
    private final PasswordEncoder passwordEncoder;  //Password encoder for securely handling passwords

    @Autowired  //Constructor-based dependency injection for necessary services
    public AuthService(UserRepository userRepository, JwtUtil JwtUtil, PasswordEncoder passwordEncoder) 
    {
        this.userRepository = userRepository;
        this.JwtUtil = JwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    //Authenticate the user and generate token including roles
    public AuthResponseDTO authenticate(AuthRequest authRequest) 
    {
        //Retrieve user from database based on username
        User user = userRepository.findByUsername(authRequest.getUsername()).orElseThrow(() -> new RuntimeException("User not found"));

        //Validate if the provided password matches the user's stored password
        if(!passwordEncoder.matches(authRequest.getPassword(), user.getPassword())) 
            throw new RuntimeException("Invalid credentials");              //Throw error if password doesn't match

        //Generate JWT token using the username and role(s)
        String token = JwtUtil.generateToken(user.getUsername(), List.of(user.getRole().name()));

        //Return AuthResponseDTO containing the token, success message, and role-based welcome message
        return AuthResponseDTO.builder().userId(user.getUserId()).firstName(user.getFirstName()).lastName(user.getLastName()).phone(user.getPhone())
        .address(user.getAddress()).email(user.getEmail()).username(user.getUsername()).role(user.getRole()).token(token)
        .message("Authentication successful").build();
    }

    //Allow user to reset username and password by providing their email address
    public ForgotLoginCredentialDTO ResetLoginCredential(ForgotLoginCredential forgotLoginCredential) 
    {
        //Validate input: check for null object or missing/blank email
        if(forgotLoginCredential == null || forgotLoginCredential.getEmail() == null || forgotLoginCredential.getEmail().isBlank()) 
            throw new IllegalArgumentException("Email must be provided");

        //Retrieve user by email; throw custom exception if not found
        User user = userRepository.findByEmail(forgotLoginCredential.getEmail()).orElseThrow(() -> new EmailNotFoundException(forgotLoginCredential.getEmail()));

        //Update username if a non-blank value is provided
        if(forgotLoginCredential.getUsername() != null && !forgotLoginCredential.getUsername().isBlank())
            user.setUsername(forgotLoginCredential.getUsername());

        //Update password if a non-blank value is provided (after encoding)
        if(forgotLoginCredential.getPassword() != null && !forgotLoginCredential.getPassword().isBlank()) 
            user.setPassword(passwordEncoder.encode(forgotLoginCredential.getPassword()));

        //Attempt to save the updated user; throw runtime exception on failure
        try 
        {
            userRepository.save(user);
        } 
        
        catch (Exception e) 
        {
            throw new RuntimeException("Failed to update user credentials", e);
        }

        //Return a DTO with updated user info and success message
        return ForgotLoginCredentialDTO.builder().email(user.getEmail()).username(user.getUsername()).message("Updated user credential successfully!").build();
    }

    //Authenticate using JWT token
    public Authentication authenticateWithJwt(String token) 
    {
        //Check if the provided JWT token is valid
        if(JwtUtil.isTokenValid(token)) 
        {
            String username = JwtUtil.getUsernameFromToken(token); //Extract the username from the token

            //Extract the roles from the token and convert them to authorities
            List<SimpleGrantedAuthority> authorities = JwtUtil.getRolesFromToken(token).stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList());

            //Create a custom JwtAuthenticationToken with the extracted information
            JwtAuthenticationToken jwtAuthenticationToken = new JwtAuthenticationToken(username, authorities, token);

            //Set the created authentication token into the security context
            SecurityContextHolder.getContext().setAuthentication(jwtAuthenticationToken);

            return jwtAuthenticationToken;                              //Return the authentication token
        }
        throw new RuntimeException("Invalid or expired token"); //Throw error if token is invalid or expired
    }

    //Refresh JWT token
    public AuthResponse refreshToken(String oldToken) 
    {
        //Check if the provided old JWT token is valid
        if(JwtUtil.isTokenValid(oldToken)) 
        {
            String username = JwtUtil.getUsernameFromToken(oldToken);      //Extract username and roles from the old token
            List<String> roles = JwtUtil.getRolesFromToken(oldToken);
            String newToken = JwtUtil.generateToken(username, roles);      //Generate a new token with the same username and roles
            return AuthResponse.builder().token(newToken).build();          //Return the new token inside an AuthResponse
        }

        throw new RuntimeException("Invalid or expired token");     //Throw error if token is invalid or expired
    }
}