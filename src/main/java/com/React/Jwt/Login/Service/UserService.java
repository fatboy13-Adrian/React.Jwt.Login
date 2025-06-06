package com.React.Jwt.Login.Service;                                                    //Package declaration for user-related service classes
import com.React.Jwt.Login.DTO.Auth.AuthResponseDTO;                                    //Import DTO for authentication response (includes JWT token and user data)
import com.React.Jwt.Login.DTO.UserDTO;                                                 //Import DTO for transferring user data between layers
import com.React.Jwt.Login.Entity.User;                                                 //Import User entity representing the user table in the database
import com.React.Jwt.Login.Exception.*;                                                 //Import all custom exception classes used in this service
import com.React.Jwt.Login.Mapper.UserMapper;                                           //Import mapper to convert between User entity and UserDTO
import com.React.Jwt.Login.Repository.UserRepository;                                   //Import repository interface for User entity CRUD operations
import com.React.Jwt.Login.Security.JWT.JwtUtil;                                        //Import utility class for creating and managing JWT tokens
import lombok.RequiredArgsConstructor;                                                  //Lombok annotation to auto-generate constructor for all final fields
import org.springframework.security.access.AccessDeniedException;                       //Import exception thrown when a user lacks permission
import org.springframework.security.core.GrantedAuthority;                              //Interface representing an authority granted to an Authentication object (e.g., a role)
import org.springframework.security.core.authority.SimpleGrantedAuthority;              //Implementation of GrantedAuthority for a simple string-based role or authority
import org.springframework.security.core.context.SecurityContextHolder;                 //Import SecurityContextHolder to retrieve or modify current user's authentication
import org.springframework.security.crypto.password.PasswordEncoder;                    //Import interface for password hashing and verification
import org.springframework.stereotype.Service;                                          //Marks this class as a Spring-managed service component
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken; //Import Spring Security class to create an authentication token
import org.springframework.security.core.Authentication;                                //Import Spring Security interface representing an authenticated principal
import java.util.*;                                                                     //Import core Java utility classes (e.g., List, Optional, etc.)
import java.util.stream.Collectors;                                                     //Import stream API for functional-style collection operations

@Service                    //Marks this as a Spring service bean
@RequiredArgsConstructor    //Lombok annotation for constructor injection of final fields
public class UserService 
{
    private final UserRepository userRepository;                        //Repository for user data access
    private final UserMapper userMapper;                                //Mapper to convert between User entity and DTO
    private final PasswordEncoder passwordEncoder;                      //Password encoder for hashing passwords
    private final JwtUtil jwtUtil;                                      //JWT utility for token generation
    private final UserAuthService userAuthService;                      //Service for authenticated user details
    private final UserAuthorizationService userAuthorizationService;    //Service for authorization checks

    //Register a new user with validation and password encoding
    public UserDTO registerNewUser(UserDTO userDTO) 
    {
        //Check if username already exists
        if(userRepository.existsByUsername(userDTO.getUsername()))
            throw new UsernameAlreadyExistsException(userDTO.getUsername());

        //Check if email already exists
        if(userRepository.existsByEmail(userDTO.getEmail()))
            throw new EmailAlreadyExistsException(userDTO.getEmail());

        userDTO.setPassword(passwordEncoder.encode(userDTO.getPassword())); //Encode password before saving
        User savedUser = userRepository.save(userMapper.toEntity(userDTO)); //Save new user entity
        return userMapper.toDTO(savedUser);                                  //Return saved user as DTO
    }

    //View a user's profile by ID with authorization check
    public UserDTO viewUserProfile(Long userId) 
    {
        userAuthorizationService.authorizeUserOrAdmin(userId);  //Authorize if current user is admin or the user themselves
        return userMapper.toDTO(findUserById(userId));          //Retrieve user entity and map to DTO
    }

    //View all user profiles, only accessible by admin
    public List<UserDTO> viewUserProfiles() 
    {
        userAuthorizationService.authorizeAdmin();                                                      //Authorize admin access only
        return userRepository.findAll().stream().map(userMapper::toDTO).collect(Collectors.toList());   //Retrieve all users, convert to DTO list
    }

    //Update user profile with authorization, partial update, and token refresh
    public AuthResponseDTO updateUserProfile(Long userId, UserDTO userDTO) 
    {
        User currentUser = userAuthService.getAuthenticatedUser();  //Get currently authenticated user entity
        User userToUpdate = findUserById(userId);                   //Find user to update by ID

        //Check roles
        boolean isAdmin = userAuthService.hasRole("ROLE_ADMIN");
        boolean isSelf = Objects.equals(userId, currentUser.getUserId());

        //Deny access if not admin or self
        if(!isAdmin && !isSelf)
            throw new AccessDeniedException("You are not authorized to update this user.");

        //Conditionally update fields if provided and non-empty
        Optional.ofNullable(userDTO.getFirstName()).filter(s -> !s.trim().isEmpty()).ifPresent(userToUpdate::setFirstName);
        Optional.ofNullable(userDTO.getLastName()).filter(s -> !s.trim().isEmpty()).ifPresent(userToUpdate::setLastName);
        Optional.ofNullable(userDTO.getUsername()).filter(s -> !s.trim().isEmpty()).ifPresent(userToUpdate::setUsername);
        Optional.ofNullable(userDTO.getEmail()).filter(s -> !s.trim().isEmpty()).ifPresent(userToUpdate::setEmail);
        Optional.ofNullable(userDTO.getPhone()).filter(s -> !s.trim().isEmpty()).ifPresent(userToUpdate::setPhone);
        Optional.ofNullable(userDTO.getAddress()).filter(s -> !s.trim().isEmpty()).ifPresent(userToUpdate::setAddress);
        
        //Encode password if updated
        Optional.ofNullable(userDTO.getPassword()).filter(s -> !s.trim().isEmpty()).ifPresent(pwd -> userToUpdate.setPassword(passwordEncoder.encode(pwd)));

        //Only admin can update roles
        if(isAdmin && userDTO.getRole() != null)
            userToUpdate.setRole(userDTO.getRole());

        User updatedUser = userRepository.save(userToUpdate);       //Save updated user entity
        UserDTO updatedUserDTO = userMapper.toDTO(updatedUser);     //Convert updated user to DTO
        List<String> roles = List.of(updatedUser.getRole().name()); //Prepare roles list for token generation
        String token = jwtUtil.generateToken(updatedUser.getUsername(), roles);                                                     //Generate new JWT token with updated roles
        List<GrantedAuthority> authorities = roles.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList());          //Create authorities list from roles
        Authentication newAuth = new UsernamePasswordAuthenticationToken(updatedUser.getUsername(), null, authorities); //Create new authentication token with updated authorities
        SecurityContextHolder.getContext().setAuthentication(newAuth);                                                              //Update security context with new authentication

        //Build and return authentication response DTO with updated info and token
        return AuthResponseDTO.builder().userId(updatedUser.getUserId()).firstName(updatedUserDTO.getFirstName()).lastName(updatedUserDTO.getLastName())
        .phone(updatedUserDTO.getPhone()).address(updatedUserDTO.getAddress()).email(updatedUserDTO.getEmail()).username(updatedUserDTO.getUsername())
        .token(token).message("User updated successfully").role(updatedUserDTO.getRole()).build();
    }

    //Delete user profile by ID, admin only
    public void deleteUserProfile(Long userId) 
    {
        userAuthorizationService.authorizeAdmin();  //Authorize admin access
        
        //Throw exception if user does not exist
        if(!userRepository.existsById(userId))
            throw new UserNotFoundException(userId.toString());
        
        userRepository.deleteById(userId);          //Delete user by ID
    }

    //Helper method to find user by ID or throw exception
    private User findUserById(Long userId) 
    {
        //Find user or throw not found exception
        return userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException(userId.toString()));
    }
}