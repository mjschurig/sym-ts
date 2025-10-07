import { Expression, ComputationBackend, BackendType, SymEngineConfig } from './types';
import { SymNumber, SymSymbol, Add, Mul, Pow } from '../expressions/core';
import { TypeScriptBackend } from '../backends/typescript';

/**
 * Main engine for symbolic computation
 */
export class SymEngine {
  private backend: ComputationBackend;
  private readonly config: SymEngineConfig;

  constructor(config?: Partial<SymEngineConfig>) {
    this.config = {
      defaultBackend: BackendType.TYPESCRIPT,
      precisionBits: 64,
      maxSimplificationSteps: 100,
      ...config,
    };

    // Initialize with TypeScript backend by default
    this.backend = new TypeScriptBackend();
  }

  /**
   * Initialize the engine with the specified backend
   */
  async initialize(backendType?: BackendType): Promise<void> {
    const targetBackend = backendType || this.config.defaultBackend;

    switch (targetBackend) {
      case BackendType.TYPESCRIPT:
        this.backend = new TypeScriptBackend();
        break;
      default:
        throw new Error(`Unknown backend type: ${targetBackend}`);
    }

    await this.backend.initialize();
  }

  /**
   * Create a numerical constant
   */
  number(value: number | string): SymNumber {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new SymNumber(numValue);
  }

  /**
   * Create a symbolic variable
   */
  symbol(name: string): SymSymbol {
    return new SymSymbol(name);
  }

  /**
   * Add two expressions
   */
  add(left: Expression, right: Expression): Expression {
    return this.backend.add(left, right);
  }

  /**
   * Multiply two expressions
   */
  multiply(left: Expression, right: Expression): Expression {
    return this.backend.multiply(left, right);
  }

  /**
   * Raise expression to a power
   */
  power(base: Expression, exponent: Expression): Expression {
    return this.backend.power(base, exponent);
  }

  /**
   * Simplify an expression
   */
  simplify(expr: Expression): Expression {
    return this.backend.simplify(expr);
  }

  /**
   * Evaluate an expression numerically
   */
  evaluate(expr: Expression, substitutions?: Record<string, number>): number {
    return this.backend.evaluateNumerical(expr, substitutions);
  }

  /**
   * Get the current backend type
   */
  getBackendType(): BackendType {
    return this.backend.type;
  }

  /**
   * Switch to a different backend
   */
  async switchBackend(backendType: BackendType): Promise<void> {
    this.backend.dispose();
    await this.initialize(backendType);
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.backend.dispose();
  }
}

// Export factory functions for convenience
export function sym(name: string): SymSymbol {
  return new SymSymbol(name);
}

export function num(value: number | string): SymNumber {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new SymNumber(numValue);
}

export function add(left: Expression, right: Expression): Expression {
  return Add.create(left, right);
}

export function multiply(left: Expression, right: Expression): Expression {
  return Mul.create(left, right);
}

export function power(base: Expression, exponent: Expression): Expression {
  return Pow.create(base, exponent);
}
