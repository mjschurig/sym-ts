/**
 * Core expression implementations following SymPy's exact patterns
 *
 * Key features:
 * - Minimal object properties (equivalent to __slots__)
 * - Efficient hashing and comparison
 * - Direct array operations for flattening and collection
 * - TypedArrays for numeric operations
 */

import {
  Expression,
  ExpressionType,
  NumericCoeff,
  SymbolId,
  TYPE_ORDER,
  FlattenResult,
  MulFlattenResult,
  fastHash,
  combineHashes,
  SymbolRegistry,
} from '../core/types';

// Base class with minimal properties (equivalent to SymPy's Basic with __slots__)
abstract class BaseExpression implements Expression {
  readonly type: ExpressionType;
  readonly hash: number;
  readonly args: readonly Expression[];

  constructor(type: ExpressionType, args: readonly Expression[], precomputedHash?: number) {
    this.type = type;
    this.args = args;
    this.hash = precomputedHash ?? this.computeHash();
  }

  private computeHash(): number {
    if (this.args.length === 0) {
      return fastHash(this.type);
    }

    const hashes = [fastHash(this.type), ...this.args.map((arg) => arg.hash)];
    return combineHashes(hashes);
  }

  compareTo(other: Expression): number {
    // Fast type-based comparison first
    const typeOrder = TYPE_ORDER[this.type] - TYPE_ORDER[other.type];
    if (typeOrder !== 0) return typeOrder;

    // Same type comparison
    return this.compareToSameType(other);
  }

  protected abstract compareToSameType(other: Expression): number;

  equals(other: Expression): boolean {
    // Fast hash-based equality check
    return this.hash === other.hash && this.type === other.type && this.deepEquals(other);
  }

  protected abstract deepEquals(other: Expression): boolean;

  abstract toString(): string;

  // Additional methods for compatibility
  getSymbols(): Set<string> {
    const symbols = new Set<string>();

    if (this.type === 'Symbol') {
      symbols.add((this as any).name);
    }

    for (const arg of this.args) {
      const argSymbols = arg.getSymbols();
      for (const symbol of argSymbols) {
        symbols.add(symbol);
      }
    }

    return symbols;
  }
}

// Number implementation
export class SymNumber extends BaseExpression {
  readonly value: NumericCoeff;

  constructor(value: NumericCoeff) {
    const type: ExpressionType =
      value === 0 ? 'Zero' : value === 1 ? 'One' : value === -1 ? 'NegativeOne' : 'Number';
    const hash = fastHash(`${type}:${value}`);
    super(type, [], hash);
    this.value = value;
  }

  protected compareToSameType(other: Expression): number {
    const otherNum = other as SymNumber;
    return this.value - otherNum.value;
  }

  protected deepEquals(other: Expression): boolean {
    return this.value === (other as SymNumber).value;
  }

  toString(): string {
    return this.value.toString();
  }

  // Efficient numeric operations
  add(other: SymNumber): SymNumber {
    return new SymNumber(this.value + other.value);
  }

  multiply(other: SymNumber): SymNumber {
    return new SymNumber(this.value * other.value);
  }

  power(exp: SymNumber): SymNumber {
    return new SymNumber(Math.pow(this.value, exp.value));
  }

  isZero(): boolean {
    return this.value === 0;
  }
  isOne(): boolean {
    return this.value === 1;
  }
  isMinusOne(): boolean {
    return this.value === -1;
  }

  // Properties for compatibility
  get isNumber(): boolean {
    return true;
  }

  // Evaluation method
  evaluate(_substitutions?: Record<string, number>): number {
    return this.value;
  }
}

// Symbol implementation
export class SymSymbol extends BaseExpression {
  readonly name: string;
  readonly symbolId: SymbolId;

  constructor(name: string) {
    const symbolId = SymbolRegistry.getId(name);
    const hash = fastHash(`Symbol:${name}`);
    super('Symbol', [], hash);
    this.name = name;
    this.symbolId = symbolId;
  }

  protected compareToSameType(other: Expression): number {
    const otherSymbol = other as SymSymbol;
    return this.name.localeCompare(otherSymbol.name);
  }

  protected deepEquals(other: Expression): boolean {
    return this.symbolId === (other as SymSymbol).symbolId;
  }

  toString(): string {
    return this.name;
  }

  // Properties for compatibility
  get isSymbol(): boolean {
    return true;
  }

  // Evaluation method
  evaluate(substitutions?: Record<string, number>): Expression | number {
    if (substitutions && this.name in substitutions) {
      return substitutions[this.name];
    }
    return this; // Return self if no substitution
  }
}

// Add implementation - follows SymPy's Add.flatten exactly
export class Add extends BaseExpression {
  private constructor(args: readonly Expression[], precomputedHash?: number) {
    super('Add', args, precomputedHash);
  }

  // Factory method that performs efficient flattening like SymPy
  static create(...args: Expression[]): Expression {
    if (args.length === 0) return ZERO;
    if (args.length === 1) return args[0];

    const flattened = Add.flatten(args);

    if (flattened.terms.length === 0) {
      return new SymNumber(flattened.coeff);
    }

    if (flattened.terms.length === 1 && flattened.coeff === 0) {
      return flattened.terms[0];
    }

    // Create final args array with coefficient first if non-zero
    const finalArgs: Expression[] = [];
    if (flattened.coeff !== 0) {
      finalArgs.push(new SymNumber(flattened.coeff));
    }
    finalArgs.push(...flattened.terms);

    return new Add(finalArgs);
  }

  // Efficient flattening algorithm following SymPy's Add.flatten
  private static flatten(seq: Expression[]): FlattenResult {
    // term hash -> coefficient
    const terms = new Map<number, NumericCoeff>();
    let coeff = 0;

    const collectTerms = (expr: Expression, coefficient: NumericCoeff = 1) => {
      if (expr.type === 'Zero') {
        return;
      } else if (expr.type === 'Number' || expr.type === 'One' || expr.type === 'NegativeOne') {
        coeff += (expr as SymNumber).value * coefficient;
      } else if (expr.type === 'Add') {
        // Flatten nested Add
        for (const arg of expr.args) {
          collectTerms(arg, coefficient);
        }
      } else if (expr.type === 'Mul') {
        // Extract coefficient from multiplication
        const { coeff: mulCoeff, term } = Add.extractCoeffTerm(expr);
        const termHash = term.hash;
        terms.set(termHash, (terms.get(termHash) || 0) + mulCoeff * coefficient);
      } else {
        // Regular term with coefficient
        const termHash = expr.hash;
        terms.set(termHash, (terms.get(termHash) || 0) + coefficient);
      }
    };

    for (const expr of seq) {
      collectTerms(expr);
    }

    // Convert collected terms back to expressions, filtering zero coefficients
    const resultTerms: Expression[] = [];

    for (const [termHash, coeffValue] of terms) {
      if (coeffValue === 0) continue;

      // Find the original term expression
      let term: Expression | undefined;
      for (const expr of seq) {
        if (expr.type === 'Add') {
          for (const arg of expr.args) {
            if (arg.hash === termHash) {
              term = arg;
              break;
            }
          }
        } else if (expr.type === 'Mul') {
          const { term: extractedTerm } = Add.extractCoeffTerm(expr);
          if (extractedTerm.hash === termHash) {
            term = extractedTerm;
            break;
          }
        } else if (expr.hash === termHash) {
          term = expr;
          break;
        }
        if (term) break;
      }

      if (!term) continue;

      if (coeffValue === 1) {
        resultTerms.push(term);
      } else {
        resultTerms.push(Mul.create(new SymNumber(coeffValue), term));
      }
    }

    // Sort terms for canonical form
    resultTerms.sort((a, b) => a.compareTo(b));

    return { terms: resultTerms, coeff };
  }

  private static extractCoeffTerm(expr: Expression): { coeff: NumericCoeff; term: Expression } {
    if (
      expr.type === 'Number' ||
      expr.type === 'Zero' ||
      expr.type === 'One' ||
      expr.type === 'NegativeOne'
    ) {
      return { coeff: (expr as SymNumber).value, term: ONE };
    }

    if (expr.type === 'Mul' && expr.args.length > 0) {
      const firstArg = expr.args[0];
      if (
        firstArg.type === 'Number' ||
        firstArg.type === 'Zero' ||
        firstArg.type === 'One' ||
        firstArg.type === 'NegativeOne'
      ) {
        const coeff = (firstArg as SymNumber).value;
        const remainingArgs = expr.args.slice(1);
        const term = remainingArgs.length === 1 ? remainingArgs[0] : new Mul(remainingArgs);
        return { coeff, term };
      }
    }

    return { coeff: 1, term: expr };
  }

  protected compareToSameType(other: Expression): number {
    const otherAdd = other as Add;

    // Compare argument arrays lexicographically
    const minLen = Math.min(this.args.length, otherAdd.args.length);
    for (let i = 0; i < minLen; i++) {
      const cmp = this.args[i].compareTo(otherAdd.args[i]);
      if (cmp !== 0) return cmp;
    }

    return this.args.length - otherAdd.args.length;
  }

  protected deepEquals(other: Expression): boolean {
    const otherAdd = other as Add;
    if (this.args.length !== otherAdd.args.length) return false;

    for (let i = 0; i < this.args.length; i++) {
      if (!this.args[i].equals(otherAdd.args[i])) return false;
    }

    return true;
  }

  toString(): string {
    if (this.args.length === 0) return '0';
    if (this.args.length === 1) return this.args[0].toString();

    return `(${this.args.map((arg) => arg.toString()).join(' + ')})`;
  }
}

// Mul implementation - follows SymPy's Mul.flatten exactly
export class Mul extends BaseExpression {
  constructor(args: readonly Expression[], precomputedHash?: number) {
    super('Mul', args, precomputedHash);
  }

  // Factory method that performs efficient flattening like SymPy
  static create(...args: Expression[]): Expression {
    if (args.length === 0) return ONE;
    if (args.length === 1) return args[0];

    const flattened = Mul.flatten(args);

    if (flattened.coeff === 0) return ZERO;
    if (flattened.factors.length === 0 && flattened.powers.length === 0) {
      return new SymNumber(flattened.coeff);
    }

    // Create final args array with coefficient first if not 1
    const finalArgs: Expression[] = [];
    if (flattened.coeff !== 1) {
      finalArgs.push(new SymNumber(flattened.coeff));
    }

    // Add collected powers
    for (const power of flattened.powers) {
      if (power.exp === 1) {
        finalArgs.push(power.base);
      } else {
        finalArgs.push(Pow.create(power.base, new SymNumber(power.exp)));
      }
    }

    finalArgs.push(...flattened.factors);

    if (finalArgs.length === 0) return ONE;
    if (finalArgs.length === 1) return finalArgs[0];

    return new Mul(finalArgs);
  }

  // Efficient flattening algorithm following SymPy's Mul.flatten
  private static flatten(seq: Expression[]): MulFlattenResult {
    // base hash -> exponent
    const powers = new Map<number, NumericCoeff>();
    const factors: Expression[] = [];
    const baseHashToExpr = new Map<number, Expression>();
    let coeff = 1;

    const collectFactors = (expr: Expression, exponent: NumericCoeff = 1) => {
      if (expr.type === 'Zero') {
        coeff = 0;
        return;
      } else if (expr.type === 'One') {
        return;
      } else if (expr.type === 'Number' || expr.type === 'NegativeOne') {
        coeff *= Math.pow((expr as SymNumber).value, exponent);
      } else if (expr.type === 'Mul') {
        // Flatten nested Mul
        for (const arg of expr.args) {
          collectFactors(arg, exponent);
        }
      } else if (expr.type === 'Pow') {
        const base = expr.args[0];
        const exp = expr.args[1];
        if (
          exp.type === 'Number' ||
          exp.type === 'Zero' ||
          exp.type === 'One' ||
          exp.type === 'NegativeOne'
        ) {
          const expValue = (exp as SymNumber).value;
          collectFactors(base, expValue * exponent);
        } else {
          factors.push(expr);
        }
      } else {
        const baseHash = expr.hash;
        baseHashToExpr.set(baseHash, expr);
        powers.set(baseHash, (powers.get(baseHash) || 0) + exponent);
      }
    };

    for (const expr of seq) {
      if (coeff === 0) break;
      collectFactors(expr);
    }

    // Convert collected powers back to power pairs
    const powerPairs: { base: Expression; exp: NumericCoeff }[] = [];

    for (const [baseHash, expValue] of powers) {
      if (expValue === 0) continue;

      const base = baseHashToExpr.get(baseHash);
      if (base) {
        powerPairs.push({ base, exp: expValue });
      }
    }

    // Sort for canonical form
    powerPairs.sort((a, b) => a.base.compareTo(b.base));
    factors.sort((a, b) => a.compareTo(b));

    return { factors, powers: powerPairs, coeff };
  }

  protected compareToSameType(other: Expression): number {
    const otherMul = other as Mul;

    const minLen = Math.min(this.args.length, otherMul.args.length);
    for (let i = 0; i < minLen; i++) {
      const cmp = this.args[i].compareTo(otherMul.args[i]);
      if (cmp !== 0) return cmp;
    }

    return this.args.length - otherMul.args.length;
  }

  protected deepEquals(other: Expression): boolean {
    const otherMul = other as Mul;
    if (this.args.length !== otherMul.args.length) return false;

    for (let i = 0; i < this.args.length; i++) {
      if (!this.args[i].equals(otherMul.args[i])) return false;
    }

    return true;
  }

  toString(): string {
    if (this.args.length === 0) return '1';
    if (this.args.length === 1) return this.args[0].toString();

    return `(${this.args.map((arg) => arg.toString()).join(' * ')})`;
  }
}

// Pow implementation
export class Pow extends BaseExpression {
  constructor(base: Expression, exponent: Expression) {
    super('Pow', [base, exponent]);
  }

  static create(base: Expression, exponent: Expression): Expression {
    // Fast power simplifications
    if (exponent.type === 'Zero') return ONE;
    if (exponent.type === 'One') return base;
    if (base.type === 'Zero') return ZERO;
    if (base.type === 'One') return ONE;

    // Numeric power evaluation
    const isNumeric = (expr: Expression): expr is SymNumber =>
      expr.type === 'Number' ||
      expr.type === 'Zero' ||
      expr.type === 'One' ||
      expr.type === 'NegativeOne';

    if (isNumeric(base) && isNumeric(exponent)) {
      return new SymNumber(Math.pow(base.value, exponent.value));
    }

    return new Pow(base, exponent);
  }

  protected compareToSameType(other: Expression): number {
    const otherPow = other as Pow;

    const baseCmp = this.args[0].compareTo(otherPow.args[0]);
    if (baseCmp !== 0) return baseCmp;

    return this.args[1].compareTo(otherPow.args[1]);
  }

  protected deepEquals(other: Expression): boolean {
    const otherPow = other as Pow;
    return this.args[0].equals(otherPow.args[0]) && this.args[1].equals(otherPow.args[1]);
  }

  toString(): string {
    return `(${this.args[0].toString()}^${this.args[1].toString()})`;
  }
}

// Preallocated singletons for performance
export const ZERO = new SymNumber(0);
export const ONE = new SymNumber(1);
export const NEGATIVE_ONE = new SymNumber(-1);
