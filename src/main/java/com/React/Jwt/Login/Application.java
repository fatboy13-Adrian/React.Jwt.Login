package com.React.Jwt.Login; 											//Define the base package for the application
import org.springframework.boot.SpringApplication; 						//Import Spring Boot utility to launch the application
import org.springframework.boot.autoconfigure.SpringBootApplication;	//Enable auto-configuration, component scan, and configuration properties

@SpringBootApplication	//Mark this class as the main Spring Boot application entry point
public class Application 
{
	public static void main(String[] args) 								//Main method to run the application
	{
		SpringApplication.run(Application.class, args);	//Launch the Spring Boot application
	}
}