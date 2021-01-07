## Limn Language Specification

There are two canvases. one is your code itself and the other is an(infinite) color grid.

## Code canvas:

Execution of code starts at 0,0.

Pointer starts by moving to the right.

Data is put on a single deque which can hold five items at a time.

Data and commands can be accessed again by moving the pointer over them.

The two main types are integers and a strings.

All commands take their input from the deque.

All commands use prefix notation.

Anything wrapped in quotes is a string. Standard JS escapes are allowed.

Any sequence of numeric digits is a number. Spaces are the delimiter between numbers(and ).

you can use the arrow symbols (`→←↑↓↖↗↘↙`) to set direction.

`⟳` is used to rotate the direction of the pointer clockwise by a number of degrees. With a single integer argument, it rotates n degrees, otherwise, rotates by 90 degrees.

`⊛` sets a random direction.

`⊡` is used to execute a string of movement commands for accessing data. Effectively, executes a few arrow commands and fills the deque with the result.

`⮺` is used for copying. It takes a string and an integer argument.

* The string is an arrow pattern that shows where data should be copied to.
* The integer is the number of characters in front of the pointer to copy.

This is the main method for self-modification, and copying stored data.

`≈` casts from string to integer, and back.

`+-×÷` are their respective arithmetic operators.

## Drawing Canvas:

**Drawing-only commands:**

These are commands which operate on the drawing canvas alone.

`🖉` prints a string or a line of length n, based on it's argument.

`⦚` changes line colour and thickness, given a string and an integer.

`■` fills a closed area with a specific color, if it is a valid hex string, transparency included.

`🞜` converts the next command to a drawing command. This may change the number of arguments it takes.
