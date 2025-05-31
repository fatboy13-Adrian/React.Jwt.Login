import React from "react";                                          //Import React library to enable JSX syntax
import {render, screen, fireEvent} from "@testing-library/react";   //Import testing utilities for rendering and simulating events
import '@testing-library/jest-dom';                                 //Import custom Jest matchers for DOM assertions
import UserTable from "../../components/UserTable";                 //Import the UserTable component to be tested

//Mock the UserActions component to isolate the UserTable component behavior
    jest.mock("../../components/UserActions", () =>
    //Return a functional component accepting props: user, currentUser, onUpdate, onDelete, disabled
    ({user, currentUser, onUpdate, onDelete, disabled}) => 
    {
        return (
        //Container div with test id unique per user
        <div data-testid={`user-actions-${user.userId}`}>
            {/*Update button calls onUpdate with the user object when clicked*/}
            {/*Disabled attribute controlled by `disabled` prop*/}
            <button onClick={() => onUpdate(user)} disabled={disabled}>Update</button>
            {/*Conditionally render Delete button if current user is admin and not deleting themselves*/}
            {currentUser.role === "ADMIN" && currentUser.userId !== user.userId && (
            //Delete button calls onDelete with userId when clicked, disabled by `disabled` prop
            <button onClick={() => onDelete(user.userId)} disabled={disabled}>Delete</button>
            )}
        </div>
        );
    }
    );

    //Test users data array with two objects representing users
    const users = [
    {
        userId: "1",                //Unique identifier for user
        firstName: "John",          //User's first name
        lastName: "Doe",            //User's last name
        username: "johndoe",        //Username for login/display
        email: "john@example.com",  //Email address
        phone: "12345678",          //Contact phone number
        address: "123 Main St",     //Physical address
        role: "USER",               //User role, e.g., USER or ADMIN
    },
    {
        userId: "2",    //Second user with mostly empty or null fields for testing
        firstName: " ", //Space to test trimming or empty handling
        lastName: null, //Null value field
        username: "",   //Empty string
        email: null,    //Null email
        phone: "",      //Empty phone
        address: null, //Null address
        role: "",       //Empty role
    }
    ];

    //Define an admin user for tests that require elevated privileges
    const adminUser = {userId: "admin123", role: "ADMIN"};
    
    //Define a normal user with a regular USER role
    const normalUser = {userId: "1", role: "USER"};

    //Jest mock function for handling updates in tests
    const mockUpdate = jest.fn();

    //Jest mock function for handling deletes in tests
    const mockDelete = jest.fn();

    //Test suite named "UserTable Component"
    describe("UserTable Component", () => 
    {
    //Before each test, clear the mock function call history to ensure clean state
    beforeEach(() => 
    {
        mockUpdate.mockClear();
        mockDelete.mockClear();
    });

    //Test case for rendering table with full user data
    test("renders table with complete user data", () => 
    {
        //Render UserTable with one user (complete data), normalUser as current user, mocks, and actions enabled
        render(
        <UserTable
            users={[users[0]]}          //Pass only the first user in array (John Doe)
            currentUser={normalUser}    //Set current user context
            onUpdate={mockUpdate}       //Pass update callback mock
            onDelete={mockDelete}       //Pass delete callback mock
            actionsDisabled={false}     //Buttons enabled
        />
        );

        //Assert each field for the user is rendered on the screen
        expect(screen.getByText("John")).toBeInTheDocument();               //Check firstName
        expect(screen.getByText("Doe")).toBeInTheDocument();                //Check lastName
        expect(screen.getByText("johndoe")).toBeInTheDocument();            //Check username
        expect(screen.getByText("john@example.com")).toBeInTheDocument();   //Check email
        expect(screen.getByText("12345678")).toBeInTheDocument();           //Check phone
        expect(screen.getByText("123 Main St")).toBeInTheDocument();        //Check address
        expect(screen.getByText("USER")).toBeInTheDocument();               //Check role
    });

    //Test case for rendering empty or null fields as "-"
    test("formats empty or null fields as '-'", () => 
    {
        //Render UserTable with both users, normal user context, mocks, and buttons enabled
        render(
        <UserTable
            users={users}               //Pass both users to test formatting
            currentUser={normalUser}    //Current user context
            onUpdate={mockUpdate}       //Update mock
            onDelete={mockDelete}       //Delete mock
            actionsDisabled={false}     //Buttons enabled
        />
        );

        //Get all displayed "-" representing empty/null fields for second user
        const dashes = screen.getAllByText("-");
        
        //Expect exactly 7 dashes for the 7 empty/null fields of second user
        expect(dashes.length).toBe(7);
    });

    //Test case to verify UserActions component renders for each user
    test("renders UserActions component for each user", () => 
    {
        //Render UserTable with both users, normal user context, mocks, buttons enabled
        render(
        <UserTable
            users={users}               //Both users
            currentUser={normalUser}    //Current user
            onUpdate={mockUpdate}       //Update mock
            onDelete={mockDelete}       //Delete mock
            actionsDisabled={false}     //Buttons enabled
        />
        );

        //Assert that UserActions components for user 1 and 2 exist with correct test IDs
        expect(screen.getByTestId("user-actions-1")).toBeInTheDocument();
        expect(screen.getByTestId("user-actions-2")).toBeInTheDocument();
    });

    //Test that clicking Update button calls onUpdate with the correct user
    test("calls onUpdate when Update button is clicked", () => 
    {
        //Render UserTable with only the first user, normal user, mocks, buttons enabled
        render(
        <UserTable
            users={[users[0]]}          //Single user
            currentUser={normalUser}    //Current user context
            onUpdate={mockUpdate}       //Update mock function
            onDelete={mockDelete}       //Delete mock function
            actionsDisabled={false}     //Buttons enabled
        />
        );

        //Simulate clicking the Update button
        fireEvent.click(screen.getByText("Update"));

        //Assert that mockUpdate was called with the first user object
        expect(mockUpdate).toHaveBeenCalledWith(users[0]);
    });

    //Test that clicking Delete calls onDelete for an admin deleting another user
    test("calls onDelete when admin deletes another user", () => 
    {
        //Render UserTable with one user, current user is admin, mocks, buttons enabled
        render(
        <UserTable
            users={[users[0]]}      //User to delete
            currentUser={adminUser} //Admin user context
            onUpdate={mockUpdate}   //Update mock
            onDelete={mockDelete}   //Delete mock
            actionsDisabled={false} //Buttons enabled
        />
        );

        //Simulate clicking the Delete button
        fireEvent.click(screen.getByText("Delete"));

        //Assert mockDelete was called with the userId of the user to be deleted
        expect(mockDelete).toHaveBeenCalledWith(users[0].userId);
    });

    //Test that Delete button does not show for admin viewing their own record
    test("does not show Delete button for admin deleting own record", () => 
    {
        //Render UserTable with admin user data, current user is admin, mocks, buttons enabled
        render(
        <UserTable
            users={[adminUser]}     //Admin's own user record
            currentUser={adminUser} //Admin current user context
            onUpdate={mockUpdate}   //Update mock
            onDelete={mockDelete}   //Delete mock
            actionsDisabled={false} //Buttons enabled
        />
        );

        //Assert that Delete button is NOT rendered for admin deleting self
        expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });

    //Test case to verify that action buttons are disabled when actionsDisabled is set to true
    test("buttons are disabled when actionsDisabled is true", () => 
    {
        render(
            <UserTable
                users={[users[0]]}          //Use only the first user from the users array
                currentUser={adminUser}     //Set current user as admin to enable delete button visibility
                onUpdate={mockUpdate}       //Pass mocked update function
                onDelete={mockDelete}       //Pass mocked delete function
                actionsDisabled={true}      //Disable action buttons
            />
        );

        //Check that the "Update" button is rendered and disabled
        expect(screen.getByText("Update")).toBeDisabled();

        //Check that the "Delete" button is rendered and disabled
        expect(screen.getByText("Delete")).toBeDisabled();
    });
});