package com.React.Jwt.Login.DataLoader;                                 //Declares package for data loader classes
import com.React.Jwt.Login.Entity.User;                                 //Imports the User entity class
import com.React.Jwt.Login.Enum.Role;                                   //Imports the Role enum
import com.React.Jwt.Login.Repository.UserRepository;                   //Imports the User repository interface
import lombok.RequiredArgsConstructor;                                  //Imports Lombok annotation to generate a constructor for final fields
import org.springframework.boot.CommandLineRunner;                      //Imports Spring Boot interface to run code at startup
import org.springframework.context.annotation.Bean;                     //Imports annotation to declare a Spring-managed bean
import org.springframework.context.annotation.Configuration;            //Imports annotation to mark this class as configuration
import org.springframework.security.crypto.password.PasswordEncoder;    //Imports encoder for encrypting passwords

@Configuration              //Marks this class as a configuration class for Spring context
@RequiredArgsConstructor    //Generates a constructor for final fields: userRepository and passwordEncoder
public class UserDataLoader 
{
    private final UserRepository userRepository;    //Injected repository to perform CRUD operations on User entities
    private final PasswordEncoder passwordEncoder;  //Injected encoder to securely hash passwords

    @Bean  //Declares this method as a Spring bean to be executed at runtime
    public CommandLineRunner loadData() 
    {  //Lambda expression to implement run() method
        return args -> {  
            //Only load data if the database is empty
            if(userRepository.count() == 0) 
            {  
                //Create and save a CUSTOMER user
                userRepository.save(User.builder().firstName("John").lastName("Doe").address("123 Main Street").phone("+6598765432")
                .email("john.doe@example.com").username("johndoe").password(passwordEncoder.encode("customer123")).role(Role.CUSTOMER).build());

                //Create and save an ADMIN user
                userRepository.save(User.builder().firstName("Admin").lastName("User").address("456 Admin Road").phone("+6511122233") 
                .email("admin@example.com").username("admin").password(passwordEncoder.encode("admin123")).role(Role.ADMIN).build());

                //Create and save a USER role user
                userRepository.save(User.builder().firstName("Alice").lastName("Wong").address("789 Orchard Blvd").phone("+6512345678")
                .email("alice.wong@example.com").username("alice").password(passwordEncoder.encode("alice123")).role(Role.USER).build());
            }
        };
    }
}