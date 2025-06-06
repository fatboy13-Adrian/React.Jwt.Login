package com.React.Jwt.Login.Service;                                    //Declare package
import org.mockito.junit.jupiter.MockitoExtension;                      //Mockito extension for JUnit 5
import com.React.Jwt.Login.DTO.UserDTO;                                 //UserDTO import
import com.React.Jwt.Login.Entity.User;                                 //User entity import
import com.React.Jwt.Login.Enum.Role;                                   //Role enum import
import com.React.Jwt.Login.Exception.EmailAlreadyExistsException;       //Email exists exception
import com.React.Jwt.Login.Exception.UserNotFoundException;             //User not found exception
import com.React.Jwt.Login.Exception.UsernameAlreadyExistsException;    //Username exists exception
import com.React.Jwt.Login.Mapper.UserMapper;                           //UserMapper import
import com.React.Jwt.Login.Repository.UserRepository;                   //UserRepository import
import com.React.Jwt.Login.Security.JWT.JwtUtil;                        //JWT utility import
import org.junit.jupiter.api.BeforeEach;                                //Setup before each test
import org.junit.jupiter.api.Test;                                      //Test annotation
import org.junit.jupiter.api.extension.ExtendWith;                      //JUnit extension
import org.mockito.InjectMocks;                                         //Inject mocks into tested class
import org.mockito.Mock;                                                //Create mocks
import org.springframework.security.access.AccessDeniedException;       //Access denied exception
import org.springframework.security.crypto.password.PasswordEncoder;    //Password encoder
import java.util.List;                                                  //List import
import java.util.Optional;                                              //Optional import
import static org.junit.jupiter.api.Assertions.*;                       //JUnit assertions
import static org.mockito.ArgumentMatchers.*;                           //Mockito argument matchers
import static org.mockito.Mockito.*;                                    //Mockito static methods

@ExtendWith(MockitoExtension.class) //Enable Mockito in this test class
class UserServiceTest 
{
    @Mock 
    private UserRepository userRepository;                      //Mock UserRepository dependency

    @Mock 
    private UserMapper userMapper;                              //Mock UserMapper dependency

    @Mock 
    private PasswordEncoder passwordEncoder;                    //Mock PasswordEncoder dependency

    @Mock 
    private JwtUtil jwtUtil;                                    //Mock JwtUtil dependency

    @Mock 
    private UserAuthService userAuthService;                    //Mock UserAuthService dependency

    @Mock 
    private UserAuthorizationService userAuthorizationService;  //Mock UserAuthorizationService dependency

    @InjectMocks 
    private UserService userService;                            //Inject mocks into UserService instance

    private UserDTO userDTO;                                    //Declare UserDTO test data
    private User userEntity;                                    //Declare User entity test data

    @BeforeEach //Setup test data before each test
    void setUp() 
    {
        userDTO = new UserDTO();                        //Create new UserDTO
        userDTO.setUserId(1L);                  //Set userId to 1
        userDTO.setUsername("user");        //Set username
        userDTO.setEmail("user@example.com");   //Set email
        userDTO.setPassword("password");    //Set password
        userDTO.setRole(Role.USER);                     //Set role enum USER

        userEntity = new User();                                //Create new User entity
        userEntity.setUserId(1L);                       //Set userId to 1
        userEntity.setUsername("user");                 //Set username
        userEntity.setEmail("user@example.com");            //Set email
        userEntity.setPassword("encoded-password");     //Set encoded password
        userEntity.setRole(Role.USER);                          //Set role enum USER
    }

    @Test   //Test registering new user success
    void registerNewUser_Success() 
    {
        when(userRepository.existsByUsername(userDTO.getUsername())).thenReturn(false);         //Mock username not exists
        when(userRepository.existsByEmail(userDTO.getEmail())).thenReturn(false);               //Mock email not exists
        when(passwordEncoder.encode("password")).thenReturn("encoded-password");    //Mock password encoding
        when(userMapper.toEntity(any(UserDTO.class))).thenReturn(userEntity);                   //Mock DTO to entity mapping
        when(userRepository.save(userEntity)).thenReturn(userEntity);                               //Mock saving entity
        when(userMapper.toDTO(userEntity)).thenReturn(userDTO);                                     //Mock entity to DTO mapping
        UserDTO result = userService.registerNewUser(userDTO);                                      //Call register method
        assertEquals(userDTO, result);                                                              //Assert returned DTO equals input
        verify(userRepository).existsByUsername(userDTO.getUsername());                             //Verify username existence checked
        verify(userRepository).existsByEmail(userDTO.getEmail());                                   //Verify email existence checked
        verify(passwordEncoder).encode("password");                                     //Verify password encoded
        verify(userRepository).save(userEntity);                                                    //Verify user saved
    }

    @Test   //Test register throws exception if username exists
    void registerNewUser_UsernameExists_Throws() 
    {
        when(userRepository.existsByUsername(userDTO.getUsername())).thenReturn(true);                          //Mock username exists
        assertThrows(UsernameAlreadyExistsException.class, () -> userService.registerNewUser(userDTO)); //Expect exception
        verify(userRepository, never()).save(any()); //Verify save never called
    }

    @Test   //Test register throws exception if email exists
    void registerNewUser_EmailExists_Throws() 
    {
        when(userRepository.existsByUsername(userDTO.getUsername())).thenReturn(false);                     //Username not exists
        when(userRepository.existsByEmail(userDTO.getEmail())).thenReturn(true);                            //Email exists
        assertThrows(EmailAlreadyExistsException.class, () -> userService.registerNewUser(userDTO));    //Expect exception
        verify(userRepository, never()).save(any());                                                                //Verify save never called
    }

    @Test   //Test viewing user profile success
    void viewUserProfile_Success() 
    {
        doNothing().when(userAuthorizationService).authorizeUserOrAdmin(1L);    //Mock authorization allowed
        when(userRepository.findById(1L)).thenReturn(Optional.of(userEntity));      //Mock user found
        when(userMapper.toDTO(userEntity)).thenReturn(userDTO);                         //Mock entity to DTO
        UserDTO result = userService.viewUserProfile(1L);                       //Call view profile
        assertEquals(userDTO, result);                                                  //Assert correct DTO returned
        verify(userAuthorizationService).authorizeUserOrAdmin(1L);              //Verify authorization checked
    }

    @Test   //Test view profile throws if user not found
    void viewUserProfile_UserNotFound_Throws() 
    {
        doNothing().when(userAuthorizationService).authorizeUserOrAdmin(1L);                            //Mock authorization allowed
        when(userRepository.findById(1L)).thenReturn(Optional.empty());                                     //Mock user not found
        assertThrows(UserNotFoundException.class, () -> userService.viewUserProfile(1L));   //Expect exception
    }

    @Test   //Test admin views all user profiles
    void viewUserProfiles_AdminAuthorized_ReturnsList() 
    {
        doNothing().when(userAuthorizationService).authorizeAdmin();    //Mock admin authorization
        List<User> users = List.of(userEntity);                         //Create list with one user
        when(userRepository.findAll()).thenReturn(users);               //Mock find all users
        when(userMapper.toDTO(userEntity)).thenReturn(userDTO);         //Mock mapping to DTO
        List<UserDTO> result = userService.viewUserProfiles();          //Call method
        assertEquals(1, result.size());                         //Assert one user returned
        assertEquals(userDTO, result.get(0));                       //Assert correct DTO
        verify(userAuthorizationService).authorizeAdmin();              //Verify admin auth checked
    }

    @Test   //Test update profile unauthorized throws exception
    void updateUserProfile_Unauthorized_Throws() 
    {
        Long userIdToUpdate = 1L;                                                           //User id to update
        User currentUser = new User();                                                      //Create current user
        currentUser.setUserId(2L);                                                  //Different user id (not self)
        when(userAuthService.getAuthenticatedUser()).thenReturn(currentUser);               //Mock current user returned
        User userEntity = new User();                                                       //User to update entity
        userEntity.setUserId(userIdToUpdate);                                               //Set userId
        userEntity.setRole(Role.USER);                                                      //Set role
        when(userRepository.findById(userIdToUpdate)).thenReturn(Optional.of(userEntity));  //Mock found user
        when(userAuthService.hasRole("ROLE_ADMIN")).thenReturn(false);          //Mock current user is not admin
        UserDTO userDTO = new UserDTO();                                                        //Empty update DTO

        assertThrows(AccessDeniedException.class, () -> 
        {
            userService.updateUserProfile(userIdToUpdate, userDTO);                         //Expect access denied
        });

        verify(userAuthService).getAuthenticatedUser();                                     //Verify current user fetched
        verify(userRepository).findById(userIdToUpdate);                                    //Verify user found
        verify(userAuthService).hasRole("ROLE_ADMIN");                              //Verify role checked
    }

    @Test   //Test user updates own profile with allowed fields
    void updateUserProfile_BySelf_UpdatesFields() 
    {
        User currentUser = new User();                                                                      //Current user
        currentUser.setUserId(1L);                                                                  //Set id
        currentUser.setUsername("user");                                                            //Username
        currentUser.setRole(Role.USER);                                                                     //Role USER
        when(userAuthService.getAuthenticatedUser()).thenReturn(currentUser);                               //Mock current user
        when(userRepository.findById(1L)).thenReturn(Optional.of(userEntity));                          //Mock user found
        when(userAuthService.hasRole("ROLE_ADMIN")).thenReturn(false);                      //Not admin
        UserDTO updateDTO = new UserDTO();                                                                  //Update DTO
        updateDTO.setFirstName("NewFirst");                                                     //New first name
        updateDTO.setLastName("NewLast");                                                       //New last name
        updateDTO.setPassword("newpassword");                                                   //New password
        updateDTO.setRole(Role.ADMIN);                                                                  //Attempt role escalation ignored
        when(passwordEncoder.encode("newpassword")).thenReturn("encodedNewPassword");   //Mock encode
        when(userRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));       //Mock save returns input
        when(userMapper.toDTO(any())).thenReturn(userDTO);                                                  //Mock mapping to DTO
        when(jwtUtil.generateToken(anyString(), anyList())).thenReturn("new-token");                //Mock token generation
        var response = userService.updateUserProfile(1L, updateDTO);                                //Call update
        assertEquals("User updated successfully", response.getMessage());                       //Check success message
        verify(userRepository).save(userEntity);                                                            //Verify saved
        assertEquals("encodedNewPassword", userEntity.getPassword());                           //Password updated
        assertEquals(Role.USER, userEntity.getRole());                                                  //Role unchanged
    }

    @Test   //Test admin updates profile including role change
    void updateUserProfile_ByAdmin_UpdatesFieldsIncludingRole() 
    {
        User currentUser = new User();                                                                  //Admin user
        currentUser.setUserId(2L);                                                              //Set id
        currentUser.setRole(Role.ADMIN);                                                                //Admin role
        when(userAuthService.getAuthenticatedUser()).thenReturn(currentUser);                           //Mock admin user
        when(userRepository.findById(1L)).thenReturn(Optional.of(userEntity));                      //Mock user found
        when(userAuthService.hasRole("ROLE_ADMIN")).thenReturn(true);                   //Mock admin role check
        UserDTO updateDTO = new UserDTO();                                                              //Update DTO
        updateDTO.setRole(Role.ADMIN);                                                                  //Change role to admin
        updateDTO.setFirstName("AdminFirst");                                               //Change first name
        when(userRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));   //Mock save
        when(userMapper.toDTO(any())).thenReturn(userDTO);                                              //Mock mapping
        when(jwtUtil.generateToken(anyString(), anyList())).thenReturn("admin-token");          //Mock token
        var response = userService.updateUserProfile(1L, updateDTO);                            //Call update
        assertEquals("User updated successfully", response.getMessage());                       //Check success message
        assertEquals(Role.ADMIN, userEntity.getRole());                                                 //Role updated
        verify(userRepository).save(userEntity);                                                        //Verify saved
    }

    @Test   //Test deleting user profile success
    void deleteUserProfile_Success() 
    {
        doNothing().when(userAuthorizationService).authorizeAdmin();        //Mock admin authorization
        when(userRepository.existsById(1L)).thenReturn(true);       //Mock user exists
        doNothing().when(userRepository).deleteById(1L);                    //Mock delete no-op
        assertDoesNotThrow(() -> userService.deleteUserProfile(1L));    //Assert no exception
        verify(userRepository).deleteById(1L);                              //Verify deletion called
    }

    @Test   //Test delete throws if user not found
    void deleteUserProfile_UserNotFound_Throws() 
    {
        doNothing().when(userAuthorizationService).authorizeAdmin();                                            //Mock admin authorization
        when(userRepository.existsById(1L)).thenReturn(false);                                          //User does not exist
        assertThrows(UserNotFoundException.class, () -> userService.deleteUserProfile(1L)); //Expect exception
        verify(userRepository, never()).deleteById(anyLong());                                                  //Verify no deletion called
    }
}