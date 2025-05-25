package com.React.Jwt.Login.Security.Config;                                                                //Declares the package for security configuration
import java.util.Arrays;                                                                                    //Utility class used for array operations
import org.springframework.context.annotation.Bean;                                                         //Enables creation of Spring beans
import org.springframework.context.annotation.Configuration;                                                //Marks the class as a Spring configuration class
import org.springframework.http.HttpMethod;                                                                 //Enum for HTTP methods
import org.springframework.security.authentication.AuthenticationManager;                                   //Main interface for authentication processing
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder; //Helps build a custom AuthenticationManager
import org.springframework.security.config.annotation.web.builders.HttpSecurity;                            //Used to configure web security rules
import org.springframework.security.core.userdetails.User;                                                  //Utility to build user details
import org.springframework.security.core.userdetails.UserDetailsService;                                    //Interface to fetch user details from the DB
import org.springframework.security.core.userdetails.UsernameNotFoundException;                             //Exception thrown if username is not found
import org.springframework.security.crypto.factory.PasswordEncoderFactories;                                //Factory to create password encoders
import org.springframework.security.crypto.password.PasswordEncoder;                                        //Interface for password encoding
import org.springframework.security.web.SecurityFilterChain;                                                //Defines the security filter chain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;                //Filter for username/password authentication
import org.springframework.web.cors.CorsConfiguration;                                                      //Represents CORS configuration
import org.springframework.web.cors.CorsConfigurationSource;                                                //Source for CORS configuration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;                                        //URL-based CORS config source
import com.React.Jwt.Login.Repository.UserRepository;                                                       //JPA repository interface for user data
import com.React.Jwt.Login.Security.JWT.JwtAuthenticationFilter;                                            //Custom JWT authentication filter

@Configuration  //Indicates this class provides Spring Security configuration
public class SecurityConfig 
{
    private final UserRepository userRepository;                    //Dependency to access user data
    private final JwtAuthenticationFilter jwtAuthenticationFilter;  //Custom filter for handling JWTs

    //Constructor injection for dependencies
    public SecurityConfig(UserRepository userRepository, JwtAuthenticationFilter jwtAuthenticationFilter) 
    {
        this.userRepository = userRepository;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean   //Declares PasswordEncoder bean
    public PasswordEncoder passwordEncoder() 
    {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();  //Returns a default delegating password encoder
    }

    @Bean   //Declares UserDetailsService bean
    public UserDetailsService userDetailsService() 
    {
        //Returns lambda: retrieves user from DB and maps it to Spring Security's User object
        return username -> userRepository.findByUsername(username).map(user -> User.builder().username(user.getUsername())
        .password(user.getPassword()).roles(user.getRole().name()).build()).orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    @Bean   //Declares AuthenticationManager bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception 
    {
        //Get AuthenticationManagerBuilder, set custom PasswordEncoder, build and return AuthenticationManager
        return http.getSharedObject(AuthenticationManagerBuilder.class).userDetailsService(userDetailsService()) //Set custom UserDetailsService
        .passwordEncoder(passwordEncoder()).and().build();
    }

    @Bean   //Declares SecurityFilterChain bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception 
    {
        http
            .cors()                                                                                             //Enables CORS configuration
            .and()
            .csrf().disable()                                                                                   //Disables CSRF (suitable for APIs)
            .authorizeHttpRequests()                                                                            //Begin URL authorization rules
                .requestMatchers("/h2-console/**").permitAll()                                      //Allow H2 console access
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()                             //Allow all OPTIONS preflight requests
                .requestMatchers("/auth/protected", "/users/me")                                    //Secure these endpoints
                    .hasAnyRole("CUSTOMER", "ADMIN", "WAREHOUSE_SUPERVISOR", "SALES_CLERK")             //Require any of these roles
                .anyRequest().permitAll()                                                                       //Allow all other requests as open access
            .and()
            .headers().frameOptions().disable()                                                                 //Disable frameOptions (required for H2 console)
            .and()
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);  //Insert JWT filter before default auth filter

        return http.build();                                                                                    //Return built SecurityFilterChain
    }

    @Bean   //Declares CORS configuration source
    public CorsConfigurationSource corsConfigurationSource() 
    {
        CorsConfiguration configuration = new CorsConfiguration();                                              //Create new CORS config
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));                            //Allow this origin
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")); //Allow these HTTP methods
        configuration.setAllowedHeaders(Arrays.asList("*"));                                                //Allow all headers
        configuration.setAllowCredentials(true);                                                //Allow sending credentials (e.g. cookies)
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();                         //URL-mapped CORS source
        source.registerCorsConfiguration("/**", configuration);                                         //Apply CORS config to all paths
        return source;                                                                                          //Return the configuration source
    }
}