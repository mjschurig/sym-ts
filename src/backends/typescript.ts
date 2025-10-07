import { Expression, ComputationBackend, BackendType } from '../core/types';
import { Add, Mul, Pow, SymNumber } from '../expressions/core';

/**
 * Pure TypeScript computational backend
 * Optimized for efficiency following SymPy patterns
 */
export class TypeScriptBackend implements ComputationBackend {
  readonly type = BackendType.TYPESCRIPT;

  async initialize(): Promise<void> {
    // No initialization needed for pure TypeScript
  }

  add(left: Expression, right: Expression): Expression {
    return Add.create(left, right);
  }

  multiply(left: Expression, right: Expression): Expression {
    return Mul.create(left, right);
  }

  power(base: Expression, exponent: Expression): Expression {
    return Pow.create(base, exponent);
  }

  evaluateNumerical(expr: Expression, substitutions: Record<string, number> = {}): number {
    if (
      expr.type === 'Number' ||
      expr.type === 'Zero' ||
      expr.type === 'One' ||
      expr.type === 'NegativeOne'
    ) {
      return (expr as SymNumber).value;
    }

    if (expr.type === 'Symbol') {
      const name = (expr as any).name;
      if (name in substitutions) {
        return substitutions[name];
      }
      throw new Error(`Cannot evaluate symbol '${name}' without substitution`);
    }

    if (expr.type === 'Add') {
      let sum = 0;
      for (const arg of expr.args) {
        sum += this.evaluateNumerical(arg, substitutions);
      }
      return sum;
    }

    if (expr.type === 'Mul') {
      let product = 1;
      for (const arg of expr.args) {
        product *= this.evaluateNumerical(arg, substitutions);
      }
      return product;
    }

    if (expr.type === 'Pow') {
      const base = this.evaluateNumerical(expr.args[0], substitutions);
      const exponent = this.evaluateNumerical(expr.args[1], substitutions);
      return Math.pow(base, exponent);
    }

    throw new Error(`Cannot evaluate expression ${expr.toString()} to a number`);
  }

  simplify(expr: Expression): Expression {
    // The flattening and canonical ordering in create() methods already provide
    // significant simplification following SymPy patterns
    return expr;
  }

  dispose(): void {
    // No cleanup needed for TypeScript backend
  }
}
