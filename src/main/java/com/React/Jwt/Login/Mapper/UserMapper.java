package com.React.Jwt.Login.Mapper;     //Package declaration
import com.React.Jwt.Login.DTO.UserDTO; //Importing UserDTO for mapping
import com.React.Jwt.Login.Entity.User; //Importing User entity for mapping
import org.mapstruct.Mapper;            //Importing MapStruct Mapper annotation

@Mapper(componentModel = "spring")      //Marks this interface as a MapStruct mapper for Spring context
public interface UserMapper 
{
    UserDTO toDTO(User user);       //Converts User entity to UserDTO
    User toEntity(UserDTO userDTO); //Converts UserDTO to User entity
}