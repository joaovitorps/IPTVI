# Worked Examples

Concrete demonstrations of the first principles framework in action.

---

## Example 1: Inheritance in OOP (full pyramid)

**User**: "Explain inheritance from first principles"

### Question restated
"How does one class automatically get behavior from another?"

### Prerequisite hierarchy
```
Inheritance
├── Class → what it is and why we need it
│   ├── Object/instance [atomic]
│   ├── Properties (attributes) [atomic]
│   └── Methods (behaviors) [atomic]
└── Code reuse problem [atomic]
    └── Duplication is bad [atomic]
```

### Layer 1: What is a class?
**Initial model**: A class is a blueprint. Like an architectural blueprint for a house — it describes the layout, but isn't the house itself. You use the blueprint to create actual houses (objects/instances).

A blueprint has:
- **Properties**: Attributes that describe the house (color, size, number of rooms)
- **Methods**: Things the house can do (open door, turn on lights)

**Check**: "Does that distinction between blueprint (class) and actual house (instance/object) make sense?"

### Layer 2: Why would we need multiple similar classes?
**Initial model**: Imagine you're building a simulation with Dogs and Cats. Both have `name`, `age`, and `speak()`. Without inheritance, you'd write the same code twice.

```
class Dog:
    name, age, speak() → "Woof"

class Cat:
    name, age, speak() → "Meow"
```

`name` and `age` appear in both. That's duplication.

**Check**: "Do you see why duplication becomes a problem as you add more animal types?"

### Layer 3: Inheritance solves this
**Initial model**: Inheritance says: "Instead of repeating the shared stuff, put it in a parent class (Animal) and have Dog and Cat inherit from it."

```
class Animal:
    name, age  ← written once here

class Dog(Animal):  ← Dog automatically gets name, age
    speak() → "Woof"

class Cat(Animal):  ← Cat automatically gets name, age
    speak() → "Meow"
```

Dog and Cat **inherit** the common properties. They only define what makes them unique (their `speak` behavior).

**Refine**: The child class can also **override** — replace a parent method with its own version (as `Dog` and `Cat` do with `speak`).

**Check**: "In your own words, what problem does inheritance solve?"

### Synthesis
Inheritance is a mechanism that lets you define shared properties and behaviors in a parent class, then have child classes automatically acquire them — eliminating duplication while allowing each child to specialize what's unique.

---

## Example 2: Why does `this` behave unexpectedly in JavaScript? (reverse pyramid)

**User**: "Why does `this` refer to the window inside this callback?"

### Root cause
`this` in JavaScript is determined by **how a function is called**, not where it's defined.

### Causal chain
Unexpected `this` ← function called without context ← JavaScript's call-site rule

### Layer 1: Call-site rule
`this` refers to the object that **owns the call**, i.e., whatever is to the left of the dot at call time:

```
obj.method() → this = obj
func()       → this = global/window (no dot = no owner)
```

### Layer 2: The callback problem
When you pass `obj.method` as a callback, you're passing the function reference, not the binding:

```
setTimeout(obj.method, 1000)  // At call time, there's no obj. → this = window
```

### Layer 3: Fixes
**.bind()**: Permanently binds `this`: `setTimeout(obj.method.bind(obj), 1000)`

**Arrow function**: Lexical `this` (inherits from surrounding scope): `setTimeout(() => obj.method(), 1000)`

---

## Example 3: TCP vs UDP difference (brief)

**User**: "Quick explanation of TCP vs UDP"

**Response** (skipping full pyramid since only brief explanation needed):

"Both are transport protocols that send data between computers. Think of them as shipping services:

- **TCP** is registered mail: guarantees delivery, in order, with confirmation. Slower, but reliable. Used for: web pages, emails, file transfers.
- **UDP** is a postcard: fire-and-forget. Fast, but no guarantee it arrives or arrives in order. Used for: video streaming, gaming, DNS lookups.

TCP adds overhead for reliability (acknowledgments, retransmission, ordering). UDP strips all that for speed. Tradeoff is reliability vs latency."
