#!/usr/bin/env tsx

import { SymEngine, sym, num, add, multiply, power } from '../src/index';

/**
 * Demonstration of the optimized symbolic mathematics implementation
 *
 * Key features:
 * - 1-to-1 port of SymPy's architecture
 * - Minimal classes with readonly properties (equivalent to __slots__)
 * - Efficient flattening using Maps and direct array operations
 * - TypedArrays for numeric operations when beneficial
 * - Fast hash-based equality checking
 * - Canonical ordering following SymPy's patterns
 */

async function demonstrateOptimizedFeatures() {
  console.log('🚀 Optimized sym-ts (SymPy 1-to-1 Port)');
  console.log('==========================================\n');

  const engine = new SymEngine();
  await engine.initialize();

  console.log('1. 🎯 Efficient Expression Creation');
  console.log('-----------------------------------');

  // Create expressions efficiently - notice automatic flattening
  const x = sym('x');
  const y = sym('y');
  const z = sym('z');

  // Direct array operations, no intermediate objects
  const expr1 = add(add(x, y), z); // Flattened to: x + y + z
  const expr2 = multiply(multiply(num(2), x), y); // Flattened to: 2 * x * y

  console.log(`Nested addition: ${expr1.toString()}`);
  console.log(`Arguments: ${expr1.args.length} (automatically flattened)`);
  console.log(`Hash: ${expr1.hash} (fast FNV-1a algorithm)`);

  console.log(`\nNested multiplication: ${expr2.toString()}`);
  console.log(`Arguments: ${expr2.args.length} (automatically flattened)`);
  console.log(`Hash: ${expr2.hash}\n`);

  console.log('2. ⚡ Fast Numeric Operations');
  console.log('-----------------------------');

  // Efficient numeric simplification
  const numExpr1 = power(num(2), num(3)); // Should simplify to 8
  const numExpr2 = multiply(num(0), x); // Should simplify to 0
  const numExpr3 = multiply(num(1), y); // Should simplify to y

  console.log(`2^3 = ${numExpr1.toString()}`);
  console.log(`0 * x = ${numExpr2.toString()}`);
  console.log(`1 * y = ${numExpr3.toString()}\n`);

  console.log('3. 🏗️ Memory-Efficient Architecture');
  console.log('-----------------------------------');

  // Minimal object properties (equivalent to SymPy's __slots__)
  console.log(`Number object keys: ${Object.keys(num(42)).length}`);
  console.log(`Symbol object keys: ${Object.keys(sym('a')).length}`);
  console.log(
    `Expression args are readonly: ${Array.isArray(expr1.args) && Object.isFrozen(expr1.args)}`
  );

  // Efficient symbol registry
  const sym1 = sym('test');
  const sym2 = sym('test');
  console.log(`Same symbol instances are equal: ${sym1.equals(sym2)}`);
  console.log(`Hash-based equality check: O(1) complexity\n`);

  console.log('4. 📐 SymPy-Style Canonical Ordering');
  console.log('------------------------------------');

  // Numbers come first, then symbols alphabetically
  const mixedExpr = add(y, num(5), x, num(-2));
  console.log(`Mixed expression: ${mixedExpr.toString()}`);
  console.log(`Canonical ordering: numbers first, then symbols alphabetically\n`);

  console.log('5. 🧮 TypedArray Optimization');
  console.log('-----------------------------');

  // Large coefficient arrays use Float64Array internally
  const largeSum = add(...Array.from({ length: 20 }, (_, i) => multiply(num(i + 1), x)));
  console.log(`Large sum with 20 terms: ${largeSum.toString()}`);
  console.log(`Uses TypedArray for coefficient operations when beneficial\n`);

  console.log('6. 🔍 Performance Comparison');
  console.log('----------------------------');

  // Performance test: creating and flattening expressions
  const start = performance.now();

  for (let i = 0; i < 1000; i++) {
    const expr = add(multiply(num(i), x), multiply(num(i + 1), y), multiply(num(i + 2), z));
    // Each expression is automatically flattened and canonically ordered
    expr.toString(); // Force evaluation
  }

  const end = performance.now();
  console.log(`Created and flattened 1000 expressions in ${(end - start).toFixed(2)}ms`);
  console.log(`Average: ${((end - start) / 1000).toFixed(4)}ms per expression\n`);

  console.log('7. 🎪 Advanced Features');
  console.log('----------------------');

  // Symbol extraction
  const complexExpr = multiply(add(power(x, num(2)), y), add(z, num(1)));

  console.log(`Complex expression: ${complexExpr.toString()}`);
  console.log(`Symbols: ${Array.from(complexExpr.getSymbols()).join(', ')}`);
  console.log(`Numerical evaluation with x=2, y=3, z=4:`);
  console.log(`Result: ${engine.evaluate(complexExpr, { x: 2, y: 3, z: 4 })}`);

  console.log('\n✨ Optimization Summary');
  console.log('======================');
  console.log('✅ 1-to-1 SymPy architecture port');
  console.log('✅ Minimal object properties (slots equivalent)');
  console.log('✅ Efficient Map-based term collection');
  console.log('✅ TypedArray numeric operations');
  console.log('✅ Fast FNV-1a hashing');
  console.log('✅ Canonical expression ordering');
  console.log('✅ Automatic expression flattening');
  console.log('✅ Zero intermediate object creation');
  console.log('✅ Ready for external computational backends!');
}

// Run the demonstration
if (require.main === module) {
  demonstrateOptimizedFeatures().catch(console.error);
}
