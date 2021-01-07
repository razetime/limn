## Limn Language Specification

There are two canvases. one is your code itself and the other is an(infinite) color grid.

## Code canvas:

Execution of code starts at 0,0.

Pointer starts by moving to the right.

data is put on a deque which can hold five items at a time.

you can use the arrow symbols (`→←↑↓↖↗↘↙`) to set direction.

Data and commands can be accessed again by moving the pointer over them.

The two main types are integers and a strings.

All commands take their input as a prefix.

The "reset pointer" instruction which will move the pointer back to the beginning($(0,0)$ by default). Made for simple loops.

Anything wrapped in quotes is a string. Standard JS escapes are allowed.

Any sequence of numeric digits is a number. Spaces are the delimiter between numbers(and ).

`⊡` is used to delimit movement commands for blocks and accessing things.(sorta like strings).

`⮺` can be used to warp. Direction determines which direction the second warp should be at, and number tells us which warp in that direction to go to.

`≈` casts from string to integer, and back.

`🖉` prints a string or a line, based on it's argument.

`ஃ` 