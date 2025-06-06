package com.React.Jwt.Login.Service;                                //Declare the package for the service tests
import com.React.Jwt.Login.Entity.User;                             //Import the User entity used in tests
import org.junit.jupiter.api.BeforeEach;                            //Runs before each test
import org.junit.jupiter.api.Test;                                  //Marks test methods
import org.junit.jupiter.api.extension.ExtendWith;                  //Adds extensions like Mockito
import org.mockito.*;                                               //Includes @Mock, @InjectMocks, etc.
import org.mockito.junit.jupiter.MockitoExtension;                  //Enables Mockito with JUnit 5
import org.springframework.security.access.AccessDeniedException;   //Spring Security exception for access control
import static org.junit.jupiter.api.Assertions.*;                   //Provides assertion methods
import static org.mockito.Mockito.*;                                //Provides mocking and verification tools

@ExtendWith(MockitoExtension.class) //Enable Mockito extension for this test class
class UserAuthorizationServiceTest 
{
    @Mock 
    private UserAuthService userAuthService;                    //Mock the UserAuthService dependency

    @InjectMocks 
    private UserAuthorizationService userAuthorizationService;  //Inject the mock into the class under test

    private static final Long USER_ID = 123L;                   //Test user ID constant
    private User currentUser;                                   //User object representing the current authenticated user

    @BeforeEach //Setup method to run before each test
    void setUp() 
    {
        currentUser = new User();       //Create a new User
        currentUser.setUserId(USER_ID); //Set the user ID
    }

    @Test   //Test case: user has admin role
    void authorizeAdmin_AllowsAccess_WhenUserIsAdmin() 
    {
        when(userAuthService.hasRole("ROLE_ADMIN")).thenReturn(true);   //Mock user has admin role
        assertDoesNotThrow(() -> userAuthorizationService.authorizeAdmin());            //Should not throw exception
        verify(userAuthService).hasRole("ROLE_ADMIN");                          //Verify role check was called
    }

    @Test   //Test case: user lacks admin role
    void authorizeAdmin_ThrowsAccessDeniedException_WhenUserIsNotAdmin() 
    {
        when(userAuthService.hasRole("ROLE_ADMIN")).thenReturn(false);      //Mock user is not admin
        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> userAuthorizationService.authorizeAdmin());  //Should throw exception
        assertEquals("Only admins can access this resource.", ex.getMessage()); //Verify message
        verify(userAuthService).hasRole("ROLE_ADMIN");                          //Verify method called
    }

    @Test   //Test case: user is accessing their own data
    void authorizeUserOrAdmin_AllowsAccess_WhenUserIsSelf() 
    {
        when(userAuthService.getAuthenticatedUser()).thenReturn(currentUser);               //Mock current user
        assertDoesNotThrow(() -> userAuthorizationService.authorizeUserOrAdmin(USER_ID));   //Should pass
        verify(userAuthService).getAuthenticatedUser();                                     //Verify user check
        verify(userAuthService, never()).hasRole(anyString());                              //Role check should not occur
    }

    @Test   //Test case: user is admin accessing someone else's data
    void authorizeUserOrAdmin_AllowsAccess_WhenUserIsAdminAndNotSelf() 
    {
        when(userAuthService.getAuthenticatedUser()).thenReturn(currentUser);                   //Mock current user
        when(userAuthService.hasRole("ROLE_ADMIN")).thenReturn(true);           //Mock admin role
        Long otherUserId = USER_ID + 1;                                                         //Another user ID
        assertDoesNotThrow(() -> userAuthorizationService.authorizeUserOrAdmin(otherUserId));   //Should pass
        verify(userAuthService).getAuthenticatedUser();                                         //Check user ID
        verify(userAuthService).hasRole("ROLE_ADMIN");                                  //Check admin role
    }

    @Test   //Test case: user is neither self nor admin
    void authorizeUserOrAdmin_ThrowsAccessDeniedException_WhenNotSelfAndNotAdmin() 
    {
        when(userAuthService.getAuthenticatedUser()).thenReturn(currentUser);                       //Mock current user
        when(userAuthService.hasRole("ROLE_ADMIN")).thenReturn(false);              //Not an admin
        Long otherUserId = USER_ID + 1;                                                             //Another user ID
        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> userAuthorizationService.authorizeUserOrAdmin(otherUserId)); //Should throw
        assertEquals("You are not authorized to access this data.", ex.getMessage());       //Validate message
        verify(userAuthService).getAuthenticatedUser();                                             //Verify user fetch
        verify(userAuthService).hasRole("ROLE_ADMIN");                                      //Verify role check
    }
}