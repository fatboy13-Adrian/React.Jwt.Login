package com.React.Jwt.Login.Service;                                                    //Package declaration
import com.React.Jwt.Login.DTO.Auth.AuthResponseDTO;                                    //Import Data Transfer Object for authentication responses
import com.React.Jwt.Login.DTO.UserDTO;                                                 //Import Data Transfer Object for User entity
import com.React.Jwt.Login.Entity.User;                                                 //Import User entity class  
import com.React.Jwt.Login.Exception.*;                                                 //Import custom exceptions used in the service                  
import com.React.Jwt.Login.Interface.UserInterface;                                     //Import UserInterface defining the service contract
import com.React.Jwt.Login.Mapper.UserMapper;                                           //Import Mapper class to convert between User entity and DTO
import com.React.Jwt.Login.Repository.UserRepository;                                   //Import Repository interface to access User persistence
import com.React.Jwt.Login.Security.JWT.JwtUtil;                                        //Import JWT utility class for token generation
import lombok.RequiredArgsConstructor;                                                  //Lombok annotation to generate constructor with required (final) fields
import org.springframework.security.access.AccessDeniedException;                       //Spring Security exception for access denied scenarios
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken; //Spring Security authentication token implementation
import org.springframework.security.core.Authentication;                                //Spring Security authentication interface
import org.springframework.security.core.GrantedAuthority;                              //Spring Security authority interface
import org.springframework.security.core.authority.SimpleGrantedAuthority;              //Implementation of GrantedAuthority with simple role string
import org.springframework.security.core.context.SecurityContextHolder;                 //Access to Spring Security context holder for auth info
import org.springframework.security.crypto.password.PasswordEncoder;                    //Interface to encode passwords securely
import org.springframework.stereotype.Service;                                          //Spring stereotype annotation to mark this class as a service component
import java.util.*;                                                                     //Import utilities like Optional, List, Objects, etc.
import java.util.stream.Collectors;                                                     //Import Collectors for stream processing

@Service                    //Mark this class as a Spring service bean
@RequiredArgsConstructor    //Lombok annotation to automatically generate a constructor with all final fields (for dependency injection)
public class UserService implements UserInterface 
{
    private final JwtUtil JwtUtil;                //JWT utility to generate and validate JWT tokens
    private final UserRepository userRepository;    //Repository to interact with User persistence (database)
    private final UserMapper userMapper;            //Mapper to convert User entity <-> UserDTO
    private final PasswordEncoder passwordEncoder;  //Password encoder to hash user passwords securely

    //Create a new user with validations for username and email uniqueness
    @Override
    public UserDTO RegisterNewUser(UserDTO userDTO) 
    {
        //Check if username already exists in repository, throw exception if yes
        if(userRepository.existsByUsername(userDTO.getUsername()))
            throw new UsernameAlreadyExistsException(userDTO.getUsername());

        //Check if email already exists in repository, throw exception if yes
        if(userRepository.existsByEmail(userDTO.getEmail()))
            throw new EmailAlreadyExistsException(userDTO.getEmail());

        userDTO.setPassword(passwordEncoder.encode(userDTO.getPassword())); //Encode (hash) the user's password before saving
        User savedUser = userRepository.save(userMapper.toEntity(userDTO)); //Convert DTO to entity and save user in the repository
        return userMapper.toDTO(savedUser);                                 //Convert saved entity back to DTO and return
    }

    //Retrieve a user by userId with authorization check
    @Override
    public UserDTO ViewUserProfile(Long userId) 
    {
        authorizeUserOrAdmin(userId);                   //Check if current user is authorized (self or admin)
        return userMapper.toDTO(findUserById(userId));  //Find user entity by ID and convert to DTO for returning
    }

    //Retrieve list of all users, only accessible by admins
    @Override
    public List<UserDTO> ViewUserProfiles() 
    {
        authorizeAdmin();   //Authorize only admins for this operation
        
        //Fetch all users, map each to DTO, and collect to list
        return userRepository.findAll().stream().map(userMapper::toDTO).collect(Collectors.toList());
    }

    //Update user profile info and roles, with authorization checks and token regeneration
    @Override
    public AuthResponseDTO UpdateUserProfile(Long userId, UserDTO userDTO) 
    {
        User currentUser = getAuthenticatedUser();                          //Get current authenticated user entity
        User userToUpdate = findUserById(userId);                           //Retrieve user entity to update by ID
        boolean isAdmin = hasRole("ROLE_ADMIN");                    //Check if current user has admin role
        boolean isSelf = Objects.equals(userId, currentUser.getUserId());   //Check if current user is updating own profile

        //Authorization: only admin or self can update the user
        if(!isAdmin && !isSelf) 
            throw new AccessDeniedException("You are not authorized to update this user.");

        //Update allowed fields if present and not empty (self and admin can do this)
        Optional.ofNullable(userDTO.getFirstName()).filter(s -> !s.trim().isEmpty()).ifPresent(userToUpdate::setFirstName);
        Optional.ofNullable(userDTO.getLastName()).filter(s -> !s.trim().isEmpty()).ifPresent(userToUpdate::setLastName);
        Optional.ofNullable(userDTO.getUsername()).filter(s -> !s.trim().isEmpty()).ifPresent(userToUpdate::setUsername);
        Optional.ofNullable(userDTO.getEmail()).filter(s -> !s.trim().isEmpty()).ifPresent(userToUpdate::setEmail);
        Optional.ofNullable(userDTO.getPhone()).filter(s -> !s.trim().isEmpty()).ifPresent(userToUpdate::setPhone);
        Optional.ofNullable(userDTO.getAddress()).filter(s -> !s.trim().isEmpty()).ifPresent(userToUpdate::setAddress);
        Optional.ofNullable(userDTO.getPassword()).filter(s -> !s.trim().isEmpty()).ifPresent(pwd -> userToUpdate.setPassword(passwordEncoder.encode(pwd)));

        //Only admins can update the role field
        if(isAdmin && userDTO.getRole() != null) 
            userToUpdate.setRole(userDTO.getRole());
 
        User updatedUser = userRepository.save(userToUpdate);       //Save updated user entity to repository
        UserDTO updatedUserDTO = userMapper.toDTO(updatedUser);     //Convert updated user entity to DTO
        List<String> roles = List.of(updatedUser.getRole().name()); //Create a list with single role name for token generation

        //Generate a new JWT token with updated username and roles
        String token = JwtUtil.generateToken(updatedUser.getUsername(), roles);

        //Prepare new authorities from roles for Spring Security context update
        List<GrantedAuthority> authorities = roles.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList());
        
        //Create new authentication token with updated roles
        Authentication newAuth = new UsernamePasswordAuthenticationToken(updatedUser.getUsername(), null,authorities
        );
        //Update Spring Security context with new authentication to immediately reflect changes
        SecurityContextHolder.getContext().setAuthentication(newAuth);

        //Build and return authentication response with updated user info and token
        return AuthResponseDTO.builder().userId(updatedUser.getUserId()).firstName(updatedUserDTO.getFirstName()).lastName(updatedUserDTO.getLastName())
        .phone(updatedUserDTO.getPhone()).address(updatedUserDTO.getAddress()).email(updatedUserDTO.getEmail()).username(updatedUserDTO.getUsername())
        .token(token).message("User updated successfully").role(updatedUserDTO.getRole()).build();
    }

    //Delete a user by userId, only accessible by admins
    @Override
    public void DeleteUserProfile(Long userId) 
    {
        authorizeAdmin();                   //Ensure only admin can delete users
        
        //Check if user exists, throw if not found
        if(!userRepository.existsById(userId))
            throw new UserNotFoundException(userId.toString());

        userRepository.deleteById(userId);  //Delete user from repository by ID
    }

    //Retrieve currently authenticated username from security context
    public String getAuthenticatedUsername() 
    {
        //Get current authentication object
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        //Throw if not authenticated
        if(auth == null || !auth.isAuthenticated())
            throw new AccessDeniedException("User not authenticated");
        
        return auth.getName();  //Return the username (principal name)
    }

    //Retrieve currently authenticated user's details as a UserDTO
    public UserDTO getCurrentUser() 
    {
        User user = findUserByUsername(getAuthenticatedUsername()); //Find user entity by current username
        return userMapper.toDTO(user);                              //Convert entity to DTO and return
    }

    //Authorize access only if current user has admin role
    private void authorizeAdmin() 
    {
        if(!hasRole("ROLE_ADMIN"))
            throw new AccessDeniedException("Only admins can access this resource.");
    }

    //Authorize access if current user is admin or requesting their own data
    private void authorizeUserOrAdmin(Long userId) 
    {
        User currentUser = getAuthenticatedUser();

        //Check if current user ID matches requested userId
        boolean isSelf = Objects.equals(userId, currentUser.getUserId());
        
        //Throw exception if not admin and not self
        if(!isSelf && !hasRole("ROLE_ADMIN"))
            throw new AccessDeniedException("You are not authorized to access this data.");
    }

    //Check if currently authenticated user has a specific role
    private boolean hasRole(String roleName) 
    {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        //Return false if no authentication or no authorities present
        if(auth == null || auth.getAuthorities() == null) return false;
        
        //Check if any granted authority matches the requested role
        return auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).anyMatch(role -> role.equals(roleName));
    }

    //Retrieve currently authenticated user entity from repository
    public User getAuthenticatedUser() 
    {
        return findUserByUsername(getAuthenticatedUsername());
    }

    //Find User entity by userId or throw UserNotFoundException if not found
    private User findUserById(Long userId) 
    {
        return userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException(userId.toString()));
    }

    //Find User entity by username or throw UsernameNotFoundException if not found
    private User findUserByUsername(String username) 
    {
        return userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(username));
    }
}