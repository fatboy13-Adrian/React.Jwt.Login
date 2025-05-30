import React from 'react';                                          //Import React to use JSX syntax
import {render, screen, fireEvent} from '@testing-library/react';   //Import testing utilities
import '@testing-library/jest-dom';                                 //Import custom Jest matchers for DOM nodes
import Button from '../../components/Button';                       //Import the Button component to be tested

//Group related tests for the Button component
describe('Button Component', function() 
{
  //Test to check if Button renders with given children text
  test('renders with children text', function() 
  {
    render(<Button>Click Me</Button>);                          //Render Button with "Click Me" as children
    expect(screen.getByText('Click Me')).toBeInTheDocument();   //Assert text is in the document
  });

  //Test to verify onClick handler is called when button is clicked
  test('calls onClick when clicked', function() 
  {
    const handleClick = jest.fn();                              //Create a mock function for onClick
    render(<Button onClick={handleClick}>Click Me</Button>);    //Render Button with onClick handler
    fireEvent.click(screen.getByText('Click Me'));              //Simulate a click event on the button
    expect(handleClick).toHaveBeenCalledTimes(1);               //Assert the click handler was called once
  });

  //Test to verify onClick is NOT called when button is disabled
  test('does not call onClick when disabled', function() 
  {
    const handleClick = jest.fn();                                      //Create a mock function for onClick
    render(<Button onClick={handleClick} disabled>Disabled</Button>);   //Render disabled Button
    fireEvent.click(screen.getByText('Disabled'));                      //Simulate click event on disabled button
    expect(handleClick).not.toHaveBeenCalled();                         //Assert click handler was not called
  });

  //Test to check if custom className is added along with default classes
  test('applies custom className in addition to default classes', function() 
  {
    render(<Button className="my-custom-class">Styled</Button>);    //Render Button with custom class
    const button = screen.getByRole('button');                      //Get the button element by role
    expect(button).toHaveClass('custom-btn');                       //Check default class present
    expect(button).toHaveClass('small-btn');                        //Check default class present
    expect(button).toHaveClass('my-custom-class');                  //Check custom class present
  });

  //Test to confirm default button type is "button"
  test('has default type="button"', function() 
  {
    render(<Button>Default Type</Button>);              //Render Button without specifying type
    const button = screen.getByRole('button');          //Get the button element
    expect(button).toHaveAttribute('type', 'button');   //Verify default type attribute
  });

  //Test to confirm custom type attribute is accepted and applied
  test('accepts and applies a custom type', function() 
  {
    render(<Button type="submit">Submit</Button>);                          //Render Button with type "submit"
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');   //Verify type attribute
  });

  //Test to verify button is disabled when disabled prop is true
  test('is disabled when disabled prop is true', function() 
  {
    render(<Button disabled>Disabled</Button>);         //Render Button with disabled prop
    expect(screen.getByRole('button')).toBeDisabled();  //Assert button is disabled
  });
});