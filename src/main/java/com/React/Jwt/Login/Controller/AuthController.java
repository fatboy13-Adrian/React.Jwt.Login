package com.React.Jwt.Login.Controller;                         //Declares the package that this class belongs to, used for grouping related classes
import com.React.Jwt.Login.DTO.Auth.AuthRequestDTO;             //Imports the DTO (Data Transfer Object) used to receive login credentials from the client
import com.React.Jwt.Login.DTO.Auth.AuthResponseDTO;            //Imports the DTO used to send authentication results (e.g., JWT token) back to the client
import com.React.Jwt.Login.Entity.Auth.AuthRequest;             //Imports the internal entity representing login request data in the application logic
import com.React.Jwt.Login.Entity.Auth.AuthResponse;            //Imports the internal entity representing authentication result used internally
import com.React.Jwt.Login.Entity.Auth.ForgotLoginCredential;   //Imports the entity used to reset username and passwor
import com.React.Jwt.Login.Service.AuthService;                 //Imports the authentication service which handles business logic for auth operations
import org.springframework.beans.factory.annotation.Autowired;  //Imports Spring's annotation to enable automatic dependency injection
import org.springframework.http.HttpStatus;                     //Imports HTTP status codes such as OK (200), UNAUTHORIZED (401), FORBIDDEN (403)
import org.springframework.http.ResponseEntity;                 //Imports the ResponseEntity class used to build complete HTTP responses (body + status code)
import org.springframework.web.bind.annotation.*;               //Imports Spring annotation to define a REST API controller
import com.React.Jwt.Login.Exception.EmailNotFoundException;    //Custom exception for email not found
import com.React.Jwt.Login.DTO.Auth.ForgotLoginCredentialDTO;   //DTO for resetting username and password

@CrossOrigin(origins = "http://localhost:3000")                 //Enables CORS (Cross-Origin Resource Sharing) for frontend access (e.g., React app on port 3000)
@RestController                                                 //Marks this class as a REST controller, which handles HTTP requests and returns JSON/XML
@RequestMapping("/auth")                                        //Base path for all endpoints in this controller will be prefixed with "/auth"
public class AuthController 
{
    private final AuthService authService;  //Declares a final reference to the authentication service

    //Constructor-based dependency injection for the AuthService bean
    @Autowired
    public AuthController(AuthService authService) 
    {
        this.authService = authService;
    }

    //HTTP POST endpoint at /auth/login to authenticate a user
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody AuthRequestDTO authRequestDTO) 
    {
        try 
        {
            //Create a new AuthRequest entity and populate it from the received DTO
            AuthRequest authRequest = new AuthRequest();
            authRequest.setUsername(authRequestDTO.getUsername());
            authRequest.setPassword(authRequestDTO.getPassword());

            //Pass the request entity to the authentication service and receive a response DTO
            AuthResponseDTO authResponseDTO = authService.authenticate(authRequest);

            //Return HTTP 200 OK status with the response body
            return ResponseEntity.ok(authResponseDTO);
        } 
        
        catch(Exception e) 
        {
            //If any exception occurs during authentication, return a failure message and 401 Unauthorized
            AuthResponseDTO authResponseDTO = AuthResponseDTO.builder().token(null).message("Authentication failed").build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(authResponseDTO);
        }
    }

    //HTTP POST endpoint at /auth/refresh to refresh JWT tokens
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refreshToken(@RequestBody String oldToken) 
    {
        try 
        {
            //Calls the auth service to refresh the token using the old one
            AuthResponse authResponse = authService.refreshToken(oldToken);

            //Build a response DTO from the refreshed token
            AuthResponseDTO authResponseDTO = AuthResponseDTO.builder().token(authResponse.getToken()).message("Token refreshed successfully").build();

            //Return HTTP 200 OK with the new token in response
            return ResponseEntity.ok(authResponseDTO);
        } 
        
        catch(Exception e) 
        {
            //If token refresh fails, return a 403 Forbidden response with appropriate message
            AuthResponseDTO authResponseDTO = AuthResponseDTO.builder().token(null).message("Token refresh failed").build();
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(authResponseDTO);
        }
    }

    //HTTP GET endpoint at /auth/protected used to test access to a protected resource
    @GetMapping("/protected")
    public ResponseEntity<String> getProtectedResource() 
    {
        return ResponseEntity.ok("This is a protected resource.");  //Returns a simple success message with HTTP 200 OK
    }

    //Endpoint to allow user to reset their username and password using email
    @PostMapping("/forgotLogin")
    public ResponseEntity<ForgotLoginCredentialDTO> resetLoginCredential(@RequestBody ForgotLoginCredential forgotLoginCredential) 
    {
        try 
        {
            //Basic validation: check if request or email is missing/blank
            if(forgotLoginCredential == null || forgotLoginCredential.getEmail() == null || forgotLoginCredential.getEmail().isBlank())
                return ResponseEntity.badRequest().body(ForgotLoginCredentialDTO.builder().message("Email must be provided").build());
            
            //Delegate to service to reset credentials
            ForgotLoginCredentialDTO response = authService.ResetLoginCredential(forgotLoginCredential);
            return ResponseEntity.ok(response);
        } 
        
        catch(EmailNotFoundException e) 
        {
            //Email not found — return 404 with custom message
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ForgotLoginCredentialDTO.builder().message(e.getMessage()).build());

        } 
        
        catch(IllegalArgumentException e) 
        {
            //Input validation error — return 400 with message
            return ResponseEntity.badRequest().body(ForgotLoginCredentialDTO.builder().message(e.getMessage()).build());

        } 
        
        catch(Exception e) 
        {
            //Log unhandled exceptions for diagnostics
            System.err.println("Error resetting login credentials: " + e.getMessage());
            e.printStackTrace();

            //Return generic 500 error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ForgotLoginCredentialDTO.builder()
            .message("An error occurred while resetting credentials").build());
        }
    }
}