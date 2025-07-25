# User Management System (UMS)
## Overview
UMS is a **Role-Based Access Control (RBAC)** system with **JWT (JSON Web Tokens)** for authentication, designed as a plug-and-play module for web apps.

## Software Architecture
<img src = "screenshots/React - JWT - Login Architecture.jpg" alt = "React-JWT-Login" width = "800">

## ⚙️ Tech Stack
### Backend
Java, Spring Boot, Spring Security, JWT, JPA (Hibernate), H2 (dev), PostgreSQL (prod)

### Frontend
React, JavaScript, Axios, React Router, HTML/CSS

## ✨ Features
- 🔐 **Role-Based Access Control (RBAC):** Authenticate users based on predefined roles such as `USER` or `ADMIN`.
- 🔑 **Token-Based Authentication:** Secure communication using JWT tokens stored in frontend `localStorage`.
- 🛡️ **Strict Authorization:** Users can only view or modify their own data, while admins can manage all users.
- 🔄 **Real-time Sync:** Seamless interaction between React frontend and Spring Boot backend APIs.
- 🌐 **RESTful APIs:** Easy integration for frontend/backend communication.

## Installation Procedures
1. **Clone Repository**<br>
    git clone https://github.com/yourusername/React.Jwt.Login.git

2. **Navigate to Project Repository**<br>
    cd React.Jwt.Login

3. **Install Dependencies for React Frontend**<br>
    cd frontend<br>
    npm install axios<br>
    npm install react-router-dom<br>
    npm install --save-dev @testing-library/react-hooks<br>
    npm install --save-dev @testing-library/react-hooks --legacy-peer-deps<br>

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

## API Endpoints

| Method | Endpoint                          | Description                       |
|--------|-----------------------------------|-----------------------------------|
| POST   | /auth/login                       | Authenticate user and receive JWT |
| POST   | /users/RegisterNewUser            | Register a new user               |
| GET    | /users/ViewUserProfile/{userId}   | Retrieve current user’s profile   |
| GET    | /users/ViewUserProfiles           | Admin fetches all user profiles   |
| PATCH  | /users/UpdateUserProfile/{userId} | User updates own profile          |
| DELETE | /users/DeleteUserProfile/{userId} | Admin deletes a user profile      |

## Error Handling
### Common Error Codes

| Status Code | Description           | Common Causes                                      |
|-------------|-----------------------|----------------------------------------------------|
| 400         | Bad Request           | Invalid input, missing required fields             |
| 401         | Unauthorized          | Invalid or expired JWT token                       |
| 403         | Forbidden             | Insufficient permissions for the requested action  |
| 404         | Not Found             | Resource (user, achievement, etc.) does not exist  |
| 409         | Conflict              | Username or email already exists                   |
| 500         | Internal Server Error | Server-side error                                  |

### Running Tests

| Area     | Command  | 
|----------|----------|
| Backend  | mvn test | 
| Frontend | npm test | 

## Problems Faced During Development and their Solution

| Area               | Issues Faced                               | Solution                                                  |
|--------------------|--------------------------------------------|-----------------------------------------------------------|
| Backend            | JWT token validation                       | Created a custom filter to check JWT tokens.              |
| Backend            | CORS restrictions                          | Added a CorsConfiguration bean to allow frontend requests.|
| Backend            | Preventing data leaks between users        | Checked if logged-in user ID matches the requested ID.    |
| Frontend           | Managing token across pages                | Stored the token in localStorage.                         |
| Frontend           | Protecting routes from unauthorized access | Built routes that block access based on login or role.    |
| Frontend           | Dynamic userId handling                    | Compared the user ID in URL with the logged-in user ID.   |

## Results
    🔐 Authenticated routes reject invalid tokens
    👤 Users can view/update only their profiles
    🛡️ Admins have full access to user data
    🔄 Frontend auto-updates based on API state
    🚀 Responsive and modular design for easy extension

## Docker and CI/CD for Spring Boot & React with GitHub Actions
### Backend (Spring Boot) Dockerization
1. Open a terminal and navigate to your Spring Boot project directory (where pom.xml is located).
2. Run the following Maven command to clean and package the application: mvn clean package
3. After the command finishes, your .jar file will be created in the target/ directory (e.g., React.Jwt.Login-0.0.1-SNAPSHOT.jar).
4. In the root directory of your project (same directory as pom.xml), create a Dockerfile.
5. Add the following contents to your Dockerfile:
    # Use a base image with JDK for Spring Boot
    FROM openjdk:17-jdk-slim AS build

    # Set the working directory
    WORKDIR /app

    # Copy the JAR file from the target directory
    COPY target/*.jar app.jar

    # Expose the port on which your app will run
    EXPOSE 8080

    # Run the JAR file
    ENTRYPOINT ["java", "-jar", "app.jar"]

6. Create a .dockerignore file in the same directory as the Dockerfile.
7. Add the following to .dockerignore to avoid copying unnecessary files into the Docker image:
    target/
    .git/
    .idea/
    *.iml

8. In the terminal, run the following command to build your Docker image: docker build -t fatb0y13/react.jwt.login.backend:latest .
9. Log in to Docker Hub using your credentials: docker login
10. Push your Docker image to Docker Hub: docker push fatb0y13/react.jwt.login.backend:latest

### Frontend (React) Dockerization
1. Open a terminal and navigate to the frontend directory.
2. Run the following command to create the production build of your React app: npm run build
3. In the frontend directory, create a Dockerfile.
4. Add the following contents to your Dockerfile:
    # Stage 1: Build the React app
    FROM node:16 AS build

    WORKDIR /app
    COPY . .
    RUN npm install
    RUN npm run build

    # Stage 2: Serve the React app using Nginx
    FROM nginx:alpine
    COPY --from=build /app/build /usr/share/nginx/html

5. In the frontend directory, create a .dockerignore file.
6. Add the following to .dockerignore to avoid copying unnecessary files into the Docker image:
    node_modules/
    build/
    .git/

7. In the terminal, run the following command to build your Docker image: docker build -t fatb0y13/react.jwt.login.frontend:latest .
8. Push your Docker image to Docker Hub: docker push fatb0y13/react.jwt.login.frontend:latest

### Running the Docker Containers Locally
1. To run the backend Docker container, execute the following command: docker run -p 8080:8080 react.jwt.login.backend
2. Check the logs to ensure that the backend service has started successfully: Tomcat started on port(s): 8080 ...
3. To run the frontend Docker container, execute the following command: docker run -d -p 3000:3000 react.jwt.login.frontend
4. Open your browser and go to http://localhost:3000 to view the frontend.
5. Use Postman or Swagger UI to test your API endpoints.
6. Go to: http://localhost:8080/auth/login.

## Setting up GitHub Actions CI/CD Workflows
### Upate Secrets and Variables in GitHub
1. Go to your GitHub repository.
2. Click on Settings -> Secrets and Variables -> Actions.
3. Add the following secrets to securely store sensitive data: DOCKER_USERNAME, DOCKER_PASSWORD

### Backend CI/CD Workflow
1. Create a .github/workflows/backend-ci.yml file in your repository.
2. Add the following contents to backend-ci.yml to automate the Docker build and push process:
    name: Backend CI

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v2
        with:
          context: .
          push: true
          tags: fatb0y13/react.jwt.login.backend:latest

3. To trigger the workflow, Add a dummy file to your project to trigger the CI:
    echo "// force trigger" >> src/dummy.txt
    git add src/dummy.txt
    git commit -m "Trigger CI workflow"
    git push origin main

4. After the workflow completes, remove the dummy file and push again:
    git rm src/dummy.txt
    git commit -m "Remove dummy file"
    git push origin main

### Frontend CI/CD Workflow
1. Create a .github/workflows/frontend-ci.yml file in your repository.
2. Add the following contents to frontend-ci.yml to automate the Docker build and push process for the frontend:
    name: Frontend CI

    on:
    push:
        branches:
        - main
    pull_request:
        branches:
        - main

    jobs:
    build:
        runs-on: ubuntu-latest

        steps:
        - name: Checkout code
            uses: actions/checkout@v2

        - name: Set up Docker Buildx
            uses: docker/setup-buildx-action@v2

        - name: Log in to Docker Hub
            uses: docker/login-action@v2
            with:
            username: ${{ secrets.DOCKER_USERNAME }}
            password: ${{ secrets.DOCKER_PASSWORD }}

        - name: Build and push Docker image
            uses: docker/build-push-action@v2
            with:
            context: frontend
            push: true
            tags: fatb0y13/react.jwt.login.frontend:latest

3. Push your latest changes to GitHub: git push origin main

### Monitoring the CI/CD Workflow in GitHub Actions
1. Go to the Actions tab in your GitHub repository.
2. You will see the workflow runs under the Workflow Runs section.
3. Click on the workflow name (e.g., Backend CI or Frontend CI) to monitor the status, view logs, and troubleshoot if necessary.

## Purpose Summary for Service and Controller Classes
### Main Goal
Promote validation and logic reuse across controllers and services by separating concerns.

This is a good architectural decision, as it improves: <br>
    -   Maintainabilty.<br>
    -   Testability.<br>
    -   Reusability.<br>
    -   Clean separation of responsibilities.<br>

## Load Testing with K6
The project includes a load test script using K6 to evaulate the performance and correctness of a user authentication and management API.

### How to Install K6
1. Visit: https://dl.k6.io/msi/k6-latest-amd64.msi
2. The installer will download automatically.
3. Run the installer to complete the installation.

### What It Tests?
| Service           | Description                                                                                                        |
|-------------------|--------------------------------------------------------------------------------------------------------------------|
| User Login        | Logs in with admin credentials and retrieves an authentication token.                                              |
| User Registration | Registers a new user with a unique username, email, and phone number to avoid constraint violations.               |
| User Operations   | Retrieves the newly registered user's details, fetches all users, updates the user's profile, and deletes the user.|
| Current User Info | Retrieves the logged-in user's username and verifies if the user has the ADMIN role.                               |

### How to Run?
1. Start backend server: mvn spring-boot:run
2. Open to Windows PoweShell.
3. Navigate to your project directory: cd "C:\Path\To\Your_Project_Folder\React.Jwt.Login"
4. Run the test: k6 run loadtest.js

### Test Output
The script includes status checks for each API call. At the end of execution, k6 will display:
    -   Number of passed/failed checks
    -   HTTP durations (min/avg/max)
    -   Total data sent/received
    -   Error logs (e.g., registration failures)

### User Services

| Class                    | Responsibility                                                                                             |
|--------------------------|------------------------------------------------------------------------------------------------------------|
| UserService              | Business logic to handle user account management.                                                          |
| UserAuthService          | Utility methods for logged - in user context, role verification,user lookup with exception handling.       |
| UserAuthorizationService | Authorization checks, isolated from business logic using dependency injection and @RequiredArgsConstructor.|
| AuthService              | Authentication purposes                                                                                    |

### User Controllers
| Class                    | Responsibility                                                       |
|--------------------------|----------------------------------------------------------------------|
| UserController           | Handles CRUD operations on user accounts via UserService.            |
| UserAuthController       | Exposes endpoints to get info about the currently authenticated user.|
| AuthController           | Handles login, token refresh, and password recovery.                 |

### Notes
1. UserAuthService and UserAuthorizationService follow Single Responsibility Principle.
2. Use of @RequiredConstructor improves clean constructor - based dependency injection.
3. AuthService remained focus on authentication, not overloaded with authorization or user profile logic.
4. Logical grouping of endpoints help React frontend integration (AuthService.java). reamined modular and clear.
5. Avoids controller bloat by spilting authentication from CRUD operations.
6. Encourages reusability of UserAuthService.java within AuthController.java and UserAuthController.java.

### Design Advantages
| Benefits                        | Responsibility                                                   |
|---------------------------------|------------------------------------------------------------------|
| Separation of concerns          | Easy testing and debugging of individual components.             |
| Validation Reusability          | Centralized logic in services like UserAuthService.              |
| Role-Based Security Enforcement | Clear location for access rules (UserAuthorizationService).      |
| Frontend Integration            | AuthController is isolated and tailored for frontend token flow. |