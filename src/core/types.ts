/**
 * Core types following SymPy's patterns for maximum efficiency
 *
 * Key optimizations:
 * - TypedArrays for numeric operations
 * - Minimal object properties (slots equivalent)
 * - Efficient data structures (Maps, arrays)
 * - Direct numeric operations without intermediate objects
 */

// Numeric coefficient storage
export type NumericCoeff = number;
export type CoeffArray = Float64Array;
export type SymbolId = number;
export type ExpressionType =
  | 'Number'
  | 'Symbol'
  | 'Add'
  | 'Mul'
  | 'Pow'
  | 'Zero'
  | 'One'
  | 'NegativeOne';

// Core ordering similar to SymPy's ordering_of_classes
export const TYPE_ORDER: Record<ExpressionType, number> = {
  Zero: 0,
  One: 1,
  NegativeOne: 2,
  Number: 3,
  Symbol: 4,
  Pow: 5,
  Mul: 6,
  Add: 7,
};

// Expression interface - minimal properties
export interface Expression {
  readonly type: ExpressionType;
  readonly hash: number;
  readonly args: readonly Expression[];

  // Fast comparison for sorting
  compareTo(other: Expression): number;

  // Fast equality check using hash
  equals(other: Expression): boolean;

  // String representation
  toString(): string;

  // Get all symbols in the expression
  getSymbols(): Set<string>;
}

// Coefficient-term pair for collection algorithms
export interface CoeffTermPair {
  coeff: NumericCoeff;
  term: Expression;
}

// Power pair for multiplication collection
export interface PowerPair {
  base: Expression;
  exp: NumericCoeff;
}

// Term collection map - term hash -> coefficient
export type TermMap = Map<number, NumericCoeff>;

// Power collection map - base hash -> exponent
export type PowerMap = Map<number, NumericCoeff>;

// Flattening result - no intermediate objects
export interface FlattenResult {
  terms: Expression[];
  coeff: NumericCoeff;
}

// Multiplication flattening result
export interface MulFlattenResult {
  factors: Expression[];
  powers: PowerPair[];
  coeff: NumericCoeff;
}

// Fast hash computation using FNV-1a algorithm
export function fastHash(data: string): number {
  let hash = 2166136261;
  for (let i = 0; i < data.length; i++) {
    hash ^= data.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0; // Unsigned 32-bit
}

// Combine hashes efficiently
export function combineHashes(hashes: number[]): number {
  let result = 2166136261;
  for (const h of hashes) {
    result ^= h;
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

// Numeric operations using TypedArrays when beneficial
export class NumericOps {
  private static tempArray1 = new Float64Array(1000);

  // Efficient coefficient addition for large arrays
  static addCoeffs(coeffs: NumericCoeff[]): NumericCoeff {
    if (coeffs.length === 0) return 0;
    if (coeffs.length === 1) return coeffs[0];
    if (coeffs.length === 2) return coeffs[0] + coeffs[1];

    // Use TypedArray for larger arrays
    if (coeffs.length > 10) {
      const arr =
        coeffs.length <= 1000
          ? this.tempArray1.subarray(0, coeffs.length)
          : new Float64Array(coeffs.length);

      for (let i = 0; i < coeffs.length; i++) {
        arr[i] = coeffs[i];
      }

      let sum = 0;
      for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
      }
      return sum;
    }

    // Direct sum for small arrays
    let sum = 0;
    for (const c of coeffs) {
      sum += c;
    }
    return sum;
  }

  // Efficient coefficient multiplication
  static mulCoeffs(coeffs: NumericCoeff[]): NumericCoeff {
    if (coeffs.length === 0) return 1;
    if (coeffs.length === 1) return coeffs[0];
    if (coeffs.length === 2) return coeffs[0] * coeffs[1];

    let result = 1;
    for (const c of coeffs) {
      if (c === 0) return 0;
      if (c === 1) continue;
      result *= c;
    }
    return result;
  }

  // Fast GCD computation
  static gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  // Fast GCD for array of numbers
  static gcdArray(nums: NumericCoeff[]): NumericCoeff {
    if (nums.length === 0) return 1;
    if (nums.length === 1) return Math.abs(nums[0]);

    let result = Math.abs(nums[0]);
    for (let i = 1; i < nums.length && result > 1; i++) {
      result = this.gcd(result, nums[i]);
    }
    return result;
  }
}

// Symbol registry for efficient symbol management
export class SymbolRegistry {
  private static nameToId = new Map<string, SymbolId>();
  private static idToName = new Map<SymbolId, string>();
  private static nextId = 1;

  static getId(name: string): SymbolId {
    let id = this.nameToId.get(name);
    if (id === undefined) {
      id = this.nextId++;
      this.nameToId.set(name, id);
      this.idToName.set(id, name);
    }
    return id;
  }

  static getName(id: SymbolId): string {
    return this.idToName.get(id) || `symbol_${id}`;
  }

  static clear(): void {
    this.nameToId.clear();
    this.idToName.clear();
    this.nextId = 1;
  }
}

// Backend types for compatibility
export enum BackendType {
  TYPESCRIPT = 'typescript',
}

export interface ComputationBackend {
  readonly type: BackendType;
  initialize(): Promise<void>;
  add(left: Expression, right: Expression): Expression;
  multiply(left: Expression, right: Expression): Expression;
  power(base: Expression, exponent: Expression): Expression;
  simplify(expr: Expression): Expression;
  evaluateNumerical(expr: Expression, substitutions?: Record<string, number>): number;
  dispose(): void;
}

export interface SymEngineConfig {
  defaultBackend: BackendType;
  precisionBits: number;
  maxSimplificationSteps: number;
}
