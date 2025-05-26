package com.React.Jwt.Login.Service;                                                    //Package for service-level tests
import com.React.Jwt.Login.DTO.Auth.AuthResponseDTO;                                    //Import DTO for authentication response
import com.React.Jwt.Login.DTO.UserDTO;                                                 //Import DTO for user data transfer
import com.React.Jwt.Login.Entity.User;                                                 //Import User entity class
import com.React.Jwt.Login.Enum.Role;                                                   //Import enum for user roles
import com.React.Jwt.Login.Exception.EmailAlreadyExistsException;                       //Import custom exception for duplicate emails
import com.React.Jwt.Login.Exception.UserNotFoundException;                             //Import custom exception for missing users
import com.React.Jwt.Login.Exception.UsernameAlreadyExistsException;                    //Import custom exception for duplicate usernames
import com.React.Jwt.Login.Mapper.UserMapper;                                           //Import mapper to convert between User and UserDTO
import com.React.Jwt.Login.Repository.UserRepository;                                   //Import repository interface for User entity
import com.React.Jwt.Login.Security.JWT.JwtUtil;                                        //Import JWT utility for token generation
import org.junit.jupiter.api.Test;                                                      //Import JUnit test annotation
import org.junit.jupiter.api.extension.ExtendWith;                                      //Import JUnit extension to support Mockito
import org.mockito.InjectMocks;                                                         //Import annotation to inject mocks into tested object
import org.mockito.Mock;                                                                //Import annotation to create mock objects
import org.mockito.junit.jupiter.MockitoExtension;                                      //Import extension to enable Mockito in JUnit
import org.springframework.security.access.AccessDeniedException;                       //Import exception for unauthorized access
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken; //Import Spring Security class for authentication tokens
import org.springframework.security.core.Authentication;                                //Import interface for authentication object
import org.springframework.security.core.authority.SimpleGrantedAuthority;              //Import class for user roles/authorities
import org.springframework.security.core.context.SecurityContext;                       //Import Spring Security context class
import org.springframework.security.core.context.SecurityContextHolder;                 //Import Spring Security holder for context
import org.springframework.security.crypto.password.PasswordEncoder;                    //Import password encoder interface
import java.util.List;                                                                  //Import List interface
import java.util.Optional;                                                              //Import Optional for null-safe values
import static org.junit.jupiter.api.Assertions.*;                                       //Import static assert methods
import static org.mockito.ArgumentMatchers.*;                                           //Import static matcher methods for Mockito
import static org.mockito.Mockito.*;                                                    //Import static Mockito utility methods

@ExtendWith(MockitoExtension.class) //Extend test class with Mockito support
class UserServiceTest 
{
    @Mock private JwtUtil JwtUtil;                  //Mock for JWT utility
    @Mock private UserRepository userRepository;    //Mock for User repository
    @Mock private UserMapper userMapper;            //Mock for User-DTO mapper
    @Mock private PasswordEncoder passwordEncoder;  //Mock for password encoder
    @InjectMocks private UserService userService;   //Inject mocks into the service under test

    //Utility method to mock authentication with roles
    private void mockAuthentication(String username, String... roles) 
    {
        //Create authorities from roles
        List<SimpleGrantedAuthority> authorities = List.of(roles).stream().map(SimpleGrantedAuthority::new).toList();

        //Create authentication token
        Authentication authentication = new UsernamePasswordAuthenticationToken(username, null, authorities);
        
        //Mock the security context
        SecurityContext securityContext = mock(SecurityContext.class);
        
        //Define authentication for security context
        when(securityContext.getAuthentication()).thenReturn(authentication);
        
        //Set mocked context to current thread
        SecurityContextHolder.setContext(securityContext);
    }

    @Test   //Test if UsernameAlreadyExistsException is thrown
    void RegisterNewUser_shouldThrowException_ifUsernameExists() 
    {
        UserDTO dto = new UserDTO();                                                                            //Create DTO
        dto.setUsername("existingUser");                                                                //Set username
        dto.setEmail("newemail@example.com");                                                               //Set email
        when(userRepository.existsByUsername(dto.getUsername())).thenReturn(true);                          //Mock existing username
        assertThrows(UsernameAlreadyExistsException.class, () -> userService.RegisterNewUser(dto)); //Expect exception
        verify(userRepository, never()).save(any());                                                            //Ensure save is not called
    }

    @Test   //Test if EmailAlreadyExistsException is thrown
    void RegisterNewUser_shouldThrowException_ifEmailExists() 
    {
        UserDTO dto = new UserDTO();                                                                            //Create DTO
        dto.setUsername("newUser");                                                                     //Set username
        dto.setEmail("existingemail@example.com");                                                          //Set email
        when(userRepository.existsByUsername(dto.getUsername())).thenReturn(false);                         //Username doesn't exist
        when(userRepository.existsByEmail(dto.getEmail())).thenReturn(true);                                //Email exists
        assertThrows(EmailAlreadyExistsException.class, () -> userService.RegisterNewUser(dto));    //Expect exception
        verify(userRepository, never()).save(any());                                                            //Ensure save is not called
    }

    @Test   //Test successful user creation
    void RegisterNewUser_shouldEncodePasswordAndSaveUser() 
    {
        UserDTO dto = new UserDTO();                //Create DTO
        dto.setUsername("newUser");         //Set username
        dto.setEmail("newuser@example.com");    //Set email
        dto.setPassword("plainPassword");   //Set password
        User userEntity = new User();               //Mock user entity
        User savedUser = new User();                //Mock saved user
        savedUser.setUserId(1L);            //Set saved user ID
        UserDTO savedDto = new UserDTO();           //Create returned DTO
        savedDto.setUserId(1L);             //Set DTO user ID

        //Mock repository and mapper interactions
        when(userRepository.existsByUsername(dto.getUsername())).thenReturn(false);
        when(userRepository.existsByEmail(dto.getEmail())).thenReturn(false);
        when(passwordEncoder.encode("plainPassword")).thenReturn("encodedPassword");
        when(userMapper.toEntity(any())).thenReturn(userEntity);
        when(userRepository.save(userEntity)).thenReturn(savedUser);
        when(userMapper.toDTO(savedUser)).thenReturn(savedDto);

        UserDTO result = userService.RegisterNewUser(dto);              //Call createUser
        assertEquals(1L, result.getUserId());                   //Assert user ID
        verify(passwordEncoder).encode("plainPassword");    //Verify password encoding
        verify(userRepository).save(userEntity);                        //Verify user saved
    }

    @Test   //Test user retrieval when owner is authorized
    void ViewUserProfile_shouldReturnUserDTO_ifAuthorizedAsOwner() 
    {
        Long userId = 1L;                                                               //User ID
        String username = "user1";                                                      //Username
        User user = new User();                                                         //Create user entity
        user.setUserId(userId);                                                         //Set ID
        user.setUsername(username);                                                     //Set username
        UserDTO userDTO = new UserDTO();                                                //Create DTO
        userDTO.setUserId(userId);                                                      //Set ID
        userDTO.setUsername(username);                                                  //Set username
        mockAuthentication(username, "ROLE_CUSTOMER");                          //Authenticate as owner
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));            //Mock findById
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));    //Mock findByUsername
        when(userMapper.toDTO(user)).thenReturn(userDTO);                               //Map to DTO
        UserDTO result = userService.ViewUserProfile(userId);                           //Call getUser
        assertEquals(userId, result.getUserId());                                       //Assert ID
        assertEquals(username, result.getUsername());                                   //Assert username
    }

    @Test   //Test access denied when user is not owner or admin   
    void gViewUserProfile_shouldThrowAccessDeniedException_ifNotOwnerOrAdmin() 
    {
        Long userId = 1L;                                                                                   //Target user ID
        mockAuthentication("otherUser", "ROLE_CUSTOMER");                                   //Mock unauthorized user
        User user = new User();                                                                             //Target user
        user.setUserId(userId);                                                                             //Set ID
        user.setUsername("user1");                                                                  //Set username
        User otherUser = new User();                                                                        //Logged-in user
        otherUser.setUsername("otherUser");                                                         //Set username
        when(userRepository.findByUsername("otherUser")).thenReturn(Optional.of(otherUser));        //Mock find
        assertThrows(AccessDeniedException.class, () -> userService.ViewUserProfile(userId));   //Expect denial
    }

    @Test   //Test fetching users as admin
    void ViewUserProfiles_shouldReturnAllUsers_ifAdmin() 
    {
        mockAuthentication("admin", "ROLE_ADMIN");      //Authenticate as admin
        User user1 = new User();                                            //User 1
        User user2 = new User();                                            //User 2
        UserDTO dto1 = new UserDTO();                                       //DTO 1
        UserDTO dto2 = new UserDTO();                                       //DTO 2
        when(userRepository.findAll()).thenReturn(List.of(user1, user2));   //Mock findAll
        when(userMapper.toDTO(user1)).thenReturn(dto1);                     //Map user1
        when(userMapper.toDTO(user2)).thenReturn(dto2);                     //Map user2
        List<UserDTO> result = userService.ViewUserProfiles();              //Call getUsers
        assertEquals(2, result.size());                             //Assert list size
        verify(userRepository).findAll();                                   //Verify repository call
    }

    @Test   //Test access denied when non-admin calls getUsers
    void ViewUserProfiles_shouldThrowAccessDeniedException_ifNotAdmin() 
    {
        mockAuthentication("someUser", "ROLE_CUSTOMER");                                //Mock unauthorized user
        assertThrows(AccessDeniedException.class, () -> userService.ViewUserProfiles());    //Expect denial
    }

    @Test   //Test authorized user updating their own data
    void UpdateUserProfile_shouldUpdateUserAndReturnAuthResponse_ifAuthorized() 
    {
        Long userId = 1L;                                           //User ID
        String username = "user1";                                  //Username
        mockAuthentication(username, "ROLE_CUSTOMER");      //Authenticate
        UserDTO updateDto = new UserDTO();                          //Create update DTO
        updateDto.setFirstName("John");                 //Update name
        updateDto.setPassword("newPassword");           //Update password
        User user = new User();                                 //Existing user
        user.setUserId(userId);                                 //Set ID
        user.setUsername(username);                             //Set username
        user.setRole(Role.CUSTOMER);                            //Set role

        //Mock repository and utility calls
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userMapper.toDTO(any(User.class))).thenReturn(updateDto);
        when(JwtUtil.generateToken(eq(username), anyList())).thenReturn("jwtToken");

        AuthResponseDTO response = userService.UpdateUserProfile(userId, updateDto);    //Call update
        assertNotNull(response);                                                        //Assert not null
        assertEquals("User updated successfully", response.getMessage());       //Assert message
        assertEquals("jwtToken", response.getToken());                          //Assert token
        verify(passwordEncoder).encode("newPassword");                      //Verify password encoded
        verify(userRepository).save(any(User.class));                               //Verify saved
    }

    @Test   //Test admin role update
    void UpdateUserProfile_shouldAllowAdminToUpdateRoles() 
    {
        Long userId = 1L;               //Target ID
        String adminUsername = "admin"; //Admin user
        mockAuthentication(adminUsername, "ROLE_ADMIN");    //Authenticate admin
        UserDTO updateDto = new UserDTO();                          //Create DTO
        updateDto.setRole(Role.ADMIN);                              //Set role
        User user = new User();                                     //Target user
        user.setUserId(userId);                                     //Set ID
        user.setUsername("user1");                          //Set username
        user.setRole(Role.CUSTOMER);                                //Set old role

        //Mock interactions
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.findByUsername(adminUsername)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userMapper.toDTO(any(User.class))).thenReturn(updateDto);
        when(JwtUtil.generateToken(anyString(), anyList())).thenReturn("jwtToken");
        AuthResponseDTO response = userService.UpdateUserProfile(userId, updateDto);    //Call update
        assertEquals(Role.ADMIN, user.getRole());                                       //Assert role change
        assertEquals("jwtToken", response.getToken());                          //Assert token
        verify(userRepository).save(user);                                              //Verify save
    }

    @Test   //Test access denial on unauthorized update
    void UpdateUserProfile_shouldThrowAccessDeniedException_ifNotOwnerOrAdmin() 
    {
        Long userId = 1L;                                           //Target user
        String otherUsername = "otherUser";                         //Not owner
        mockAuthentication(otherUsername, "ROLE_CUSTOMER"); //Authenticate
        User userToUpdate = new User();                             //Target user
        userToUpdate.setUserId(userId);                             //Set ID
        userToUpdate.setUsername("user1");                  //Set username
        User otherUser = new User();                                //Logged-in user
        otherUser.setUsername(otherUsername);                       //Set username

        //Mock find methods
        when(userRepository.findById(userId)).thenReturn(Optional.of(userToUpdate));
        when(userRepository.findByUsername(otherUsername)).thenReturn(Optional.of(otherUser));

        UserDTO updateDto = new UserDTO();  //Empty update
        assertThrows(AccessDeniedException.class, () -> userService.UpdateUserProfile(userId, updateDto)); //Expect denial
    }

    @Test   //Test user deletion by admin
    void DeleteUserProfile_shouldDeleteUser_ifAdminAndUserExists() 
    {
        Long userId = 1L;                                               //ID to delete
        mockAuthentication("admin", "ROLE_ADMIN");      //Admin auth
        when(userRepository.existsById(userId)).thenReturn(true);   //User exists
        userService.DeleteUserProfile(userId);                          //Call delete
        verify(userRepository).deleteById(userId);                      //Verify deletion
    }

    @Test   //Test deletion when user does not exist
    void DeleteUserProfile_shouldThrowUserNotFoundException_ifUserDoesNotExist() 
    {
        Long userId = 1L;                                                   //ID to delete
        mockAuthentication("admin", "ROLE_ADMIN");      //Admin auth
        when(userRepository.existsById(userId)).thenReturn(false);  //User not found
        assertThrows(UserNotFoundException.class, () -> userService.DeleteUserProfile(userId)); //Expect exception
    }

    @Test   //Test deletion by unauthorized user
    void DeleteUserProfile_shouldThrowAccessDeniedException_ifNotAdmin() 
    {
        mockAuthentication("user1", "ROLE_CUSTOMER");   //Not admin
        assertThrows(AccessDeniedException.class, () -> userService.DeleteUserProfile(1L)); //Expect denial
    }
}