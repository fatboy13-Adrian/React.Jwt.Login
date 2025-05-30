import React from "react";                                          //Import React library for JSX support
import {render, screen, fireEvent} from "@testing-library/react";   //Import testing utilities from React Testing Library
import TextField from "../../components/TextField";                 //Import the TextField component to test (adjust path as needed)
import '@testing-library/jest-dom';                                 //Import jest-dom for extended DOM matchers like toBeInTheDocument()

//Group all tests related to the TextField component
describe("TextField Component", () => 
{
    //Define default props to pass into TextField for tests
    const defaultProps = 
    {
        id: "test-input",       //ID for input element, used for linking label
        label: "Test Label",    //Label text for input
        name: "testName",       //Name attribute for input
        value: "",              //Initial value of input
        onChange: jest.fn(),    //Mock function to track onChange calls
    };

    //Runs after each test to clear mock call history
    afterEach(() => 
    {
        jest.clearAllMocks();   //Reset all mocks to prevent test pollution
    });

    //Test: Label renders with correct attributes and is linked to input by ID
    test("renders label with correct htmlFor and class, linked to input by id", () => 
    {
        render(<TextField {...defaultProps} />);                    //Render TextField with default props
        const label = screen.getByText(defaultProps.label);         //Get label element by its text
        expect(label).toBeInTheDocument();                          //Assert label is rendered in the document
        expect(label).toHaveAttribute("for", defaultProps.id);      //Label's for attribute matches input ID
        expect(label).toHaveClass("form-label");                    //Label has CSS class "form-label"
        const input = screen.getByLabelText(defaultProps.label);    //Get input element linked to label
        expect(input).toBeInTheDocument();                          //Assert input is rendered
        expect(input.id).toBe(defaultProps.id);                     //Input's id matches defaultProps.id
    });

    //Test: Input defaults to type "text" if no type prop given
    test("renders input with default type='text' when no type prop is provided", () => 
    {
        render(<TextField {...defaultProps} />);                    //Render without type prop
        const input = screen.getByLabelText(defaultProps.label);    //Get input by label
        expect(input).toHaveAttribute("type", "text");              //Input type should be "text"
    });

    //Test: Input type changes if custom type prop provided
    test("renders input with custom type when provided", () => 
    {
        render(<TextField {...defaultProps} type="email" />);       //Render with type="email"
        const input = screen.getByLabelText(defaultProps.label);    //Get input element
        expect(input).toHaveAttribute("type", "email");             //Check input type is "email"
    });

    //Test: Input has correct name and value attributes
    test("input has correct name and value attributes", () => 
    {
        render(<TextField {...defaultProps} value="test value" />); //Render with value set
        const input = screen.getByLabelText(defaultProps.label);    //Get input element
        expect(input).toHaveAttribute("name", defaultProps.name);   //Name attribute matches prop
        expect(input).toHaveValue("test value");                    //Value attribute matches prop value
    });

    //Test: onChange handler called when input value changes
    test("calls onChange handler when input value changes", () => 
    {
        const handleChange = jest.fn();                                             //Create a mock function for onChange
        render(<TextField {...defaultProps} onChange={handleChange} value="" />);   //Render with mock onChange
        const input = screen.getByLabelText(defaultProps.label);                    //Get input element
        fireEvent.change(input, {target: {value: "new value"}});                    //Simulate changing input value
        expect(handleChange).toHaveBeenCalledTimes(1);                              //Expect onChange to have been called once
    });

    //Test: Input respects disabled prop and is disabled when true
    test("input respects disabled prop", () => 
    {
        render(<TextField {...defaultProps} disabled={true} />);    //Render with disabled prop set to true
        const input = screen.getByLabelText(defaultProps.label);    //Get input element
        expect(input).toBeDisabled();                               //Assert input is disabled
    });

    //Test: Input respects required prop and is required when true
    test("input respects required prop", () => 
    {
        render(<TextField {...defaultProps} required={true} />);    //Render with required prop true
        const input = screen.getByLabelText(defaultProps.label);    //Get input element
        expect(input).toBeRequired();                               //Assert input is required
    });

    //Test: Input uses autoComplete attribute if provided
    test("input uses autoComplete attribute when provided", () => 
    {
        render(<TextField {...defaultProps} autoComplete="email" />);   //Render with autoComplete prop
        const input = screen.getByLabelText(defaultProps.label);        //Get input element
        expect(input).toHaveAttribute("autoComplete", "email");         //Assert autoComplete attribute set
    });

    //Test: Input has default class and appends extra className if provided
    test("input has default class 'form-input' and includes additional className if provided", () => 
    {
        render(<TextField {...defaultProps} className="extra-class" />);    //Render with extra className
        const input = screen.getByLabelText(defaultProps.label);            //Get input element
        expect(input.className).toMatch(/form-input/);                      //Default class 'form-input' is present
        expect(input.className).toMatch(/extra-class/);                     //Extra class 'extra-class' is present
    });

    //Test: Input has only default class if className prop is an empty string
    test("input has only default class 'form-input' if className prop is empty string", () => 
    {
        render(<TextField {...defaultProps} className="" />);       //Render with empty className
        const input = screen.getByLabelText(defaultProps.label);    //Get input element
        expect(input.className).toBe("form-input");                 //ClassName is exactly 'form-input'
    });

    //Test: Wrapper div contains class 'form-row'
    test("wrapper div has class 'form-row'", () => 
    {
        const {container} = render(<TextField {...defaultProps} />);    //Render component and get container DOM node
        const wrapperDiv = container.querySelector("div.form-row");     //Select wrapper div by class name
        expect(wrapperDiv).toBeInTheDocument();                         //Assert wrapper div exists in the document
    });
});