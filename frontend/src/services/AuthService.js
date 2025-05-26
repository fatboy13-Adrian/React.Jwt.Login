import axios from 'axios';                      //Import the axios library to make HTTP requests

const API_URL = 'http://localhost:8080/auth';   //Define the base URL for the authentication API

//Function to log in a user with given username and password
export const loginUser = async (username, password) => 
{
  try 
  {
    const response = await axios.post(`${API_URL}/login`, {username, password});  //Send a POST request to the /login endpoint with the credentials    
    return response.data;                                                           //Return the response data (e.g., token, user info)
  } 
  
  catch(err) 
  {
    console.error(err);                                                                     //Log the error to the console for debugging
    throw new Error('Failed to login. Please check your credentials or try again later.');  //Throw a user-friendly error message
  }
};