package com.React.Jwt.Login.Service;                                    //Declares the package this class belongs to
import com.React.Jwt.Login.DTO.UserDTO;                                 //Imports the UserDTO class used for transferring user data
import com.React.Jwt.Login.Entity.User;                                 //Imports the User entity class
import com.React.Jwt.Login.Exception.UsernameNotFoundException;         //Imports custom exception thrown when user is not found
import com.React.Jwt.Login.Mapper.UserMapper;                           //Imports mapper to convert User to UserDTO
import com.React.Jwt.Login.Repository.UserRepository;                   //Imports repository interface for accessing user data
import org.junit.jupiter.api.BeforeEach;                                //Runs before each test
import org.junit.jupiter.api.Test;                                      //Marks a method as a test
import org.junit.jupiter.api.extension.ExtendWith;                      //Adds support for JUnit extensions
import org.mockito.*;                                                   //Provides @Mock, @InjectMocks, etc.
import org.mockito.junit.jupiter.MockitoExtension;                      //Integrates Mockito with JUnit 5
import org.springframework.security.access.AccessDeniedException;       //Exception for unauthorized access
import org.springframework.security.core.Authentication;                //Represents user's authentication
import org.springframework.security.core.GrantedAuthority;              //Represents a user role/authority
import org.springframework.security.core.context.SecurityContext;       //Holds security context
import org.springframework.security.core.context.SecurityContextHolder; //Stores SecurityContext
import java.util.List;                                                  //List interface
import java.util.Optional;                                              //Wrapper for optional values
import java.util.stream.Collectors;                                     //Collectors for stream processing
import java.util.stream.Stream;                                         //Stream API
import static org.junit.jupiter.api.Assertions.*;                       //Assertion methods
import static org.mockito.Mockito.*;                                    //Mocking utility methods

@ExtendWith(MockitoExtension.class) //Enable Mockito support in JUnit 5
class UserAuthServiceTest 
{
    @Mock 
    private UserRepository userRepository;      //Mock repository for user data

    @Mock 
    private UserMapper userMapper;              //Mock user mapper

    @Mock 
    private SecurityContext securityContext;    //Mock security context

    @Mock 
    private Authentication authentication;      //Mock authentication object

    @InjectMocks 
    private UserAuthService userAuthService;    //Inject mocks into the service under test

    //Test user entity and DTO objects
    private final User testUser = new User();
    private final UserDTO testUserDTO = new UserDTO();

    @BeforeEach //Clear security context before each test
    void setUp() 
    {
        SecurityContextHolder.clearContext();
    }

    @Test   //Test: return username when authenticated
    void getAuthenticatedUsername_shouldReturnUsername_whenAuthenticated() 
    {
        when(authentication.isAuthenticated()).thenReturn(true);        //Mock authenticated = true
        when(authentication.getName()).thenReturn("adrian");            //Mock username
        when(securityContext.getAuthentication()).thenReturn(authentication);   //Mock security context
        SecurityContextHolder.setContext(securityContext);                      //Set security context
        String result = userAuthService.getAuthenticatedUsername();             //Call method
        assertEquals("adrian", result);                                 //Assert result
    }

    @Test   //Test: throw exception when unauthenticated
    void getAuthenticatedUsername_shouldThrowException_whenUnauthenticated() 
    {
        when(authentication.isAuthenticated()).thenReturn(false);                                           //Mock not authenticated
        when(securityContext.getAuthentication()).thenReturn(authentication);                                       //Set auth
        SecurityContextHolder.setContext(securityContext);                                                          //Set security context
        assertThrows(AccessDeniedException.class, () -> userAuthService.getAuthenticatedUsername());    //Should throw
    }

    @Test   //Test: return User when authenticated and found
    void getAuthenticatedUser_shouldReturnUser() 
    {
        when(authentication.isAuthenticated()).thenReturn(true);                            //Authenticated
        when(authentication.getName()).thenReturn("adrian");                                //Username
        when(securityContext.getAuthentication()).thenReturn(authentication);                       //Security context
        SecurityContextHolder.setContext(securityContext);                                          //Set context
        when(userRepository.findByUsername("adrian")).thenReturn(Optional.of(testUser));    //Mock user found
        User result = userAuthService.getAuthenticatedUser();                                       //Call method
        assertEquals(testUser, result);                                                             //Assert user
    }

    @Test   //Test: throw exception when user not found
    void getAuthenticatedUser_shouldThrowException_whenUserNotFound() 
    {
        when(authentication.isAuthenticated()).thenReturn(true);                                            //Authenticated
        when(authentication.getName()).thenReturn("unknownUser");                                           //Unknown user
        when(securityContext.getAuthentication()).thenReturn(authentication);                                       //Security context
        SecurityContextHolder.setContext(securityContext);                                                          //Set context
        when(userRepository.findByUsername("unknownUser")).thenReturn(Optional.empty());                    //User not found
        assertThrows(UsernameNotFoundException.class, () -> userAuthService.getAuthenticatedUser());    //Should throw
    }

    @Test   //Test: return UserDTO when current user exists
    void getCurrentUser_shouldReturnUserDTO() 
    {
        when(authentication.isAuthenticated()).thenReturn(true);                            //Authenticated
        when(authentication.getName()).thenReturn("adrian");                                //Username
        when(securityContext.getAuthentication()).thenReturn(authentication);                       //Set auth
        SecurityContextHolder.setContext(securityContext);                                          //Set context
        when(userRepository.findByUsername("adrian")).thenReturn(Optional.of(testUser));    //Found user
        when(userMapper.toDTO(testUser)).thenReturn(testUserDTO);                                   //Map to DTO
        UserDTO result = userAuthService.getCurrentUser();                                          //Call method
        assertEquals(testUserDTO, result);                                                          //Assert result
    }

    @Test   //Test: hasRole returns true when role matches
    void hasRole_shouldReturnTrue_whenUserHasRole() 
    {
        String targetRole = "ROLE_ADMIN"; //Target role

        //Create authority lambda
        List<GrantedAuthority> authorities = Stream.of(targetRole).map(role -> (GrantedAuthority) () -> role).collect(Collectors.toList()); //Collect as list
        when(authentication.getAuthorities()).thenAnswer(invocation -> authorities);    //Return authorities
        when(securityContext.getAuthentication()).thenReturn(authentication);           //Return auth
        SecurityContextHolder.setContext(securityContext);                              //Set context
        boolean result = userAuthService.hasRole(targetRole);                           //Check role
        assertTrue(result);                                                             //Should be true
    }

    @Test   //Test: hasRole returns false when role doesn't match
    void hasRole_shouldReturnFalse_whenUserDoesNotHaveRole() 
    {
        //Only has ROLE_USER
        List<GrantedAuthority> authorities = Stream.of("ROLE_USER").map(role -> (GrantedAuthority) () -> role).collect(Collectors.toList());
        when(authentication.getAuthorities()).thenAnswer(invocation -> authorities);    //Return authorities
        when(securityContext.getAuthentication()).thenReturn(authentication);           //Set auth
        SecurityContextHolder.setContext(securityContext);                              //Set context
        boolean result = userAuthService.hasRole("ROLE_ADMIN");                 //Check for admin role
        assertFalse(result);                                                            //Should be false
    }

    @Test   //Test: hasRole returns false when authorities are null
    void hasRole_shouldReturnFalse_whenAuthoritiesAreNull() 
    {
        when(authentication.getAuthorities()).thenReturn(null);         //Null authorities
        when(securityContext.getAuthentication()).thenReturn(authentication);   //Set auth
        SecurityContextHolder.setContext(securityContext);                      //Set context
        boolean result = userAuthService.hasRole("ROLE_ADMIN");         //Check role
        assertFalse(result);                                                    //Should be false
    }

    @Test   //Test: hasRole returns false when authentication is null
    void hasRole_shouldReturnFalse_whenAuthenticationIsNull() 
    {
        when(securityContext.getAuthentication()).thenReturn(null);     //Null authentication
        SecurityContextHolder.setContext(securityContext);                  //Set context
        boolean result = userAuthService.hasRole("ROLE_ADMIN");     //Check role
        assertFalse(result);                                                //Should be false
    }
}