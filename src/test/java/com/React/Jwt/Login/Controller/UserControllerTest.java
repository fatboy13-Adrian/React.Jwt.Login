package com.React.Jwt.Login.Controller;                 //Declare the package for the controller tests
import com.React.Jwt.Login.DTO.Auth.AuthResponseDTO;    //Import DTO for authentication response
import com.React.Jwt.Login.DTO.UserDTO;                 //Import DTO for user information
import com.React.Jwt.Login.Service.UserService;         //Import the user service to be mocked
import org.junit.jupiter.api.BeforeEach;                //Runs before each test method
import org.junit.jupiter.api.Test;                      //Marks a method as a test case
import org.junit.jupiter.api.extension.ExtendWith;      //Integrates extensions (Mockito here)
import org.mockito.InjectMocks;                         //Injects mocks into the object being tested
import org.mockito.Mock;                                //Marks a field to be mocked
import org.mockito.junit.jupiter.MockitoExtension;      //Enables Mockito with JUnit 5
import org.springframework.http.ResponseEntity;         //Spring framework class for HTTP responses
import java.util.List;                                  //Java utility class for lists
import static org.junit.jupiter.api.Assertions.*;       //Provides assertion methods
import static org.mockito.Mockito.*;                    //Provides mocking utilities

@ExtendWith(MockitoExtension.class) //Extend the test class with Mockito support
class UserControllerTest 
{
    @Mock 
    private UserService userService;        //Mock the UserService dependency

    @InjectMocks 
    private UserController userController;  //Inject the mocked UserService into the controller

    //Test data objects
    private UserDTO userDTO;
    private AuthResponseDTO authResponseDTO;

    @BeforeEach //Runs before each test to set up data
    void setUp() 
    {
        userDTO = new UserDTO();                                //Create a new UserDTO
        userDTO.setUserId(1L);                          //Set user ID
        userDTO.setUsername("testUser");                //Set username
        authResponseDTO = new AuthResponseDTO();                //Create a new AuthResponseDTO
        authResponseDTO.setMessage("Profile updated");  //Set message
    }

    @Test   //Test registration success scenario
    void RegisterNewUser_ShouldRegisterAndReturnUserDTO() 
    {
        when(userService.registerNewUser(userDTO)).thenReturn(userDTO);             //Mock behavior
        ResponseEntity<UserDTO> response = userController.RegisterNewUser(userDTO); //Call controller
        assertNotNull(response);                                                    //Ensure response is not null
        assertEquals(200, response.getStatusCode().value());                //Check status code
        assertEquals(userDTO, response.getBody());                                  //Verify response body
        verify(userService).registerNewUser(userDTO);                               //Verify service call
    }

    @Test   //Test view profile by ID
    void ViewUserProfile_ShouldReturnUserDTO() 
    {
        Long userId = 1L;                                                           //Test ID
        when(userService.viewUserProfile(userId)).thenReturn(userDTO);              //Mock return
        ResponseEntity<UserDTO> response = userController.ViewUserProfile(userId);  //Call controller
        assertNotNull(response);                                                    //Assert non-null
        assertEquals(200, response.getStatusCode().value());                //Assert status
        assertEquals(userDTO, response.getBody());                                  //Assert body
        verify(userService).viewUserProfile(userId);                                //Verify call
    }

    @Test   //Test view all users
    void ViewUserProfiles_ShouldReturnListOfUsers() 
    {
        List<UserDTO> userList = List.of(userDTO);                                  //Mock list
        when(userService.viewUserProfiles()).thenReturn(userList);                  //Stub method
        ResponseEntity<List<UserDTO>> response = userController.ViewUserProfiles(); //Call controller
        assertNotNull(response);                                                    //Assert not null
        assertEquals(200, response.getStatusCode().value());                //Assert HTTP OK
        assertEquals(userList, response.getBody());                                 //Assert body match
        verify(userService).viewUserProfiles();                                     //Verify service
    }

    @Test   //Test update user profile
    void updateUserProfile_ShouldUpdateAndReturnAuthResponse() 
    {
        Long userId = 1L;                                                                               //Test user ID
        when(userService.updateUserProfile(userId, userDTO)).thenReturn(authResponseDTO);               //Stub
        ResponseEntity<AuthResponseDTO> response = userController.updateUserProfile(userId, userDTO);   //Call
        assertNotNull(response);                                                                        //Assert not null
        assertEquals(200, response.getStatusCode().value());                                    //Status check
        assertEquals(authResponseDTO, response.getBody());                                              //Response check
        verify(userService).updateUserProfile(userId, userDTO);                                         //Verify call
    }

    @Test   //Test delete user
    void deleteUserProfile_ShouldReturnNoContent() 
    {
        Long userId = 1L;                                                           //ID to delete
        doNothing().when(userService).deleteUserProfile(userId);                    //Mock void call
        ResponseEntity<Void> response = userController.deleteUserProfile(userId);   //Call
        assertNotNull(response);                                                    //Assert not null
        assertEquals(204, response.getStatusCode().value());                //Expect No Content
        verify(userService).deleteUserProfile(userId);                              //Verify call
    }

    @Test   //Test null input to registration
    void RegisterNewUser_NullInput_ShouldThrowException() 
    {
        when(userService.registerNewUser(null)).thenThrow(new NullPointerException("UserDTO is null")); //Mock error
        NullPointerException ex = assertThrows(NullPointerException.class, () -> userController.RegisterNewUser(null)); //Expect exception
        assertEquals("UserDTO is null", ex.getMessage());   //Check message
        verify(userService).registerNewUser(null);          //Verify call
    }

    @Test   //Test profile not found
    void ViewUserProfile_UserNotFound_ShouldThrowException() 
    {
        Long userId = 99L;  //Invalid ID
        when(userService.viewUserProfile(userId)).thenThrow(new RuntimeException("User not found"));    //Mock
        RuntimeException exception = assertThrows(RuntimeException.class, () -> userController.ViewUserProfile(userId));    //Expect
        assertEquals("User not found", exception.getMessage()); //Message match
        verify(userService).viewUserProfile(userId);                    //Verify call
    }

    @Test   //Test empty user list
    void ViewUserProfiles_EmptyList_ShouldReturnEmptyList() 
    {
        when(userService.viewUserProfiles()).thenReturn(List.of());                 //Empty list
        ResponseEntity<List<UserDTO>> response = userController.ViewUserProfiles(); //Call
        assertNotNull(response);                                                    //Not null
        assertEquals(200, response.getStatusCode().value());                //Status OK
        assertTrue(response.getBody().isEmpty());                                   //List empty
        verify(userService).viewUserProfiles();                                     //Verify
    }

    @Test   //Test update fails (user not found)
    void updateUserProfile_UserNotFound_ShouldThrowException() 
    {
        Long userId = 99L;  //Invalid
        when(userService.updateUserProfile(userId, userDTO)).thenThrow(new RuntimeException("User not found")); //Mock
        RuntimeException exception = assertThrows(RuntimeException.class, () -> userController.updateUserProfile(userId, userDTO)); //Expect
        assertEquals("User not found", exception.getMessage()); //Message
        verify(userService).updateUserProfile(userId, userDTO);         //Verify
    }

    @Test   //Test delete fails (user not found)
    void deleteUserProfile_UserNotFound_ShouldThrowException() 
    {
        Long userId = 99L;  //Invalid ID
        doThrow(new RuntimeException("User not found")).when(userService).deleteUserProfile(userId);    //Mock
        RuntimeException exception = assertThrows(RuntimeException.class, () -> userController.deleteUserProfile(userId));  //Expect
        assertEquals("User not found", exception.getMessage()); //Message check
        verify(userService).deleteUserProfile(userId);                  //Verify
    }
}