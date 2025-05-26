package com.React.Jwt.Login.Controller;
import com.React.Jwt.Login.DTO.UserDTO;
import com.React.Jwt.Login.DTO.Auth.AuthResponseDTO;
import com.React.Jwt.Login.Enum.Role;
import com.React.Jwt.Login.Exception.*;
import com.React.Jwt.Login.Service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private UserDTO userDTO;

    @BeforeEach
    public void setUp() {
        userDTO = UserDTO.builder()
                .userId(1L)
                .firstName("test")
                .lastName("test1")
                .address("123 Street")
                .phone("+6512345678")
                .username("testUser")
                .email("test@example.com")
                .password("password123")
                .role(Role.CUSTOMER)
                .build();
    }

    @Test
    public void testRegisterNewUser_Success() {
        when(userService.RegisterNewUser(any(UserDTO.class))).thenReturn(userDTO);

        ResponseEntity<UserDTO> response = userController.RegisterNewUser(userDTO);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(userDTO, response.getBody());
        verify(userService, times(1)).RegisterNewUser(any(UserDTO.class));
    }

    @Test
    public void testRegisterNewUser_EmailAlreadyExists() {
        String email = userDTO.getEmail();
        when(userService.RegisterNewUser(any(UserDTO.class))).thenThrow(new EmailAlreadyExistsException(email));

        EmailAlreadyExistsException ex = assertThrows(EmailAlreadyExistsException.class,
                () -> userController.RegisterNewUser(userDTO));
        assertEquals(email + " already exists in database", ex.getMessage());
        verify(userService, times(1)).RegisterNewUser(any(UserDTO.class));
    }

    @Test
    public void testGetCurrentUser_Success() {
        when(userService.getCurrentUser()).thenReturn(userDTO);

        ResponseEntity<UserDTO> response = userController.getCurrentUser();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(userDTO, response.getBody());
        verify(userService, times(1)).getCurrentUser();
    }

    @Test
    public void testGetCurrentUser_Failure() {
        when(userService.getCurrentUser()).thenThrow(new RuntimeException("Service Error"));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> userController.getCurrentUser());
        assertEquals("Service Error", exception.getMessage());
        verify(userService, times(1)).getCurrentUser();
    }

    @Test
    public void testViewUserProfile_Success() {
        when(userService.ViewUserProfile(anyLong())).thenReturn(userDTO);

        ResponseEntity<UserDTO> response = userController.ViewUserProfile(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(userDTO, response.getBody());
        verify(userService, times(1)).ViewUserProfile(1L);
    }

    @Test
    public void testViewUserProfile_UserNotFound() {
        Long userId = 1L;
        when(userService.ViewUserProfile(anyLong())).thenThrow(new UserNotFoundException(userId.toString()));

        UserNotFoundException exception = assertThrows(UserNotFoundException.class, () -> userController.ViewUserProfile(userId));
        assertEquals("User ID " + userId + " not found", exception.getMessage());
        verify(userService, times(1)).ViewUserProfile(userId);
    }

    @Test
    public void testViewUserProfiles_Success() {
        List<UserDTO> users = Collections.singletonList(userDTO);
        when(userService.ViewUserProfiles()).thenReturn(users);

        ResponseEntity<List<UserDTO>> response = userController.ViewUserProfiles();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().contains(userDTO));
        verify(userService, times(1)).ViewUserProfiles();
    }

    @Test
    public void testUpdateUserProfile_Success() {
        AuthResponseDTO authResponseDTO = AuthResponseDTO.builder().userId(userDTO.getUserId()).firstName(userDTO.getFirstName()).lastName(userDTO.getLastName())
        .address(userDTO.getAddress()).phone(userDTO.getPhone()).username(userDTO.getUsername()).email(userDTO.getEmail()).token("dummyToken123")
        .message("User updated successfully").role(userDTO.getRole()).build();

        when(userService.UpdateUserProfile(anyLong(), any(UserDTO.class))).thenReturn(authResponseDTO);

        ResponseEntity<AuthResponseDTO> response = userController.UpdateUserProfile(1L, userDTO);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(authResponseDTO, response.getBody());
        verify(userService, times(1)).UpdateUserProfile(anyLong(), any(UserDTO.class));
    }

    @Test
    public void testUpdateUserProfile_UserNotFound() {
        Long userId = 1L;
        when(userService.UpdateUserProfile(anyLong(), any(UserDTO.class))).thenThrow(new UserNotFoundException(userId.toString()));

        UserNotFoundException exception = assertThrows(UserNotFoundException.class,
                () -> userController.UpdateUserProfile(userId, userDTO));
        assertEquals("User ID " + userId + " not found", exception.getMessage());
        verify(userService, times(1)).UpdateUserProfile(anyLong(), any(UserDTO.class));
    }

    @Test
    public void testDeleteUserProfile_Success() {
        doNothing().when(userService).DeleteUserProfile(anyLong());

        ResponseEntity<Void> response = userController.DeleteUserProfile(1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(userService, times(1)).DeleteUserProfile(1L);
    }

    @Test
    public void testDeleteUserProfile_UserNotFound() {
        Long userId = 1L;
        doThrow(new UserNotFoundException(userId.toString())).when(userService).DeleteUserProfile(anyLong());

        UserNotFoundException exception = assertThrows(UserNotFoundException.class,
                () -> userController.DeleteUserProfile(userId));
        assertEquals("User ID " + userId + " not found", exception.getMessage());
        verify(userService, times(1)).DeleteUserProfile(userId);
    }
}
