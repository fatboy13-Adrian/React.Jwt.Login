package com.React.Jwt.Login.Service;                                    //Define the package location for the test class
import com.React.Jwt.Login.Enum.Role;                                   //Import role enum for assigning user roles
import com.React.Jwt.Login.Exception.EmailNotFoundException;            //Import custom exception for email not found
import com.React.Jwt.Login.DTO.Auth.AuthResponseDTO;                    //Import the DTO class for authentication responses
import com.React.Jwt.Login.DTO.Auth.ForgotLoginCredentialDTO;           //Import the DTO class for forgot login credential
import com.React.Jwt.Login.Entity.Auth.AuthRequest;                     //Import the request entity used for login
import com.React.Jwt.Login.Entity.Auth.AuthResponse;                    //Import the response entity used for token refresh
import com.React.Jwt.Login.Entity.Auth.ForgotLoginCredential;           //Import the forgot login credential entity used for resetting username and password
import com.React.Jwt.Login.Entity.User;                                 //Import the User entity model
import com.React.Jwt.Login.Repository.UserRepository;                   //Import repository interface to mock DB operations
import com.React.Jwt.Login.Security.JWT.JwtAuthenticationToken;         //Import custom JWT authentication token implementation
import com.React.Jwt.Login.Security.JWT.JwtUtil;                        //Import utility class for JWT operations
import org.junit.jupiter.api.BeforeEach;                                //Import JUnit lifecycle method for setup
import org.junit.jupiter.api.Test;                                      //Import JUnit for writing unit tests
import org.junit.jupiter.api.extension.ExtendWith;                      //Import JUnit extension support for Mockito
import org.mockito.InjectMocks;                                         //Import Mockito annotation for injecting mocks
import org.mockito.Mock;                                                //Import Mockito annotation for mocking dependencies
import org.mockito.junit.jupiter.MockitoExtension;                      //Import JUnit integration for Mockito extension
import org.springframework.security.core.Authentication;                //Import Spring Security Authentication interface
import org.springframework.security.crypto.password.PasswordEncoder;    //Import password encoder interface from Spring Security
import java.util.List;                                                  //Import collections for roles
import java.util.Optional;                                              //Import optional for handling absent values
import static org.junit.jupiter.api.Assertions.*;                       //Static import for assertions
import static org.mockito.ArgumentMatchers.any;                         //Allows flexible argument matching in Mockito
import static org.mockito.Mockito.*;                                    //Static import for mocking behavior

@ExtendWith(MockitoExtension.class) //Enable Mockito extension for this test class
class AuthServiceTest 
{
    @Mock
    private UserRepository userRepository;      //Mock the UserRepository dependency

    @Mock
    private JwtUtil JwtUtil;                    //Mock the JwtUtil dependency

    @Mock
    private PasswordEncoder passwordEncoder;    //Mock the PasswordEncoder dependency

    @InjectMocks
    private AuthService authService;            //Inject mocked dependencies into AuthService

    //Declare test variables
    private AuthRequest authRequest;
    private User user, mockUser;

    @BeforeEach //Initialize test data before each test
    void setUp() 
    {
        authRequest = new AuthRequest("testUser", "password");  //create sample auth request
        user = new User();                                                          //instantiate new user
        user.setUsername("testUser");                                       //set username
        user.setPassword("encodedPassword");                                //set encoded password
        user.setRole(Role.CUSTOMER);                                                //assign user role
        mockUser = new User();                                                      //instantiate an existing user
        mockUser.setEmail("test@example.com");                                  //set email
        mockUser.setUsername("oldUser");                                    //set old username
        mockUser.setPassword("oldPasswordHash");                            //set old password
    }

    @Test   //Test: valid credentials should return successful AuthResponseDTO
    void authenticate_ValidCredentials_ReturnsAuthResponseDTO() 
    {
        when(userRepository.findByUsername("testUser")).thenReturn(Optional.of(user));              //mock user found
        when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true);                      //mock password match
        when(JwtUtil.generateToken("testUser", List.of("CUSTOMER"))).thenReturn("mockedToken"); //mock token generation
        AuthResponseDTO response = authService.authenticate(authRequest);                                   //call method under test
        assertNotNull(response);                                                                            //assert response is not null
        assertEquals("mockedToken", response.getToken());                                           //assert correct token
        assertEquals("Authentication successful", response.getMessage());                           //assert success message
    }

    @Test   //Test: user not found should throw RuntimeException
    void authenticate_UserNotFound_ThrowsRuntimeException() 
    {
        when(userRepository.findByUsername("testUser")).thenReturn(Optional.empty());   //mock user not found
        
        //expect exception
        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.authenticate(authRequest)); 
        assertEquals("User not found", exception.getMessage());                         //assert correct error message
    }

    @Test   //Test: invalid password should throw RuntimeException
    void authenticate_InvalidPassword_ThrowsRuntimeException() 
    {
        when(userRepository.findByUsername("testUser")).thenReturn(Optional.of(user));      //mock user found
        when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(false);             //mock password mismatch
        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.authenticate(authRequest)); //expect exception
        assertEquals("Invalid credentials", exception.getMessage());                                                        //assert correct error message
    }

    @Test   //Test: valid JWT token should return Authentication object
    void authenticateWithJwt_ValidToken_ReturnsAuthentication() 
    {
        String token = "valid.jwt.token";                                           //define sample token
        when(JwtUtil.isTokenValid(token)).thenReturn(true);                         //mock valid token
        when(JwtUtil.getUsernameFromToken(token)).thenReturn("testUser");           //mock username extraction
        when(JwtUtil.getRolesFromToken(token)).thenReturn(List.of("USER"));     //mock roles extraction
        Authentication authentication = authService.authenticateWithJwt(token);     //call method under test
        assertNotNull(authentication);                                              //assert authentication is not null
        assertEquals("testUser", authentication.getName());                 //assert correct username
        assertEquals(token, ((JwtAuthenticationToken) authentication).getToken());  //assert correct token
    }

    @Test   //Test: invalid JWT token should throw RuntimeException
    void authenticateWithJwt_InvalidToken_ThrowsRuntimeException() 
    {
        String token = "invalid.jwt.token";                                         //define invalid token
        when(JwtUtil.isTokenValid(token)).thenReturn(false);                        //mock invalid token
        
        //expect exception
        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.authenticateWithJwt(token)); 
        assertEquals("Invalid or expired token", exception.getMessage());   //assert correct error message
    }

    @Test   //Test: valid refresh token should return a new token
    void refreshToken_ValidToken_ReturnsNewToken() 
    {
        String oldToken = "old.jwt.token";                                                                  //define old token
        when(JwtUtil.isTokenValid(oldToken)).thenReturn(true);                                             //mock valid token
        when(JwtUtil.getUsernameFromToken(oldToken)).thenReturn("testUser");                               //mock username extraction
        when(JwtUtil.getRolesFromToken(oldToken)).thenReturn(List.of("USER"));                          //mock roles extraction
        when(JwtUtil.generateToken("testUser", List.of("USER"))).thenReturn("new.jwt.token");   //mock new token generation
        AuthResponse response = authService.refreshToken(oldToken);                                         //call method under test
        assertNotNull(response);                                                                            //assert response is not null
        assertEquals("new.jwt.token", response.getToken());                                         //assert new token value
    }

    @Test   //Test: invalid refresh token should throw RuntimeException
    void refreshToken_InvalidToken_ThrowsRuntimeException() 
    {
        String oldToken = "expired.jwt.token";                                      //define expired token
        when(JwtUtil.isTokenValid(oldToken)).thenReturn(false);                     //mock invalid token
        
        //expect exception
        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.refreshToken(oldToken)); 
        assertEquals("Invalid or expired token", exception.getMessage());   //assert correct error message
    }

    @Test   //Test case: Successfully update both username and password
    void testResetLoginCredential_updateUsernameAndPassword_success() 
    {
        //Prepare the request DTO
        ForgotLoginCredential request = new ForgotLoginCredential();
        request.setEmail("test@example.com");
        request.setUsername("newUser");
        request.setPassword("newPassword");

        //Mock repository and password encoder behavior
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.encode("newPassword")).thenReturn("hashedPassword");

        //Call the service method under test
        ForgotLoginCredentialDTO response = authService.ResetLoginCredential(request);

        //Assert returned values match expectations
        assertEquals("test@example.com", response.getEmail());
        assertEquals("newUser", response.getUsername());
        assertEquals("Updated user credential successfully!", response.getMessage());

        //Verify that the save method was called
        verify(userRepository).save(any(User.class));
    }

    @Test   //Test case: Update only the username
    void testResetLoginCredential_updateOnlyUsername_success() 
    {
        //Prepare the request DTO with password null
        ForgotLoginCredential request = new ForgotLoginCredential();
        request.setEmail("test@example.com");
        request.setUsername("newUser");
        request.setPassword(null);

        //Mock repository response
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));

        //Execute the service method
        ForgotLoginCredentialDTO response = authService.ResetLoginCredential(request);

        //Verify only username is updated
        assertEquals("test@example.com", response.getEmail());
        assertEquals("newUser", response.getUsername());

        //Confirm save was called
        verify(userRepository).save(any(User.class));
    }

    @Test   //Test case: Update only the password
    void testResetLoginCredential_updateOnlyPassword_success() 
    {
        //Prepare the request DTO with username null
        ForgotLoginCredential request = new ForgotLoginCredential();
        request.setEmail("test@example.com");
        request.setUsername(null);
        request.setPassword("newPassword");

        //Mock repository and password encoding
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.encode("newPassword")).thenReturn("hashedPassword");

        //Execute the service method
        ForgotLoginCredentialDTO response = authService.ResetLoginCredential(request);

        //Verify only password is updated; username remains unchanged
        assertEquals("test@example.com", response.getEmail());
        assertEquals("oldUser", response.getUsername());

        //Confirm save was called
        verify(userRepository).save(any(User.class));
    }

    @Test   //Test case: Email not found in database
    void testResetLoginCredential_emailNotFound_throwsException() 
    {
        //Prepare a request with a non-existent email
        ForgotLoginCredential request = new ForgotLoginCredential();
        request.setEmail("nonexistent@example.com");
        request.setUsername("user");
        request.setPassword("pass");

        //Mock repository to return empty
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        //Assert exception is thrown when trying to reset with an unknown email
        assertThrows(EmailNotFoundException.class, () -> 
        {
            authService.ResetLoginCredential(request);
        });

        //Ensure no save operation was triggered
        verify(userRepository, never()).save(any());
    }

    //Test case: Null input should throw NullPointerException
    @Test
    void testResetLoginCredential_nullInput_throwsException() 
    {
        //Assert that passing null to ResetLoginCredential throws IllegalArgumentException
        IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> 
        {
            authService.ResetLoginCredential(null); //Simulate null input
        });

        //Verify the exception message matches expected
        assertEquals("Email must be provided", thrown.getMessage());
    }

    //Test case: No new username or password is provided
    @Test
    void testResetLoginCredential_noNewValuesProvided() 
    {
        //Prepare a valid email with no changes in credentials
        ForgotLoginCredential request = new ForgotLoginCredential();
        request.setEmail("test@example.com");
        request.setUsername(null);
        request.setPassword(null);

        //Mock repository response
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));

        //Execute service method
        ForgotLoginCredentialDTO response = authService.ResetLoginCredential(request);

        //Assert unchanged data is returned
        assertEquals("test@example.com", response.getEmail());
        assertEquals("oldUser", response.getUsername());

        //Verify user is still saved even if unchanged
        verify(userRepository).save(any(User.class));
    }
}