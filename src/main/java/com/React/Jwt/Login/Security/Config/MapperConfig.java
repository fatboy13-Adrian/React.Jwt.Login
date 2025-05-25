package com.React.Jwt.Login.Security.Config;                    //Package declaration
import org.mapstruct.factory.Mappers;                           //Provides access to MapStruct mapper instances
import org.springframework.context.annotation.Bean;             //Marks a method as a Spring bean producer
import org.springframework.context.annotation.Configuration;    //Declares this class as a Spring configuration
import com.React.Jwt.Login.Mapper.UserMapper;                   //Imports the UserMapper interface

@Configuration  //Marks class as a source of Spring bean definitions
public class MapperConfig 
{
    @Bean   //Defines a UserMapper bean for dependency injection
    public UserMapper userMapper() 
    {
        return Mappers.getMapper(UserMapper.class); //Returns a MapStruct mapper instance
    }
}