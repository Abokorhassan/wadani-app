import { parseMoney } from './money';

describe('parseMoney', () => {
  it.each([
    ['10', 10],
    ['10.5', 10.5],
    ['10.50', 10.5],
    ['$10.50', 10.5],
    ['  25 ', 25],
    ['0.01', 0.01],
  ])('accepts %s', (input, expected) => {
    expect(parseMoney(input)).toBe(expected);
  });

  it.each([
    ['10.999', 'three decimals were silently rounded up to $11.00'],
    ['1e3', 'the "e" was stripped and $13 was charged'],
    ['abc10', 'letters were stripped and $10 was charged'],
    ['0.001', 'it was sent as $0.00'],
    ['0', 'zero'],
    ['-5', 'negative'],
    ['1.2.3', 'two points'],
    ['1,000', 'a thousands separator is not a decimal'],
    ['', 'empty'],
    ['$', 'no digits'],
    ['12345678', 'absurdly large'],
  ])('refuses %s (%s)', (input) => {
    expect(parseMoney(input)).toBeNull();
  });
});
