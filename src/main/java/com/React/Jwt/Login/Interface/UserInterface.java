package com.React.Jwt.Login.Interface;                  //Package declaration
import java.util.List;                                  //Importing List for return type of ViewUserProfiles method
import com.React.Jwt.Login.DTO.UserDTO;                 //Importing UserDTO class for user-related data
import com.React.Jwt.Login.DTO.Auth.AuthResponseDTO;    //Importing AuthResponseDTO class to transfer user data between layers

public interface UserInterface 
{
    UserDTO RegisterNewUser(UserDTO userDTO);                           //Method to create a new user
    UserDTO ViewUserProfile(Long userId);                               //Method to retrieve a user by their ID
    List<UserDTO> ViewUserProfiles();                                   //Method to retrieve a list of all users
    AuthResponseDTO UpdateUserProfile(Long userId, UserDTO userDTO);    //Method to update an existing user
    void DeleteUserProfile(Long userId);                                //Method to delete a user by their ID
}