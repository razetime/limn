Limn is a 2D, self modifying esoteric language. This means that you can control how your program is read and executed during runtime.

# The Grid

Your whole program is stored on a grid, like so:

```
Hello
world!
I'm here!
```
is seen as
```
┌─┬─┬─┬─┬─┬─┬─┬─┬─┐
│H│e│l│l│o│ │ │ │ │
├─┼─┼─┼─┼─┼─┼─┼─┼─┤
│w│o│r│l│d│!│ │ │ │
├─┼─┼─┼─┼─┼─┼─┼─┼─┤
│I│'│m│ │h│e│r│e│!│
└─┴─┴─┴─┴─┴─┴─┴─┴─┘
```
in the interpreter.

Limn uses an infinite grid, which means you have unlimited space to move around in, and modify. This effectively provides unbounded storage space to work in, and also causes a lot of unintentional infinite loops, so be very, very careful.

Each command is a single symbol. This is to a) make my job easier and b) make limn simple to read. A loose description of each command(undergoing constant changes) is in the [language specification.](https://github.com/razetime/limn/blob/main/spec.md)


# The Stack
Limn uses an execution stack for the usage of its commands. Hence, Limn's syntax is based on prefix notation. Arguments go first, then the commands.

The stack can store 5 items *only*, and it can only be pushed into. This leaves the grid as the main method of storing and retrieving data, while the stack allows the usage of that data.

Any data that is read by the cursor (strings or numbers) will automatically be pushed to stack. For example:

A string is any sequence of characters wrapped in quotes. String support standard JS escape sequences.

A number is any sequence of digits that is not in quotes. To push multiple numbers to stack, just separate them with spaces, like so:
```
"Hello"23 25⊗
```
Stack contents: `["Hello",23,25]`

# Movement

Similar to other 2d languages like Befunge and Fish, Limn has commands to set direction, in the form of arrows. These change the program cursor's direction to the direction they represent.

Here they are, with their shortcuts:

```apl
q   w   e
  ↖ ↑ ↗
a ←   → d
  ↙ ↓ ↘
z   s   c
```
You can type these in the [online interpreter](https://razetime.github.io/limn/) by typing the <code>`</code> key, and the shortcut character.

The program ends when the `⊗` command is encountered. 

Here's an example of the arrows in action:
```apl
 →↘
 ⊗ ↓
↗
↑  ↙
 ↖←
```
[Try it!](https://razetime.github.io/limn/?code=%2520%25E2%2586%2592%25E2%2586%2598%250A%2520%25E2%258A%2597%2520%25E2%2586%2593%250A%25E2%2586%2597%250A%25E2%2586%2591%2520%2520%25E2%2586%2599%250A%2520%25E2%2586%2596%25E2%2586%2590&input=)

The other methods of setting direction are the `⟳` and `⊛` commands.

`⟳` has two variations:

* If it is given a number, it rotates 45 × n degrees clockwise from the current direction.
* Otherwise, it rotates 90 degrees from the current direction.

`⊛` Sets the direction to a random one. Try it if you like crashing your browser.

> **Note:** All other commands do not modify the direction of the program cursor.

# Storage and Retrieval

Limn has three powerful commands to store and retrieve data on the grid. We will be discussing two of them here.

## The Pencil
`✎` writes a string to the grid, in a path described by an arrow string. For example:

```
"Existence is pain" "2↘2↗3↘3↗7→"✎                 ⊗
```
will modify the grid to become:
```
"Existence is pain" "2↘2↗3↘3↗7→"✎   s      is pain⊗   
                                 E i t   e             
                                  x   e c              
                                       n 
```
Cool, huh? [Try it!](https://razetime.github.io/limn/?code=%2522Existence%2520is%2520pain%2522%25222%25E2%2586%25982%25E2%2586%25973%25E2%2586%25983%25E2%2586%25977%25E2%2586%2592%2522%25E2%259C%258E%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%25E2%258A%2597&input=)

You can also omit the end of the string:
```
"Existence is pain" "2↘2↗3↘3↗"✎   s      ⊗   
                               E i t   e             
                                x   e c              
                                     n 
```
The pencil command also modifies the cursor position(not direction, only the position) when modifying the code. Hence, you can use the empty string to perform movement without modifying the canvas.

A string of spaces effectively works as a eraser for the pencil.

## The Box.. Thingy

`⊡` reads from the canvas. It takes an arrow string and a boolean. The arrow string is used as a path to copy from.

It works similar to the pencil command, except it reads things, and does **not** move the program cursor.
Here's an example:
```
0"3↓6→3↗"⊡¿       c ⊗
         L       i
         i      p
         mn"is"e
```
This reads `"Limn\"is\"epic"` to the stack, since the boolean is set to 0. [Try it!](https://razetime.github.io/limn/?code=0%25223%25E2%2586%25936%25E2%2586%25923%25E2%2586%2597%2522%25E2%258A%25A1%25C2%25BF%2520%2520%2520%2520%2520%2520%2520c%2520%25E2%258A%2597%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520L%2520%2520%2520%2520%2520%2520%2520i%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520i%2520%2520%2520%2520%2520%2520p%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520mn%2522is%2522e&input=)

However, if we pass a truthy value to the function, ([Try it!](https://razetime.github.io/limn/?code=1%25223%25E2%2586%25936%25E2%2586%25923%25E2%2586%2597%2522%25E2%258A%25A1%25C2%25BF%2520%2520%2520%2520%2520%2520%2520c%2520%25E2%258A%2597%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520L%2520%2520%2520%2520%2520%2520%2520i%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520i%2520%2520%2520%2520%2520%2520p%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520mn%2522is%2522e&input=)), it will only push `"is"` to stack.