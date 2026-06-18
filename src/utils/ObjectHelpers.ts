export const objectEntries = <T extends object>(obj: T): [keyof T, T[keyof T]][] => {
    return Object.keys(obj).map((key) => [key as keyof T, obj[key as keyof T]]);
}

export const isObjectLiteral = (obj: any): obj is object => {
    return !!obj && typeof obj === 'object' && !Array.isArray(obj);
}