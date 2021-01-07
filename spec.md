## Limn Language Specification

There are two canvases. one is your code itself and the other is an(infinite) color grid.

## Code canvas:

Execution of code starts at 0,0.

Pointer starts by moving to the right. The pointer will move forever in the same direction until it reaches another command.

Data is put on a single deque which can hold five items at a time.

Data and commands can be accessed again by moving the pointer over them.

The two main types are integers and a strings.

All commands take their input from the deque.

All commands use prefix notation.

Anything wrapped in quotes is a string. Standard JS escapes are allowed.

Any sequence of numeric digits is a number. Spaces are the delimiter between numbers(and ).

you can use the arrow symbols (`→←↑↓↖↗↘↙`) to set direction.

`⟳` is used to rotate the direction of the pointer clockwise by a number of degrees. With a single integer argument, it rotates 45 × n degrees, otherwise, rotates by 90 degrees.

`⊛` sets a random direction(1-8).

`⊡` is used to execute a string of direction commands on the Code Canvas. Effectively, executes a few arrow commands and fills the deque with the result.

`⮺` is used for copying. It takes a string and an integer argument.

* The string is an arrow pattern that shows where data should be copied to.
* The integer is the number of characters in front of the pointer to copy.

This is the main method for self-modification, and copying stored data.

`⋒` is a conditional. Continues in the current direction for a truthy value, otherwise turns 90&deg; clockwise.

`≈` casts from string to integer, and back.

`+-×÷` are their respective arithmetic operators.

I'm not sure If I want to add trig operators.

## Drawing Canvas:

In the drawing canvas, the pointer is not constantly moving. It functions similar to a LOGO/Turtle graphics marker.

**Drawing-only commands:**

These are commands which operate on the drawing canvas alone.

`🖉` prints a string or a line of length n, based on it's argument, in the current cursor direction.

`⦚` changes line colour and thickness, given a string and an integer. Thickness value also controls text size.

`■` fills a closed area with a specific color, if it is a valid hex string, transparency included(format: `#XXXXXXYY` where X is color and Y is opacity).

**Modified commands:**

`🞜` Is the prefix for all the commands in this section. Converts the next command to a drawing command.

`→←↑↓↖↗↘↙` Set direction in the drawing canvas.

`⟳` Takes a single integer n and rotates n degrees from the current direction. A more fine tuned way to manipulate angle.

`⊛` sets a random direction in the drawing canvas(1-360).

