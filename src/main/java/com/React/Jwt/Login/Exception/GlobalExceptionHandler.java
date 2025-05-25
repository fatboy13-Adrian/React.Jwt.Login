package com.React.Jwt.Login.Exception;              //Package declaration
import org.springframework.http.HttpStatus;         //Import HTTP status codes from Spring
import org.springframework.http.ResponseEntity;     //Import class for building HTTP responses
import org.springframework.web.bind.annotation.*;   //Import annotations to define exception handling behavior

@RestControllerAdvice   //Marks the class as a centralized exception handler for all controllers
public class GlobalExceptionHandler 
{
    //Handles exceptions when the username already exists
    @ExceptionHandler(UsernameAlreadyExistsException.class)
    public ResponseEntity<String> handleUsernameExists(UsernameAlreadyExistsException e) 
    {
        //Returns HTTP 409 Conflict with the exception message
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    //Handles exceptions when the email already exists
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<String> handleEmailExists(EmailAlreadyExistsException e) 
    {
        //Returns HTTP 409 Conflict with the exception message
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    //Handles exceptions when the user is not found
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<String> handleUserNotFound(UserNotFoundException e) 
    {
        //Returns HTTP 404 Not Found with the exception message
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }

    //Handles any other unhandled exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleAllOtherErrors(Exception ex) 
    {
        //Returns HTTP 500 Internal Server Error with a custom message
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + ex.getMessage());
    }
}