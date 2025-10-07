# sym-ts

A TypeScript implementation of symbolic mathematics with multiple backend options.

[![npm version](https://badge.fury.io/js/sym-ts.svg)](https://badge.fury.io/js/sym-ts)
[![CI/CD Pipeline](https://github.com/maxschurig/sym-ts/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/maxschurig/sym-ts/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

sym-ts is a TypeScript symbolic mathematics library inspired by [SymPy](https://www.sympy.org/), designed to bring powerful symbolic computation to JavaScript and TypeScript environments. It features a modular architecture that supports multiple computational backends for optimal performance in different scenarios.

## Features

- 🧮 **Symbolic Mathematics**: Create and manipulate symbolic expressions
- 🚀 **Multiple Backends**: Pure TypeScript, WebAssembly, and WebGPU support
- 🔢 **High Precision**: Arbitrary precision arithmetic using Big.js
- 🎯 **Type Safe**: Full TypeScript support with comprehensive type definitions
- 🌐 **Universal**: Works in browsers, Node.js, and edge environments
- 🧪 **Well Tested**: Comprehensive test suite with high coverage
- 📚 **Documentation**: Extensive documentation and examples

## Installation

```bash
npm install sym-ts
```

## Quick Start

```typescript
import { SymEngine, sym, num, add, multiply, power } from 'sym-ts';

// Initialize the engine
const engine = new SymEngine();
await engine.initialize();

// Create symbols and numbers
const x = sym('x');
const y = sym('y');
const two = num(2);

// Build expressions
const expr = add(multiply(x, y), power(x, two)); // x*y + x^2

// Simplify expressions
const simplified = engine.simplify(expr);

// Evaluate with substitutions
const result = engine.evaluate(expr, { x: 3, y: 4 }); // 21

console.log(`Expression: ${expr.toString()}`);
console.log(`Result: ${result}`);
```

## Backend Options

### TypeScript Backend (Default)
Pure TypeScript implementation with no external dependencies.

```typescript
import { SymEngine, BackendType } from 'sym-ts';

const engine = new SymEngine();
await engine.initialize(BackendType.TYPESCRIPT);
```

### WebAssembly Backend (Coming Soon)
High-performance backend using WebAssembly for intensive computations.

```typescript
await engine.initialize(BackendType.WEBASSEMBLY);
```

### WebGPU Backend (Coming Soon)
GPU-accelerated computations using WebGPU for parallel processing.

```typescript
await engine.initialize(BackendType.WEBGPU);
```

## Core Concepts

### Expressions

All mathematical objects in sym-ts are expressions that implement the `Expression` interface:

```typescript
import { Expression } from 'sym-ts';

// Numbers
const five = num(5);
const pi = num('3.14159');

// Symbols
const x = sym('x');
const alpha = sym('alpha');

// Operations
const sum = add(x, five);
const product = multiply(x, pi);
const exponent = power(x, two);
```

### Operations

Built-in operations include:

- **Addition**: `add(a, b)` or `a + b`
- **Multiplication**: `multiply(a, b)` or `a * b`  
- **Power**: `power(base, exponent)` or `base^exponent`

### Simplification

The engine can automatically simplify expressions:

```typescript
const expr = add(multiply(x, num(1)), num(0)); // x * 1 + 0
const simplified = engine.simplify(expr); // x
```

### Evaluation

Substitute symbols with numerical values:

```typescript
const expr = multiply(x, add(y, num(2)));
const result = engine.evaluate(expr, { x: 3, y: 4 }); // 3 * (4 + 2) = 18
```

## Advanced Usage

### Custom Backend Configuration

```typescript
const engine = new SymEngine({
  defaultBackend: BackendType.TYPESCRIPT,
  enableCaching: true,
  precisionBits: 128,
  maxSimplificationSteps: 1000
});
```

### Expression Analysis

```typescript
const expr = add(multiply(x, y), power(z, num(2)));

// Get all symbols
const symbols = expr.getSymbols(); // Set {'x', 'y', 'z'}

// Check expression properties
console.log(expr.isNumber); // false
console.log(expr.isSymbol); // false
console.log(expr.isAtomic); // false
```

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/maxschurig/sym-ts.git
cd sym-ts

# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build

# Run examples
npm run example:basic
```

### Development Container

This project includes a VS Code dev container for consistent development environments:

```bash
# Open in VS Code with Remote-Containers extension
code .
# Choose "Reopen in Container" when prompted
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint
```

## API Reference

### Core Classes

- **`SymEngine`**: Main computation engine
- **`SymNumber`**: Numerical constants
- **`SymSymbol`**: Symbolic variables
- **`Add`**: Addition operation
- **`Multiply`**: Multiplication operation  
- **`Power`**: Exponentiation operation

### Interfaces

- **`Expression`**: Base interface for all mathematical objects
- **`ComputationBackend`**: Interface for computation backends
- **`SymEngineConfig`**: Configuration options

## Roadmap

- [ ] **WebAssembly Backend**: High-performance WASM implementation
- [ ] **WebGPU Backend**: GPU-accelerated computations
- [ ] **Additional Operations**: Division, trigonometric functions, logarithms
- [ ] **Calculus**: Differentiation and integration
- [ ] **Equation Solving**: Algebraic and numerical solvers
- [ ] **Matrix Operations**: Linear algebra support
- [ ] **Plotting**: Integration with plotting libraries

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and development process.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run the test suite
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [SymPy](https://www.sympy.org/) - Python symbolic mathematics
- Built with [TypeScript](https://www.typescriptlang.org/)
- Uses [Big.js](https://github.com/MikeMcl/big.js/) for arbitrary precision arithmetic

## Support

- 📚 [Documentation](https://github.com/maxschurig/sym-ts/wiki)
- 🐛 [Issue Tracker](https://github.com/maxschurig/sym-ts/issues)
- 💬 [Discussions](https://github.com/maxschurig/sym-ts/discussions)

---

Made with ❤️ by [Max Schurig](https://github.com/maxschurig)