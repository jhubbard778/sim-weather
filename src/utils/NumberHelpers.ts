/**
 * Converts raw seconds to time string
 * Example: 119.564 -> 1:59.564
 * @param time The time in seconds to convert
 * @returns a time string
 */
export const timeToString = (time: number): string => {
    const isNegative = time < 0;
    let brokenTime = breakTime(Math.abs(time));

    let s = leftFillString(brokenTime.min.toString(), " ", 0) + ":";
    s += leftFillString(brokenTime.sec.toString(), "0", 2) + ".";
    s += leftFillString(brokenTime.ms.toString(), "0", 3);

    if (isNegative) {
        s = `-${s}`;
    }

    return s;
}

const breakTime = (time: number): { min: number, sec: number, ms: number } => {
    let ms = Math.floor(time * 1000.0);
    let sec = Math.floor(ms / 1000);
    let min = Math.floor(sec / 60);

    ms -= sec * 1000;
    sec -= min * 60;

    return { min: min, sec: sec, ms: ms };
}

const leftFillString = (string: string, pad: string, n: number): string => {
    n -= string.length;

    while (n > 0) {
        if (n & 1) {
            string = pad + string;
        }

        n >>= 1;
        pad += pad;
    }

    return string;
}

export const calculateDistance2d = (point1: Cartesian2d, point2: Cartesian2d): number => {
    return Math.sqrt(
        Math.pow(point2.x - point1.x, 2) +
        Math.pow(point2.y - point1.y, 2)
    );
}

export const calculateDistance3d = (point1: Cartesian3d, point2: Cartesian3d): number => {
    return Math.sqrt(
        Math.pow(point2.x - point1.x, 2) +
        Math.pow(point2.y - point1.y, 2) +
        Math.pow(point2.z - point1.z, 2)
    );
}

export type Cartesian2d = { x: number, y: number }
export type Cartesian3d = { x: number, y: number, z: number };

export const arrayToCartesian2d = (array: Vec2): Cartesian2d => {
    return { x: array[0], y: array[1] };
}

export const arrayToCartesian3d = (array: Vec3): Cartesian3d => {
    return { x: array[0], y: array[1], z: array[2] }; 
}

const isEdgeCrossingY = (a: Cartesian2d, b: Cartesian2d, y: number): boolean => {
    return (a.y > y) !== (b.y > y);
}

const getEdgeXAtY = (a: Cartesian2d, b: Cartesian2d, y: number): number => {
    return ((b.x - a.x) * (y - a.y) / (b.y - a.y)) + a.x;
}

const isPointOnSegment = (point: Cartesian2d, a: Cartesian2d, b: Cartesian2d): boolean => {
    const crossProduct = (point.y - a.y) * (b.x - a.x) - (point.x - a.x) * (b.y - a.y);
    if (Math.abs(crossProduct) > 1e-16) return false;

    const minX = Math.min(a.x, b.x);
    const maxX = Math.max(a.x, b.x);
    const minY = Math.min(a.y, b.y);
    const maxY = Math.max(a.y, b.y);

    return point.x >= minX
        && point.x <= maxX
        && point.y >= minY
        && point.y <= maxY;
}

/**
 * Determines if a point is sitting on the edge of a polgyon
 * @param point The point to check
 * @param polygon The polygon points
 * @returns boolean
 */
export const isPointOnPolygonEdge = (point: Cartesian2d, polygon: Cartesian2d[]): boolean => {
    // foreach edge, check if point lies on that edge
    for (let i = 0, j = polygon.length - 1; i < polygon.length; i++) {
        if (isPointOnSegment(point, polygon[i], polygon[j])) return true;
        j = i;
    }

    return false;
}

/**
 * Determines if a point is inside a polygon
 * @param point The point to check
 * @param polygon The polygon points
 * @param countEdgeAsInside Boolean flag to count point as inside if the point lies on an edge
 * @returns boolean
 */
export const isPointInPolygon = (point: Cartesian2d, polygon: Cartesian2d[], countEdgeAsInside: boolean = true): boolean => {
    if (countEdgeAsInside && isPointOnPolygonEdge(point, polygon)) return true;

    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; i++) {
        const a = polygon[i];
        const b = polygon[j];

        if (isEdgeCrossingY(a, b, point.y) && point.x < getEdgeXAtY(a, b, point.y)) {
            inside = !inside;
        }

        j = i;
    }
    
    return inside;
}

export const getNumberSuffix = (num: number): string => {
    const lastTwoDigits = num % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return "th";

    switch (lastTwoDigits % 10) {
        case 1:
            return "st";
        case 2:
            return "nd";
        case 3:
            return "rd";
        default:
            return "th";
    }
}

export const getNumberWithSuffix = (num: number): string => {
    return `${num}${getNumberSuffix(num)}`;
}

export const randomIntegerBetween = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export const randomNumberBetween = (min: number, max: number): number => {
    return Math.random() * (max - min) + min
};

export const isInteger = (value: number): boolean => {
    return typeof value === 'number' && value % 1 === 0;
}