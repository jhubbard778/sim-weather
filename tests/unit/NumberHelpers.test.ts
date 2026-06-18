import { expect, test } from 'vitest';
import {
  arrayToCartesian2d, arrayToCartesian3d, Cartesian2d,
  getNumberWithSuffix, isInteger, isPointInPolygon, isPointOnPolygonEdge,
  timeToString
} from '../../src/utils/NumberHelpers.js';

test('test number suffixes', () => {
  const testCases = {
    1: "1st",
    2: "2nd",
    3: "3rd",
    4: "4th",
    5: "5th",
    11: "11th",
    12: "12th",
    13: "13th",
    14: "14th",
    21: "21st",
    22: "22nd",
    23: "23rd",
    31: "31st"
  };

  Object.entries(testCases).forEach(([num, expectedNumberWithSuffix]) => {
    expect(getNumberWithSuffix(Number(num))).toBe(expectedNumberWithSuffix);
  });
});

describe('time to string', () => {
  it('should return correct positive values', () => {
    expect(timeToString(1)).toBe("0:01.000");
    expect(timeToString(119.564)).toBe("1:59.564");
    expect(timeToString(605)).toBe("10:05.000");
  });

  it('should return correct negative values', () => {
    expect(timeToString(-1)).toBe("-0:01.000");
    expect(timeToString(-119.564)).toBe("-1:59.564");
    expect(timeToString(-605)).toBe("-10:05.000");
  });
});

describe('point in polygon', () => {
  const polygon: Cartesian2d[] = [
    { x: 2, y: 2 },
    { x: 2, y: 4 },
    { x: 4, y: 6 },
    { x: 6, y: 4 },
    { x: 8, y: 2 }
  ];

  it('should return true when point in polygon', () => {
    const testCases: Cartesian2d[] = [
      { x: 2, y: 2 },
      { x: 4, y: 2 },
      { x: 4, y: 4 },
      { x: 4, y: 5 },
      { x: 6, y: 4 },
      { x: 2, y: 4 }
    ];

    testCases.forEach((testCase) => {
      expect(isPointInPolygon(testCase, polygon)).toBeTruthy();
    });
  });

  it('should return false when point outside polygon', () => {
    const testCases: Cartesian2d[] = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 4 },
      { x: 5, y: 1 }
    ];

    testCases.forEach((testCase) => {
      expect(isPointInPolygon(testCase, polygon)).toBeFalsy();
    });
  });
});

describe('point on polygon edge', () => {
  const polygon: Cartesian2d[] = [
    { x: 2, y: 2 },
    { x: 2, y: 4 },
    { x: 4, y: 6 },
    { x: 6, y: 4 },
    { x: 8, y: 2 }
  ];

  it('should return true when point on polygon edge', () => {
    const testCases: Cartesian2d[] = [
      { x: 2, y: 2 },
      { x: 4, y: 2 },
      { x: 6, y: 4 },
      { x: 5, y: 5 }
    ];

    testCases.forEach((testCase) => {
      expect(isPointOnPolygonEdge(testCase, polygon)).toBeTruthy();
    });
  });

  it('should return false when point not on polygon edge', () => {
    const testCases: Cartesian2d[] = [
      { x: 4, y: 3 },
      { x: 4, y: 4 },
      { x: 6, y: 5 },
      { x: 5, y: 6 }
    ];

    testCases.forEach((testCase) => {
      expect(isPointOnPolygonEdge(testCase, polygon)).toBeFalsy();
    });
  });
});

describe('array to cartesian', () => {
  it('should return correct cartesian 2d', () => {
    expect(arrayToCartesian2d([1, 2])).toMatchObject({x: 1, y: 2});
  });

  it('should return correct cartesian 3d', () => {
    expect(arrayToCartesian3d([1, 2, 3])).toMatchObject({x: 1, y: 2, z: 3});
  })
});

it('should return isInteger correctly', () => {
  expect(isInteger(1)).toBeTruthy();
  expect(isInteger(20)).toBeTruthy();
  expect(isInteger(25)).toBeTruthy();
  expect(isInteger(22.25)).toBeFalsy();
  expect(isInteger(0.531)).toBeFalsy();
});
