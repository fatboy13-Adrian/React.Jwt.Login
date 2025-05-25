package com.React.Jwt.Login.Entity.Auth;    //Package declaration
import lombok.AllArgsConstructor;           //Generates a constructor with all arguments
import lombok.Builder;                      //Generates a builder for object creation
import lombok.Getter;                       //Generates getters for all fields
import lombok.NoArgsConstructor;            //Generates a no-argument constructor
import lombok.Setter;                       //Generates setters for all fields

@Getter                             //Automatically generates getter methods for all fields in the class.
@Setter                             //Automatically generates setter methods for all fields in the class.
@AllArgsConstructor                 //Automatically generates a constructor with parameters for all fields in the class.
@NoArgsConstructor                  //Automatically generates a no-argument constructor for the class.
@Builder                            //Automatically generates a builder pattern for the class to simplify object creation.
public class RefreshTokenRequest 
{
    private String oldToken;        //Declares a private field named 'oldToken' that stores the value of the old token for refresh.
}