import React, {useState} from "react";                              //Import React and useState hook for state management in tests
import {render, screen, fireEvent} from "@testing-library/react";   //Import testing utilities
import "@testing-library/jest-dom";                                 //Import jest-dom for extended DOM matchers
import SelectRole from "../../components/SelectRole";               //Import the SelectRole component (adjust path as needed)

describe("SelectRole Component", () => 
{
  //Define default props to use in multiple tests
  const defaultProps = 
  {
    id: "role-select",      //id for the select element
    name: "role",           //name attribute for the select element
    role: "",               //selected role value (empty by default)
    onChange: jest.fn(),    //mock function to track onChange events
    disabled: false,        //whether select is disabled or not
    className: "",          //additional CSS classes (empty by default)
  };

    //Clear mock function calls after each test to prevent interference
    afterEach(() => 
    {
        jest.clearAllMocks();
    });

    test("renders the select with the correct label linked by htmlFor", () => 
    {
        render(<SelectRole {...defaultProps} />);               //Render component with default props
        const label = screen.getByText("Role");                 //Find the label element by its text
        expect(label).toBeInTheDocument();                      //Assert the label is rendered
        expect(label).toHaveAttribute("for", defaultProps.id);  //Assert label's 'for' matches select's id
        const select = screen.getByLabelText(/role/i);          //Get select element by accessible label "Role"
        expect(select).toBeInTheDocument();                     //Assert the select is rendered
        expect(select.tagName).toBe("SELECT");                  //Assert the element is a <select>
        expect(select.id).toBe(defaultProps.id);                //Assert the select's id matches prop
    });

    test("renders the select element with correct props and default classes", () => 
    {
        render(<SelectRole {...defaultProps} />);                   //Render component with default props
        const select = screen.getByRole("combobox");                //Get the select element by role 'combobox'
        expect(select).toHaveAttribute("id", defaultProps.id);      //Assert id attribute is correct
        expect(select).toHaveAttribute("name", defaultProps.name);  //Assert name attribute is correct
        expect(select).toHaveValue("");                             //Assert default selected value is empty string
        expect(select).not.toBeDisabled();                          //Assert select is enabled by default
        expect(select).toHaveClass("form-select");                  //Assert default CSS class is applied
    });

    test("renders all role options plus the default disabled option", () => 
    {
        render(<SelectRole {...defaultProps} />);                                       //Render component with default props
        const placeholderOption = screen.getByRole("option", {name: /select role/i});   //Get placeholder option
        expect(placeholderOption).toBeDisabled();                                       //Assert placeholder option is disabled

        //Assert all role options are present
        expect(screen.getByRole("option", {name: "Admin"})).toBeInTheDocument();
        expect(screen.getByRole("option", {name: "Customer"})).toBeInTheDocument();
        expect(screen.getByRole("option", {name: "User"})).toBeInTheDocument();
    });

    test("selects the correct role value passed via props", () => 
    {
        render(<SelectRole {...defaultProps} role="CUSTOMER" />);   //Render component with 'CUSTOMER' selected
        const select = screen.getByRole("combobox");                //Get the select element
        expect(select).toHaveValue("CUSTOMER");                     //Assert selected value matches prop
    });

    test("calls onChange handler when option is changed and updates value (controlled component)", () => 
    {
        //Wrapper component to simulate stateful control of 'role' prop
        function Wrapper() 
        {
            const [role, setRole] = useState("");           //Initialize role state as empty string
            return (
                <SelectRole
                id="role-select"                            //Pass fixed id prop
                name="role"                                 //Pass fixed name prop
                role={role}                                 //Pass controlled role value from state
                onChange={(e) => setRole(e.target.value)}   //Update role state on change
                />
            );
        }

    render(<Wrapper />);                                    //Render the wrapper component
    const select = screen.getByRole("combobox");            //Get the select element

    fireEvent.change(select, {target: {value: "USER"}});    //Simulate changing selection to 'USER'

    expect(select).toHaveValue("USER");                     //Assert the select's value updated correctly
  });

    test("disables the select element when disabled prop is true", () => 
    {
        render(<SelectRole {...defaultProps} disabled={true} />);   //Render with disabled set to true
        const select = screen.getByRole("combobox");                //Get the select element
        expect(select).toBeDisabled();                              //Assert the select is disabled
    });

    test("applies additional className passed via props", () => 
    {
        render(<SelectRole {...defaultProps} className="extra-class" />);   //Render with extra className
        const select = screen.getByRole("combobox");                        //Get the select element
        expect(select).toHaveClass("form-select");                          //Assert default class present
        expect(select).toHaveClass("extra-class");                          //Assert additional class present
    });

    test("renders with defaultProps when disabled and className are not provided", () => 
    {
        //Render without disabled or className props to check defaults
        const { container } = render(
        <SelectRole
            id="test-id"            //Custom id prop
            name="test-name"        //Custom name prop
            role=""                 //Empty role prop
            onChange={() => {}}     //Dummy onChange handler
        />
        );
    const select = container.querySelector("select");   //Select the <select> element directly from container
    expect(select).not.toBeDisabled();                  //Assert select is enabled by default
    expect(select).toHaveClass("form-select");          //Assert default class is applied
  });
});