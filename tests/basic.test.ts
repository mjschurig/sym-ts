import { SymEngine, sym, num, add, multiply, power } from '../src/index';

describe('Basic Symbolic Operations', () => {
  let engine: SymEngine;

  beforeAll(async () => {
    engine = new SymEngine();
    await engine.initialize();
  });

  afterAll(() => {
    engine.dispose();
  });

  describe('Number operations', () => {
    test('creates numbers correctly', () => {
      const n1 = num(5);
      const n2 = num('3.14');

      expect(n1.value).toBe(5);
      expect(n2.toString()).toBe('3.14');
      expect(n1.isNumber).toBe(true);
    });

    test('evaluates numbers', () => {
      const n = num(42);
      expect(n.evaluate()).toBe(42);
    });
  });

  describe('Symbol operations', () => {
    test('creates symbols correctly', () => {
      const x = sym('x');
      const y = sym('variable_name');

      expect(x.name).toBe('x');
      expect(y.toString()).toBe('variable_name');
      expect(x.isSymbol).toBe(true);
    });

    test('evaluates symbols with substitutions', () => {
      const x = sym('x');

      expect(x.evaluate()).toBe(x); // No substitution
      expect(x.evaluate({ x: 10 })).toBe(10); // With substitution
      expect(x.evaluate({ y: 5 })).toBe(x); // Different variable
    });
  });

  describe('Addition', () => {
    test('adds numbers correctly', () => {
      const expr = add(num(2), num(3));
      const simplified = engine.simplify(expr);

      expect(simplified.toString()).toBe('5');
      expect(engine.evaluate(expr)).toBe(5);
    });

    test('handles symbolic addition', () => {
      const x = sym('x');
      const y = sym('y');
      const expr = add(x, y);

      expect(expr.toString()).toBe('(x + y)');
      expect(engine.evaluate(expr, { x: 2, y: 3 })).toBe(5);
    });

    test('simplifies addition with zero', () => {
      const x = sym('x');
      const expr = add(x, num(0));
      const simplified = engine.simplify(expr);

      expect(simplified.equals(x)).toBe(true);
    });
  });

  describe('Multiplication', () => {
    test('multiplies numbers correctly', () => {
      const expr = multiply(num(4), num(5));
      const simplified = engine.simplify(expr);

      expect(simplified.toString()).toBe('20');
      expect(engine.evaluate(expr)).toBe(20);
    });

    test('handles symbolic multiplication', () => {
      const x = sym('x');
      const expr = multiply(x, num(3));

      expect(expr.toString()).toBe('(3 * x)'); // Numbers come first in canonical ordering
      expect(engine.evaluate(expr, { x: 4 })).toBe(12);
    });

    test('simplifies multiplication with one', () => {
      const x = sym('x');
      const expr = multiply(x, num(1));
      const simplified = engine.simplify(expr);

      expect(simplified.equals(x)).toBe(true);
    });

    test('simplifies multiplication with zero', () => {
      const x = sym('x');
      const expr = multiply(x, num(0));
      const simplified = engine.simplify(expr);

      expect(simplified.toString()).toBe('0');
    });
  });

  describe('Power', () => {
    test('computes powers of numbers', () => {
      const expr = power(num(2), num(3));
      const simplified = engine.simplify(expr);

      expect(simplified.toString()).toBe('8');
      expect(engine.evaluate(expr)).toBe(8);
    });

    test('handles symbolic powers', () => {
      const x = sym('x');
      const expr = power(x, num(2));

      expect(expr.toString()).toBe('(x^2)');
      expect(engine.evaluate(expr, { x: 3 })).toBe(9);
    });

    test('simplifies power with zero exponent', () => {
      const x = sym('x');
      const expr = power(x, num(0));
      const simplified = engine.simplify(expr);

      expect(simplified.toString()).toBe('1');
    });

    test('simplifies power with one exponent', () => {
      const x = sym('x');
      const expr = power(x, num(1));
      const simplified = engine.simplify(expr);

      expect(simplified.equals(x)).toBe(true);
    });
  });

  describe('Complex expressions', () => {
    test('handles nested expressions', () => {
      const x = sym('x');
      // (x + 1) * (x + 2)
      const expr = multiply(add(x, num(1)), add(x, num(2)));

      expect(engine.evaluate(expr, { x: 3 })).toBe(20); // (3+1) * (3+2) = 4 * 5 = 20
    });

    test('extracts symbols correctly', () => {
      const x = sym('x');
      const y = sym('y');
      const expr = add(multiply(x, y), power(x, num(2)));

      const symbols = expr.getSymbols();
      expect(symbols.has('x')).toBe(true);
      expect(symbols.has('y')).toBe(true);
      expect(symbols.size).toBe(2);
    });
  });
});
