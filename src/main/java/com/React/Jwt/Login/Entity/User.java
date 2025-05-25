package com.React.Jwt.Login.Entity;     //Package declaration
import jakarta.persistence.*;           //JPA annotations
import lombok.*;                        //Lombok annotations for boilerplate code
import com.React.Jwt.Login.Enum.Role;   //Importing Role enum

@Entity                                 //Marks as a JPA entity
@Table(name = "users")                  //Specifies table name
@Getter                                 //Generates getter methods
@Setter                                 //Generates setter methods
@NoArgsConstructor                      //Generates no-args constructor
@AllArgsConstructor                     //Generates all-args constructor
@Builder                                //Enables builder pattern
public class User 
{
    @Id                                                     //Marks as primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)     //Auto-generate ID
    @Column(name = "userId")                                //Maps to 'userId' column
    private Long userId;                                    //User's unique ID

    @Column(nullable = false)                               //Non-nullable column
    private String firstName;                               //User's first name

    @Column(nullable = false)                               //Non-nullable column
    private String lastName;                                //User's last name

    @Column(nullable = false, unique = true, length = 15)   //Unique, non-nullable column
    private String phone;                                   //User's phone number

    @Column(nullable = false)                               //Non-nullable column
    private String address;                                 //User's home address

    @Column(nullable = false, unique = true)                //Unique, non-nullable column
    private String email;                                   //User's email

    @Column(nullable = false, unique = true)                //Unique, non-nullable column
    private String username;                                //User's username

    @Column(nullable = false)                               //Non-nullable column
    private String password;                                //User's password

    @Enumerated(EnumType.STRING)                            //Store enum as string
    @Column(name = "role", nullable = false)                //Non-nullable 'role' column
    private Role role;                                      //User's role (e.g., ADMIN, CUSTOMER)
}