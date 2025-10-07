/**
 * sym-ts - A TypeScript implementation of symbolic mathematics
 *
 * This library provides symbolic computation capabilities similar to SymPy,
 * with support for multiple computational backends including pure TypeScript,
 * WebAssembly, and WebGPU.
 */

// Core exports
export { SymEngine } from './core/engine';
export {
  BackendType,
  type Expression,
  type ComputationBackend,
  type SymEngineConfig,
} from './core/types';

// Import types for internal use
import { SymEngine } from './core/engine';
import { BackendType, Expression } from './core/types';
import { SymSymbol, SymNumber } from './expressions/core';

// Expression types
export { SymNumber, SymSymbol, Add, Mul, Pow } from './expressions/core';

// Backend implementations
export { TypeScriptBackend } from './backends/typescript';

// Convenience functions
export { sym, num, add, multiply, power } from './core/engine';

// Default engine instance
const defaultEngine = new SymEngine();

/**
 * Initialize the default engine
 */
export async function initialize(backendType?: BackendType): Promise<void> {
  await defaultEngine.initialize(backendType);
}

/**
 * Create a symbol using the default engine
 */
export function symbol(name: string): SymSymbol {
  return defaultEngine.symbol(name);
}

/**
 * Create a number using the default engine
 */
export function number(value: number | string): SymNumber {
  return defaultEngine.number(value);
}

/**
 * Simplify an expression using the default engine
 */
export function simplify(expr: Expression): Expression {
  return defaultEngine.simplify(expr);
}

/**
 * Evaluate an expression using the default engine
 */
export function evaluate(expr: Expression, substitutions?: Record<string, number>): number {
  return defaultEngine.evaluate(expr, substitutions);
}

// Initialize with TypeScript backend by default
initialize().catch(console.error);
