package com.React.Jwt.Login.Controller;                 //Declares the package for controller classes
import com.React.Jwt.Login.DTO.UserDTO;                 //Imports the User Data Transfer Object
import com.React.Jwt.Login.DTO.Auth.AuthResponseDTO;    //Imports the Authentication Response DTO
import com.React.Jwt.Login.Enum.Role;                   //Imports the Role enum (e.g., CUSTOMER, ADMIN)
import com.React.Jwt.Login.Exception.*;                 //Imports custom exception classes
import com.React.Jwt.Login.Service.UserService;         //Imports the UserService interface
import org.junit.jupiter.api.BeforeEach;                //JUnit 5 annotation for lifecycle methods like @BeforeEach
import org.junit.jupiter.api.Test;                      //JUnit 5 annotation for marking test methods
import org.junit.jupiter.api.extension.ExtendWith;      //JUnit 5 extension support for integrating Mockito
import org.mockito.InjectMocks;                         //Mockito annotation to inject mocks
import org.mockito.Mock;                                //Mockito annotation to create mock objects
import org.mockito.junit.jupiter.MockitoExtension;      //Enables Mockito support for JUnit 5
import org.springframework.http.HttpStatus;             //Imports HTTP status codes
import org.springframework.http.ResponseEntity;         //Represents the full HTTP response including body, status, and headers
import java.util.Collections;                           //Imports utility class for creating immutable singleton lists
import java.util.List;                                  //Imports List interface for user list operations
import static org.junit.jupiter.api.Assertions.*;       //Static import for assertion methods
import static org.mockito.ArgumentMatchers.*;           //Static import for argument matchers
import static org.mockito.Mockito.*;                    //Static import for Mockito behavior verification

@ExtendWith(MockitoExtension.class) //Enables Mockito support for this test class
public class UserControllerTest 
{
    @Mock
    private UserService userService;        //Mocks the UserService dependency

    @InjectMocks
    private UserController userController;  //Injects the mocked dependencies into UserController

    private UserDTO userDTO;                //Test user data used across multiple test methods

    //Initializes test data before each test
    @BeforeEach
    public void setUp() 
    {
        userDTO = UserDTO.builder().userId(1L).firstName("test").lastName("test1").address("123 Street").phone("+6512345678")
        .username("testUser").email("test@example.com").password("password123").role(Role.CUSTOMER).build(); 
    }

    //Test for successful user registration
    @Test
    public void testRegisterNewUser_Success() 
    {
        when(userService.RegisterNewUser(any(UserDTO.class))).thenReturn(userDTO);                  //Mocks service response
        ResponseEntity<UserDTO> response = userController.RegisterNewUser(userDTO);                     //Calls controller method
        assertEquals(HttpStatus.OK, response.getStatusCode());                                          //Asserts 200 OK
        assertEquals(userDTO, response.getBody());                                                      //Asserts response body
        verify(userService, times(1)).RegisterNewUser(any(UserDTO.class));  //Verifies service method call
    }

    //Test for registration failure when email already exists
    @Test
    public void testRegisterNewUser_EmailAlreadyExists() 
    {
        String email = userDTO.getEmail();  //Gets test email
        when(userService.RegisterNewUser(any(UserDTO.class))).thenThrow(new EmailAlreadyExistsException(email));    //Mocks exception throw

        //Asserts exception is thrown
        EmailAlreadyExistsException ex = assertThrows(EmailAlreadyExistsException.class, () -> userController.RegisterNewUser(userDTO));      
        assertEquals(email + " already exists in database", ex.getMessage());                               //Validates exception message
        verify(userService, times(1)).RegisterNewUser(any(UserDTO.class));  //Verifies service method call
    }

    //Test for successfully getting current user info
    @Test
    public void testGetCurrentUser_Success() 
    {
        when(userService.getCurrentUser()).thenReturn(userDTO);                 //Mocks service response
        ResponseEntity<UserDTO> response = userController.getCurrentUser();     //Calls controller
        assertEquals(HttpStatus.OK, response.getStatusCode());                  //Asserts 200 OK
        assertEquals(userDTO, response.getBody());                              //Asserts user data
        verify(userService, times(1)).getCurrentUser(); //Verifies service method call
    }

    //Test when getting current user throws an exception
    @Test
    public void testGetCurrentUser_Failure() 
    {
        when(userService.getCurrentUser()).thenThrow(new RuntimeException("Service Error"));    //Mocks exception

        //Asserts exception is thrown
        RuntimeException exception = assertThrows(RuntimeException.class, () -> userController.getCurrentUser());                    
        assertEquals("Service Error", exception.getMessage());              //Validates message
        verify(userService, times(1)).getCurrentUser();     //Verifies service call
    }

    //Test for viewing a user profile successfully
    @Test
    public void testViewUserProfile_Success() 
    {
        when(userService.ViewUserProfile(anyLong())).thenReturn(userDTO);                   //Mocks service return
        ResponseEntity<UserDTO> response = userController.ViewUserProfile(1L);      //Calls controller method
        assertEquals(HttpStatus.OK, response.getStatusCode());                              //Asserts 200 OK
        assertEquals(userDTO, response.getBody());                                          //Asserts response body
        verify(userService, times(1)).ViewUserProfile(1L);  //Verifies service call
    }

    //Test when viewing a user profile with invalid ID throws an exception
    @Test
    public void testViewUserProfile_UserNotFound() 
    {
        Long userId = 1L;   //Sets test user ID
        when(userService.ViewUserProfile(userId)).thenThrow(new UserNotFoundException(userId.toString()));  //Mocks exception

        //Asserts exception thrown
        UserNotFoundException exception = assertThrows(UserNotFoundException.class,() -> userController.ViewUserProfile(userId));             
        assertEquals("User ID " + userId + " not found", exception.getMessage());           //Validates message
        verify(userService, times(1)).ViewUserProfile(userId);  //Verifies method call
    }

    //Test for viewing all user profiles
    @Test
    public void testViewUserProfiles_Success() 
    {
        List<UserDTO> users = Collections.singletonList(userDTO);                       //Creates a single-item list
        when(userService.ViewUserProfiles()).thenReturn(users);                         //Mocks return
        ResponseEntity<List<UserDTO>> response = userController.ViewUserProfiles();     //Calls controller
        assertEquals(HttpStatus.OK, response.getStatusCode());                          //Asserts 200 OK
        assertEquals(users, response.getBody());                                        //Asserts body match
        verify(userService, times(1)).ViewUserProfiles();   //Verifies call
    }

    //Test for successful update of user profile
    @Test
    public void testUpdateUserProfile_Success() 
    {
        //Builds expected response DTO
        AuthResponseDTO authResponseDTO = AuthResponseDTO.builder().userId(userDTO.getUserId()).firstName(userDTO.getFirstName()).lastName(userDTO.getLastName())
        .phone(userDTO.getPhone()).address(userDTO.getAddress()).email(userDTO.getEmail()).username(userDTO.getUsername()).role(userDTO.getRole())
        .token("mock-token").message("Bearer").build();

        when(userService.UpdateUserProfile(eq(1L), any(UserDTO.class))).thenReturn(authResponseDTO);    //Mocks service
        ResponseEntity<AuthResponseDTO> response = userController.UpdateUserProfile(1L, userDTO);           //Calls controller
        assertEquals(HttpStatus.OK, response.getStatusCode());      //Asserts 200 OK
        assertEquals(authResponseDTO, response.getBody());          //Asserts body match
        verify(userService, times(1)).UpdateUserProfile(eq(1L), any(UserDTO.class));    //Verifies call
    }

    //Test when updating user profile with invalid ID throws exception
    @Test
    public void testUpdateUserProfile_UserNotFound() 
    {
        Long userId = 1L;   //Sets user ID
        when(userService.UpdateUserProfile(eq(userId), any(UserDTO.class))).thenThrow(new UserNotFoundException(userId.toString()));    //Mocks exception

        //Asserts exception thrown
        UserNotFoundException exception = assertThrows(UserNotFoundException.class, () -> userController.UpdateUserProfile(userId, userDTO)); 
        assertEquals("User ID " + userId + " not found", exception.getMessage());                                           //Validates message
        verify(userService, times(1)).UpdateUserProfile(eq(userId), any(UserDTO.class));    //Verifies call
    }

    //Test for successful deletion of user profile
    @Test
    public void testDeleteUserProfile_Success() 
    {
        doNothing().when(userService).DeleteUserProfile(1L);                            //Mocks void method
        ResponseEntity<Void> response = userController.DeleteUserProfile(1L);           //Calls controller
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());                          //Asserts 204 No Content
        assertNull(response.getBody());                                                         //Asserts no response body
        verify(userService, times(1)).DeleteUserProfile(1L);    //Verifies call
    }

    //Test when deleting a user that does not exist
    @Test
    public void testDeleteUserProfile_UserNotFound() 
    {
        Long userId = 1L;  //Sets test ID
        doThrow(new UserNotFoundException(userId.toString())).when(userService).DeleteUserProfile(userId);  //Mocks exception
        UserNotFoundException exception = assertThrows(UserNotFoundException.class, () -> userController.DeleteUserProfile(userId));    //Asserts exception
        assertEquals("User ID " + userId + " not found", exception.getMessage());                           //Validates message
        verify(userService, times(1)).DeleteUserProfile(userId);                    //Verifies method call
    }

    //Test when deletion throws a runtime error
    @Test
    public void testDeleteUserProfile_DeletionError() 
    {
        Long userId = 1L;   //Sets user ID
        doThrow(new RuntimeException("Deletion failed")).when(userService).DeleteUserProfile(userId);   //Mocks exception
        RuntimeException exception = assertThrows(RuntimeException.class, () -> userController.DeleteUserProfile(userId));  //Asserts exception
        assertEquals("Deletion failed", exception.getMessage());                                        //Validates message
        verify(userService, times(1)).DeleteUserProfile(userId);                        //Verifies method call
    }
}