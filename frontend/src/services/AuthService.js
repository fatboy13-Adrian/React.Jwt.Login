import axios from "axios";                    //Import axios for making HTTP requests

const API_URL = "http://localhost:8080/auth"; //Base URL for the authentication API

//Default export function for logging in a user
export const loginUser = async (username, password) => 
{
  try 
  {
    //Making a POST request to the login endpoint with the username and password
    const response = await axios.post(`${API_URL}/login`, { username, password });
    
    //Returning the response data if the request is successful
    return response.data;
  } 
  
  catch(err) 
  {
    //Check if the error has a message from the response, and throw it as an error
    if(err.response?.data?.message) 
      throw new Error(err.response.data.message);                           //Return the message from the server if available
    
    //If no specific message, throw a generic error with the message from the caught error
    throw new Error(err.message || "Failed to login. Please try again.");   //Provide a fallback error message
  }
};