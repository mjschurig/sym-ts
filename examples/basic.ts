#!/usr/bin/env tsx
/**
 * Basic example demonstrating core symbolic computation features
 */

import { SymEngine, sym, num, add, multiply, power } from '../src/index';

async function main(): Promise<void> {
  console.log('🧮 sym-ts - TypeScript Symbolic Mathematics');
  console.log('==========================================\n');

  // Create a new symbolic engine
  const engine = new SymEngine();
  await engine.initialize();
  
  console.log(`Backend: ${engine.getBackendType()}\n`);

  // Create some symbols and numbers
  const x = sym('x');
  const y = sym('y');
  const two = num(2);
  const three = num(3);
  
  console.log('Variables:');
  console.log(`x = ${x.toString()}`);
  console.log(`y = ${y.toString()}`);
  console.log(`2 = ${two.toString()}`);
  console.log(`3 = ${three.toString()}\n`);

  // Basic arithmetic operations
  console.log('Basic Operations:');
  
  // Addition
  const sum = add(x, y);
  console.log(`x + y = ${sum.toString()}`);
  
  // Multiplication  
  const product = multiply(x, two);
  console.log(`x * 2 = ${product.toString()}`);
  
  // Power
  const squared = power(x, two);
  console.log(`x^2 = ${squared.toString()}`);
  
  // Complex expression
  const complex = add(multiply(x, y), power(x, two));
  console.log(`x*y + x^2 = ${complex.toString()}\n`);

  // Simplification
  console.log('Simplification:');
  
  // 2 + 3 should simplify to 5
  const simpleSum = engine.simplify(add(two, three));
  console.log(`2 + 3 = ${simpleSum.toString()}`);
  
  // x + 0 should simplify to x
  const withZero = engine.simplify(add(x, num(0)));
  console.log(`x + 0 = ${withZero.toString()}`);
  
  // x * 1 should simplify to x
  const withOne = engine.simplify(multiply(x, num(1)));
  console.log(`x * 1 = ${withOne.toString()}`);
  
  // x^1 should simplify to x
  const powerOne = engine.simplify(power(x, num(1)));
  console.log(`x^1 = ${powerOne.toString()}\n`);

  // Evaluation with substitutions
  console.log('Evaluation:');
  
  // Evaluate x + y with x=5, y=3
  const substitutions = { x: 5, y: 3 };
  const evaluated = engine.evaluate(sum, substitutions);
  console.log(`(x + y) with x=5, y=3 = ${evaluated}`);
  
  // Evaluate x^2 + 2*x + 1 with x=3
  const quadratic = add(add(power(x, two), multiply(two, x)), num(1));
  const quadResult = engine.evaluate(quadratic, { x: 3 });
  console.log(`(x^2 + 2*x + 1) with x=3 = ${quadResult}`);
  
  // Show the unsimplified vs simplified forms
  console.log(`Original: ${quadratic.toString()}`);
  console.log(`Simplified: ${engine.simplify(quadratic).toString()}\n`);

  // Symbol extraction
  console.log('Symbol Analysis:');
  console.log(`Symbols in ${complex.toString()}: [${Array.from(complex.getSymbols()).join(', ')}]`);
  
  // Clean up
  engine.dispose();
  console.log('\n✅ Example completed successfully!');
}

// Run the example
main().catch(console.error);
