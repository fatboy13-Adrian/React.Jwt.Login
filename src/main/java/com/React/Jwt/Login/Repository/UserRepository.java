package com.React.Jwt.Login.Repository;                         //Package declaration
import java.util.Optional;                                      //Importing Optional to safely handle nullable values
import org.springframework.data.jpa.repository.JpaRepository;   //Importing JpaRepository to leverage CRUD methods
import org.springframework.stereotype.Repository;               //Importing Repository annotation to indicate it's a repository
import com.React.Jwt.Login.Entity.User;                         //Importing the User entity class

@Repository //Marks this interface as a repository bean for Spring's component scanning
public interface UserRepository extends JpaRepository<User, Long> 
{ 
    Optional<User> findByUsername(String username); //Finds a User by their username
    Optional<User> findByEmail(String email);       //Finds a User by their email
    boolean existsByUsername(String username);      //Checks if a User exists with the given username
    boolean existsByEmail(String email);            //Checks if a User exists with the given email
}