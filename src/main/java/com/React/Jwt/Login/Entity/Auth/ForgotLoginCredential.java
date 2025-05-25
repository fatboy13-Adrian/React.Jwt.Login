package com.React.Jwt.Login.Entity.Auth;    //Package declaration
import lombok.AllArgsConstructor;           //Generates a constructor with all arguments
import lombok.Builder;                      //Generates a builder for object creation
import lombok.Getter;                       //Generates getters for all fields
import lombok.NoArgsConstructor;            //Generates a no-argument constructor
import lombok.Setter;                       //Generates setters for all fields

@Getter                             //Generates getter methods for all fields
@Setter                             //Generates setter methods for all fields
@Builder                            //Provides a builder pattern for creating instances of this class
@AllArgsConstructor                 //Generates a constructor with all fields
@NoArgsConstructor                  //Generates a no-argument constructorpackage com.user.login.Entity;
public class ForgotLoginCredential 
{
    private String email, username, password, message;  //Email, username and password for resetting username and password
}
