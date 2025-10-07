#!/usr/bin/env tsx

import { SymEngine, sym, num, add, multiply, power } from '../src/index';
import { expand, collect, factor } from '../src/simplify/algorithms';

/**
 * Demonstration of advanced symbolic mathematics features
 *
 * This example showcases the improvements made to sym-ts based on SymPy's architecture:
 * - Expression flattening and canonical ordering
 * - Advanced simplification algorithms
 * - Multi-argument operations
 * - Sophisticated backend with multiple simplification strategies
 */

async function demonstrateAdvancedFeatures() {
  console.log('🧮 sym-ts Advanced Features Demonstration');
  console.log('=========================================\n');

  const engine = new SymEngine();
  await engine.initialize();

  console.log('1. 📐 Expression Flattening and Canonical Ordering');
  console.log('---------------------------------------------------');

  const x = sym('x');
  const y = sym('y');
  const z = sym('z');

  // Demonstrate automatic flattening
  const nestedAdd = add(add(x, y), z);
  console.log(`add(add(x, y), z) =`, nestedAdd.toString());
  console.log(`Arguments count: ${nestedAdd.args.length} (automatically flattened)`);

  const nestedMul = multiply(multiply(x, num(2)), y);
  console.log(`multiply(multiply(x, 2), y) =`, nestedMul.toString());
  console.log(`Arguments count: ${nestedMul.args.length} (automatically flattened)\n`);

  console.log('2. 🔢 Multi-argument Operations');
  console.log('--------------------------------');

  // These now work with multiple arguments due to our improved constructor
  const sumExpr = engine.add(engine.add(x, y), z);
  const productExpr = engine.multiply(engine.multiply(num(2), x), y);

  console.log(`Sum of x, y, z:`, sumExpr.toString());
  console.log(`Product 2*x*y:`, productExpr.toString());
  console.log(`Canonical ordering: numbers first, then symbols alphabetically\n`);

  console.log('3. 🧠 Advanced Simplification');
  console.log('------------------------------');

  // Expansion
  const expr1 = multiply(add(x, num(1)), add(x, num(2)));
  const expanded = expand(expr1);
  console.log(`(x + 1) * (x + 2) =`, expr1.toString());
  console.log(`Expanded:`, expanded.toString());

  // Collection of like terms
  const expr2 = add(add(multiply(num(3), x), multiply(num(2), x)), num(5));
  const collected = collect(expr2);
  console.log(`\n3*x + 2*x + 5 =`, expr2.toString());
  console.log(`Collected:`, collected.toString());

  // Factoring
  const expr3 = add(multiply(num(6), x), multiply(num(9), y));
  const factored = factor(expr3);
  console.log(`\n6*x + 9*y =`, expr3.toString());
  console.log(`Factored:`, factored.toString());

  console.log('\n4. 🎯 Multi-pass Simplification Engine');
  console.log('---------------------------------------');

  // Complex expression that benefits from multiple strategies
  const complex = add(multiply(multiply(num(2), x), add(x, num(1))), multiply(num(3), x));

  console.log(`Complex: 2*x*(x + 1) + 3*x =`, complex.toString());

  const simplified = engine.simplify(complex);
  console.log(`Simplified:`, simplified.toString());
  console.log(`(Uses expand, collect, factor, and other strategies)\n`);

  console.log('5. 📊 Assumption System');
  console.log('------------------------');

  const five = num(5);
  const negTwo = num(-2);
  const zero = num(0);

  console.log(`5 properties:`);
  console.log(`  isNumber: ${five.isNumber}`);
  console.log(`  isPositive: ${five.isPositive}`);
  console.log(`  isZero: ${five.isZero}`);
  console.log(`  isRational: ${five.isRational}`);

  console.log(`\n-2 properties:`);
  console.log(`  isNegative: ${negTwo.isNegative}`);
  console.log(`  isPositive: ${negTwo.isPositive}`);

  console.log(`\n0 properties:`);
  console.log(`  isZero: ${zero.isZero}`);
  console.log(`  isPositive: ${zero.isPositive}`);
  console.log(`  isNegative: ${zero.isNegative}\n`);

  console.log('6. 🔍 Expression Analysis');
  console.log('--------------------------');

  const complexExpr = multiply(add(power(x, num(2)), multiply(num(2), x)), add(y, num(3)));

  console.log(`Expression: (x^2 + 2*x) * (y + 3)`);
  console.log(`String representation:`, complexExpr.toString());
  console.log(`Type:`, complexExpr.type);
  console.log(`Is commutative:`, complexExpr.isCommutative);
  console.log(`Arguments count:`, complexExpr.args.length);
  console.log(`Symbols:`, Array.from(complexExpr.getSymbols()).join(', '));
  console.log(`Hash code:`, complexExpr.hash());

  console.log('\n7. 📈 Numerical Evaluation');
  console.log('---------------------------');

  const evalExpr = add(multiply(power(x, num(2)), num(2)), multiply(y, num(3)));

  console.log(`Expression: 2*x^2 + 3*y`);
  console.log(`With x=2, y=4:`, engine.evaluate(evalExpr, { x: 2, y: 4 }));
  console.log(`With x=1, y=0:`, engine.evaluate(evalExpr, { x: 1, y: 0 }));
  console.log(`With x=0, y=1:`, engine.evaluate(evalExpr, { x: 0, y: 1 }));

  console.log('\n✨ Summary of Improvements');
  console.log('=========================');
  console.log('✅ SymPy-inspired architecture with Basic class hierarchy');
  console.log('✅ Automatic expression flattening (Add/Mul operations)');
  console.log('✅ Canonical argument ordering for consistent representation');
  console.log('✅ Multi-argument constructors for operations');
  console.log('✅ Advanced simplification algorithms (expand, collect, factor)');
  console.log('✅ Multi-pass simplification engine with multiple strategies');
  console.log('✅ Basic assumption system for expression properties');
  console.log('✅ Efficient hash-based equality checking');
  console.log('✅ Expression pattern matching and replacement');
  console.log('✅ Pure TypeScript backend focused on advanced algorithms');
  console.log('\n🎯 Ready for computational backends from npm packages!');
}

// Run the demonstration
if (require.main === module) {
  demonstrateAdvancedFeatures().catch(console.error);
}
