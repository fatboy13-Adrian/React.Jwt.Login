import React from "react";                                                  //Import React for JSX rendering in the test
import {render, screen, fireEvent, cleanup} from "@testing-library/react";  //Import necessary testing utilities from React Testing Library
import '@testing-library/jest-dom';                                         //Import custom matchers like toBeInTheDocument, toBeEnabled, etc.
import UserActions from "../../components/UserActions";                     //Import the component under test

//Describe block for grouping all tests related to the UserActions component
describe("UserActions Component", () => 
{
    //Mock user data to simulate different users in test cases
    const user = {userId: "user123", name: "Test User", role: "USER"};
    const adminUser = {userId: "admin456", name: "Admin User", role: "ADMIN"};
    const anotherUser = {userId: "other789", name: "Another User", role: "USER"};

    //Create mock functions for onUpdate and onDelete
    const onUpdateMock = jest.fn();
    const onDeleteMock = jest.fn();

    //Cleanup and reset mocks after each test case to avoid test pollution
    afterEach(() => 
    {
        jest.clearAllMocks();   //Reset mock function call counts
        cleanup();              //Unmounts rendered components and cleans up the DOM
    });

    //Test case: Logged-in user editing their own profile sees enabled Update button only
    test("renders enabled Update button for logged-in user updating their own profile", () => 
    {
        render(
        <UserActions
            user={user}             //Target user is the logged-in user
            currentUser={user}
            onUpdate={onUpdateMock}
            onDelete={onDeleteMock}
            disabled={false}
        />
        );

        //Check that Update button is present and enabled
        const updateBtn = screen.getByText("Update");
        expect(updateBtn).toBeInTheDocument();
        expect(updateBtn).toBeEnabled();

        //Delete button should not be present for regular users
        const deleteBtn = screen.queryByText("Delete");
        expect(deleteBtn).not.toBeInTheDocument();
    });

    //Test case: Admin editing another user's profile sees enabled Update and Delete buttons
    test("renders enabled Update and Delete buttons for admin updating another user's profile", () => 
    {
        render(
        <UserActions
            user={anotherUser}
            currentUser={adminUser}
            onUpdate={onUpdateMock}
            onDelete={onDeleteMock}
            disabled={false}
        />
        );

        //Both buttons should be present and enabled
        const updateBtn = screen.getByText("Update");
        const deleteBtn = screen.getByText("Delete");
        expect(updateBtn).toBeEnabled();
        expect(deleteBtn).toBeEnabled();
    });

    //Test case: Disable all actions when `disabled` prop is true
    test("disables Update button if disabled prop is true", () => 
    {
        render(
        <UserActions
            user={user}
            currentUser={user}
            onUpdate={onUpdateMock}
            onDelete={onDeleteMock}
            disabled={true}
        />
        );

        //Update button should be disabled
        expect(screen.getByText("Update")).toBeDisabled();

        //Delete button should not appear for non-admins
        expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });

    //Test case: A non-admin trying to edit another user's profile cannot update or delete
    test("disables Update button for non-admin user updating another user's profile", () => 
    {
        render(
        <UserActions
            user={anotherUser}
            currentUser={user}      //user is logged-in, anotherUser is being edited
            onUpdate={onUpdateMock}
            onDelete={onDeleteMock}
            disabled={false}
        />
        );

        //Update should be disabled and delete should not appear
        expect(screen.getByText("Update")).toBeDisabled();
        expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });

    //Test case: Admin can see delete button for other users
    test("shows Delete button for admin viewing another user's profile", () => 
    {
        render(
        <UserActions
            user={user}
            currentUser={adminUser}
            onUpdate={onUpdateMock}
            onDelete={onDeleteMock}
            disabled={false}
        />
        );

        //Delete button should be visible and enabled
        const deleteBtn = screen.getByText("Delete");
        expect(deleteBtn).toBeInTheDocument();
        expect(deleteBtn).toBeEnabled();
    });

    //Test case: Admin should not see a Delete button on their own profile
    test("does not show Delete button for admin viewing their own profile", () => 
    {
        render(
        <UserActions
            user={adminUser}
            currentUser={adminUser}
            onUpdate={onUpdateMock}
            onDelete={onDeleteMock}
            disabled={false}
        />
        );

        //No delete button should be shown for self
        expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });

    //Test case: Clicking Update triggers onUpdate callback with correct data
    test("calls onUpdate with user object on Update button click", () => 
    {
        render(
        <UserActions
            user={user}
            currentUser={user}
            onUpdate={onUpdateMock}
            onDelete={onDeleteMock}
            disabled={false}
        />
        );

        fireEvent.click(screen.getByText("Update"));        //Simulate click
        expect(onUpdateMock).toHaveBeenCalledTimes(1);
        expect(onUpdateMock).toHaveBeenCalledWith(user);    //Check correct argument
    });

    //Test case: Clicking Delete triggers onDelete callback with correct userId
    test("calls onDelete with userId on Delete button click", () => 
    {
        render(
        <UserActions
            user={user}
            currentUser={adminUser}
            onUpdate={onUpdateMock}
            onDelete={onDeleteMock}
            disabled={false}
        />
        );

        fireEvent.click(screen.getByText("Delete"));            //Simulate click
        expect(onDeleteMock).toHaveBeenCalledTimes(1);
        expect(onDeleteMock).toHaveBeenCalledWith(user.userId); //Check correct ID passed
    });

    //Test case: Delete button should be disabled if `disabled` prop is true
    test("disables Delete button if disabled prop is true", () => 
    {
        render(
        <UserActions
            user={user}
            currentUser={adminUser}
            onUpdate={onUpdateMock}
            onDelete={onDeleteMock}
            disabled={true}
        />
        );

        //Delete button should be disabled
        const deleteBtn = screen.getByText("Delete");
        expect(deleteBtn).toBeDisabled();
    });
});