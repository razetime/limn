## Limn Language Specification

There are two canvases. one is your code itself and the other is a color grid.

The code canvas extends forever in all directions.

The color canvas extends forever in all directions, but the final result will fit the size of the drawing.

## Code canvas:

Execution of code starts at 0,0.

The cursor starts by moving to the right. The cursor will move forever in the same direction until it reaches another command.

Data is put on a single fixed-size stack which can hold five items at a time. Items are discarded from the bottom when the stack gets full.

Data and commands can be accessed again by moving the cursor over them.

The two main types are integers and a strings.

All commands take their input from the stack.

All commands use prefix notation.

Anything wrapped in quotes is a string. Standard JS escapes are allowed.

Any sequence of numeric digits is a number. Spaces are the delimiter between numbers(and ).

you can use the arrow symbols (`→←↑↓↖↗↘↙`) to set direction.

` `(space) is a NOP, meaning it does nothing.

`⟳` is used to rotate the direction of the cursor clockwise by a number of degrees. With a single integer argument, it rotates 45 × n degrees, otherwise, rotates by 90 degrees.

`⊛` sets a random direction(1-8).

`⊡` is used to retrieve data. It takes an arrow string and retrieves the data traced by its path. The program cursor is not moved. All commands are ignored, and only strings/integers are parsed.

`⮺` is used for copying. It takes two integer arguments m and n, and copies an area of m x n
 characters to stack as a list of strings. (needs more changes and clarification)

`🖉` is the main method for self-modification. It takes a string or integer, and prints it in the direction(s) specified by an arrow string. This moves the program cursor.
Eg: "3→4↑" prints 3 characters to the right and 4 characters upward.

`⋒` is a conditional. Continues in the current direction for a truthy value, otherwise turns 90&deg; clockwise.

`꩜` is a warp. If the next command is an arrow, teleports to another warp in the same direction. If the next command is NOP(space), then teleports to the nearest warp, in terms of manhattan distance. If there are no other warps, moves to (0,0).

`≈` casts from string to integer, and back.

`+-×÷` are their respective arithmetic operators.

`¿` prints the current state of the code canvas and the current state of the stack to the console/debug area.

`⊗` will end the program. You can also use an error to end the program, sorta like a conditional.

I'm not sure If I want to add trig operators, but it would make sense to.

## Drawing Canvas:

In the drawing canvas, the cursor is not constantly moving. It functions similar to a LOGO/Turtle graphics marker.

The default color is #000000ff.
The default stroke width is 1px. 

**Drawing-only commands:**

These are commands which operate on the drawing canvas alone.

`⌒` draws an arc from the current point, given distance and radius.

`⦚` changes line colour and thickness, given a string and an integer. Thickness value also controls text size.

`■` fills a closed area with a specific color, if it is a valid hex string, transparency included(format: `#XXXXXXYY` where X is color and Y is opacity).

**Modified commands:**

`🖉` prints a string or a line of length n, based on it's argument, in the current cursor direction.

`🞜` Is the prefix for all the commands in this section. Converts the next command to a drawing command.

`→←↑↓↖↗↘↙` Set direction in the drawing canvas.

`⟳` Takes a single number n and rotates n degrees from the current direction. A more fine tuned way to manipulate angle.

`⊛` sets a random direction in the drawing canvas(1-360).

`⮺` copies a region given width and height and pushes an Image Object to the stack.

