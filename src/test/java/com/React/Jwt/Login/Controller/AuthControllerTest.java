package com.React.Jwt.Login.Controller;                         //Defines the package for the AuthController test class
import com.React.Jwt.Login.DTO.Auth.AuthRequestDTO;             //Imports the AuthRequestDTO class for login request payload
import com.React.Jwt.Login.DTO.Auth.AuthResponseDTO;            //Imports the AuthResponseDTO class for the response payload
import com.React.Jwt.Login.DTO.Auth.ForgotLoginCredentialDTO;   //Imports DTO for forgot login credential response
import com.React.Jwt.Login.Entity.Auth.AuthResponse;            //Imports the AuthResponse entity for authentication responses
import com.React.Jwt.Login.Entity.Auth.ForgotLoginCredential;   //Imports ForgotLoginCredential entity for storing login credentials
import com.React.Jwt.Login.Exception.EmailNotFoundException;    //Imports the custom exception for email not found
import com.React.Jwt.Login.Service.AuthService;                 //Imports AuthService for mocking authentication logic
import org.junit.jupiter.api.BeforeEach;                        //Imports BeforeEach annotation to setup before each test
import org.junit.jupiter.api.Test;                              //Imports Test annotation to define test methods
import org.junit.jupiter.api.extension.ExtendWith;              //Imports ExtendWith for extending test class functionality
import static org.mockito.ArgumentMatchers.any;                 //Imports ArgumentMatchers for mocking argument matching
import static org.mockito.Mockito.*;                            //Imports Mockito static methods to mock behavior
import static org.junit.jupiter.api.Assertions.*;               //Imports JUnit assertions to validate test results
import org.mockito.InjectMocks;                                 //Allows injection of mocked dependencies into the class under test
import org.mockito.Mock;                                        //Mock annotation to define dependencies to be mocked
import org.mockito.junit.jupiter.MockitoExtension;              //Extension for integrating Mockito with JUnit
import org.springframework.http.HttpStatus;                     //Imports HttpStatus for HTTP status code usage
import org.springframework.http.ResponseEntity;                 //Imports ResponseEntity to handle HTTP responses

@ExtendWith(MockitoExtension.class) //Integrates Mockito for mocking dependencies in the test class
class AuthControllerTest 
{
    @Mock
    private AuthService authService;            //Mocks AuthService, the dependency of AuthController

    @InjectMocks
    private AuthController authController;      //Injects mocked AuthService into the AuthController being tested

    private AuthRequestDTO validRequestDTO;     //Declares a valid AuthRequestDTO for login request
    private AuthResponseDTO successResponseDTO; //Declares an expected successful response DTO for authentication

    @BeforeEach //Sets up mock data before each test
    void setUp() 
    {
        validRequestDTO = new AuthRequestDTO();             //Initializes a new AuthRequestDTO
        validRequestDTO.setUsername("user");        //Sets the username for the valid request
        validRequestDTO.setPassword("password");    //Sets the password for the valid request

        //Initializes a mock AuthResponseDTO with token and success message
        successResponseDTO = AuthResponseDTO.builder().token("mock-token").message("Login successful").build();
    }

    @Test   //Positive test for successful login
    void testLoginSuccess() 
    {
        //Mocks the behavior to return a successful response
        when(authService.authenticate(any())).thenReturn(successResponseDTO);

        ResponseEntity<AuthResponseDTO> response = authController.login(validRequestDTO);  //Calls login method

        //Asserts that the response has a 200 OK status and the expected token and message
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("mock-token", response.getBody().getToken());
        assertEquals("Login successful", response.getBody().getMessage());
    }

    @Test   //Negative test for login failure (invalid credentials)
    void testLoginFailure() 
    {
        //Mocks failure by throwing an exception
        when(authService.authenticate(any())).thenThrow(new RuntimeException("Invalid credentials"));

        //Calls login method
        ResponseEntity<AuthResponseDTO> response = authController.login(validRequestDTO);  

        //Asserts that the response has a 401 Unauthorized status and the failure message
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNull(response.getBody().getToken());
        assertEquals("Authentication failed", response.getBody().getMessage());
    }

    @Test   //Positive test for refreshing a token
    void testRefreshTokenSuccess() 
    {
        String oldToken = "oldToken";                 //Defines an old token to be refreshed
        AuthResponse refreshed = new AuthResponse();  //Creates a new AuthResponse object with the new token
        refreshed.setToken("newToken");

        //Mocks the behavior to return a refreshed token
        when(authService.refreshToken(oldToken)).thenReturn(refreshed);

        ResponseEntity<AuthResponseDTO> response = authController.refreshToken(oldToken);   //Calls refreshToken method

        //Asserts that the response has a 200 OK status and the new token with success message
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("newToken", response.getBody().getToken());
        assertEquals("Token refreshed successfully", response.getBody().getMessage());
    }

    @Test   //Negative test for refresh token failure (expired token)
    void testRefreshTokenFailure() 
    {
        String oldToken = "expiredToken";           //Defines an expired token to simulate failure

        //Mocks failure by throwing an exception
        when(authService.refreshToken(oldToken)).thenThrow(new RuntimeException("Token invalid"));

        ResponseEntity<AuthResponseDTO> response = authController.refreshToken(oldToken);   //Calls refreshToken method

        //Asserts that the response has a 403 Forbidden status and failure message
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNull(response.getBody().getToken());
        assertEquals("Token refresh failed", response.getBody().getMessage());
    }

    @Test   //Test case for accessing a protected resource
    void testProtectedResource() 
    {
        ResponseEntity<String> response = authController.getProtectedResource();   //Calls the protected resource method

        //Asserts that the response has a 200 OK status and the expected message
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("This is a protected resource.", response.getBody());
    }

    @Test   //Positive test for forgot login credential reset
    public void testForgotLoginCredentialSuccess() 
    {
        //Sets up the expected response for successful reset
        ForgotLoginCredentialDTO expectedResponse = ForgotLoginCredentialDTO.builder().message("Reset successful").build();  

        //Mocks the reset behavior
        when(authService.ResetLoginCredential(any(ForgotLoginCredential.class))).thenReturn(expectedResponse);

        //Uses Lombok builder to create the request
        ForgotLoginCredential forgotLoginCredential = ForgotLoginCredential.builder().email("user@example.com").build();

        //Calls reset method
        ResponseEntity<ForgotLoginCredentialDTO> responseEntity = authController.resetLoginCredential(forgotLoginCredential);  

        //Asserts the success response with a 200 OK status and expected message
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertEquals("Reset successful", responseEntity.getBody().getMessage());
        
        //Verifies that the reset method was called once
        verify(authService, times(1)).ResetLoginCredential(any(ForgotLoginCredential.class));
    }

    @Test   //Negative test for forgot login credential failure (email not found)
    public void testForgotLoginCredentialFailure_EmailNotFound() 
    {
        //Mocks failure due to email not found
        when(authService.ResetLoginCredential(any(ForgotLoginCredential.class))).thenThrow(new EmailNotFoundException("nonexistent@example.com"));

        //Builds ForgotLoginCredential with the email
        ForgotLoginCredential forgotLoginCredential = ForgotLoginCredential.builder().email("nonexistent@example.com").build();

        //Calls reset method
        ResponseEntity<ForgotLoginCredentialDTO> responseEntity = authController.resetLoginCredential(forgotLoginCredential);  

        //Asserts that the response has a 404 NOT_FOUND status and a failure message
        assertEquals(HttpStatus.NOT_FOUND, responseEntity.getStatusCode());
        assertEquals("nonexistent@example.com not found in DB", responseEntity.getBody().getMessage());
        
        //Verifies that the reset method was called once
        verify(authService, times(1)).ResetLoginCredential(any(ForgotLoginCredential.class));
    }
}