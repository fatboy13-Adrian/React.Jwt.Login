# User Management System (UMS)
## Overview
UMS is a secure **Role-Based Access Control (RBAC)** system that uses **JWT (JSON Web Tokens)** for user authentication and authorization. It is designed as a plug-and-play module that can be integrated into any web-based application requiring user identity and access management.

## ✨ Features
- 🔐 **Role-Based Access Control (RBAC):** Authenticate users based on predefined roles such as `USER` or `ADMIN`.
- 🔑 **Token-Based Authentication:** Secure communication using JWT tokens stored in frontend `localStorage`.
- 🛡️ **Strict Authorization:** Users can only view or modify their own data, while admins can manage all users.
- 🔄 **Real-time Sync:** Seamless interaction between React frontend and Spring Boot backend APIs.
- 🌐 **RESTful APIs:** Easy integration for frontend/backend communication.

## ⚙️ Tech Stack
### Backend
- Java Spring Boot
- Spring Security
- JSON Web Token (JWT)
- Hibernate / Java Persistence API (JPA)
- H2 Database (for testing/development)

### Frontend
- React
- JavaScript
- HTML & CSS
- Axios
- React Router DOM

## Installation Procedures
1. **Clone Repository**<br>
    git clone https://github.com/yourusername/React.Jwt.Login.git

2. **Navigate to Project Repository**<br>
    cd React.Jwt.Login

3. **Install Dependencies for React Frontend**<br>
    cd frontend<br>
    npm install axios<br>
    npm install react-router-dom<br>

## Startup Procedures
1. **Startup Backend**<br>
    -   cd React.Jwt.Login<br>
    -   mvn clean install<br>
    -   mvn spring-boot:run<br>

2. **Startup Frontend (Wait for 3 to 5 seconds after starting up the Backend)**<br>
    -   open a new terminal in VSCode<br>
    -   cd frontend<br>
    -   npm start<br>

## 🔐 Authentication Flow
    -   Login via /auth/login
    -   Backend validates credentials
    -   JWT token is issued and returned
    -   Frontend stores token + role + userId in localStorage
    -   Axios sends token in headers for all future requests

## Problems Faced During Development
1. **Backend**<br>
    -   Token validation and secure endpoint access
    -   CORS restrictions in web browser
    -   Data leakage across users

2. **Frontend**<br>
    -   Handling authentication tokens between pages
    -   Unauthorized route access
    -   Passing dynamic userId

## Actions Taken
### Backend
    -   Custom JWT filter annotations.
    -   Configured CorsFilter to allow React frontend.
    -   Enforced strict ownership rules in controller layer.

### Frontend
    -   Used localStorage and Axios interceptors.
    -   Conditional rendering + role-based route protection.
    -   Stored userId in localStorage post-login

## Results
    🔐 Authenticated routes reject invalid tokens
    👤 Users can view/update only their profiles
    🛡️ Admins have full access to user data
    🔄 Frontend auto-updates based on API state
    🚀 Responsive and modular design for easy extension

## Sample API Endpoints
    -   POST /auth/login: login with user credentials
    -   POST /users/RegisterNewUser: register a new user
    -   GET /users/ViewUserProfile/{userId}" view your own user profile
    -   GET /users/ViewUserProfiles: view all user profiles
    -   PATCH /users/UpdateUserProfile/{userId}: update your own user profile
    -   DELETE /users/DeleteUserProfile/{userId}: Admin to delete user profile