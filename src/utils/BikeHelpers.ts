const categories = ["50", "125", "250", "250f", "450"] as const;

type CategoryName = typeof categories[number];

const bikesByCategory = {
    "50": [
        { name: "rs50cr" },
        { name: "rs50rm" },
        { name: "rs50kx" },
        { name: "rs50yz" }
    ],
    "125": [
        { name: "125sx" },
        { name: "rm125" },
        { name: "kx125" },
        { name: "yz125" },
        { name: "cr125" }
    ],
    "250": [
        { name: "250sx", years: [2012] },
        { name: "rm250", years: [2008] },
        { name: "yz250", years: [2012] },
        { name: "cr250", years: [2007] },
        { name: "kx250", years: [2006] }
    ],
    "250f": [
        { name: "250sxf", years: [2018, 2017, 2016, 2013, 2009] },
        { name: "fc250", years: [2018, 2017] },
        { name: "rmz250", years: [2018, 2017, 2016, 2013, 2009, 2008, 2007] },
        { name: "kx250f", years: [2018, 2017, 2016, 2013, 2009, 2008, 2007] },
        { name: "yz250f", years: [2018, 2017, 2016, 2013, 2009, 2008, 2007] },
        { name: "yz250f_se", years: [2006] },
        { name: "crf250", years: [2018, 2017, 2016, 2013, 2009, 2008, 2007] }
    ],
    "450": [
        { name: "450sxf", years: [2018, 2017, 2016, 2013, 2011] },
        { name: "350sxf", years: [2017, 2013, 2011] },
        { name: "fc450", years: [2018, 2017] },
        { name: "rmz450", years: [2018, 2017, 2016, 2013, 2011] },
        { name: "kx450f", years: [2018, 2017, 2016, 2013, 2011] },
        { name: "yz450f", years: [2018, 2017, 2016, 2013, 2011] },
        { name: "crf450", years: [2018, 2017, 2016, 2013, 2011] }
    ]
} as const;


type CategoryInfo = typeof bikesByCategory[CategoryName];
export type BikeDynoName = CategoryInfo[number]["name"];
type Bike = { name: BikeDynoName, years?: number[] }

type OutputBikeModelType = "skin" | "game";

const uncategorizedBikes = Object.keys(bikesByCategory).reduce((acc, key) => {
    return acc.concat(bikesByCategory[key as CategoryName] as unknown as Bike[]);
}, [] as Bike[]);

const bikeMap = uncategorizedBikes.reduce((acc, bike) => {
    acc[bike.name] = bike.years ?? null;
    return acc;
}, {} as Record<BikeDynoName, number[]|null>);

export const bikeDynoToBikeModels = (bike: BikeDynoName, outputType: OutputBikeModelType = "game"): string[] => {
    if (!bikeMap.hasOwnProperty(bike)) return [];

    const years = getYearsForDyno(bike);
    if (!years) return [bike];

    return years.map((year) => {
        const bikeWithYear = `${bike}(${year})`;
        return outputType === "skin" ? bikeModelGameToSkin(bikeWithYear) : bikeWithYear;
    });
}

export const getYearsForDyno = (bike: BikeDynoName): number[]|null => {
    return bikeMap.hasOwnProperty(bike)
        ? bikeMap[bike] : null;
}

export const getLatestYearForDyno = (bike: BikeDynoName): number|null => {
    const years = getYearsForDyno(bike);
    if (!years || years.length === 0) return null;

    return years.sort((a, b) => b - a)[0];
}

export const bikeCategoryToBikeModels = (category: CategoryName, outputType: OutputBikeModelType = "game"): string[] => {
    return bikesByCategory[category].map((bikeDyno): string[] => {
        return bikeDynoToBikeModels(bikeDyno as unknown as BikeDynoName, outputType);
    }).reduce((acc, bikes): string[] => {
        return acc.concat(bikes);
    }, [] as string[]);
}

export const allBikeDynos: BikeDynoName[] = Object.keys(bikeMap) as BikeDynoName[];

export const allBikeModels = (Object.keys(bikeMap) as BikeDynoName[]).map((bike): string[] => {
    return bikeDynoToBikeModels(bike);
}).reduce((acc, bikes): string[] => {
    return acc.concat(bikes);
}, [] as string[]);

export const bikeModelToDyno = (bikeModel: string): BikeDynoName|null => {
    const parenthesisIndex = bikeModel.indexOf("(");
    const bikeWithoutYear = parenthesisIndex >= 0 ? bikeModel.slice(0, parenthesisIndex) : bikeModel;

    if (!bikeMap.hasOwnProperty(bikeWithoutYear)) return null;

    return bikeWithoutYear as BikeDynoName;
}

export const getLatestBikeModelForDyno = (bike: BikeDynoName, outputType: OutputBikeModelType = "game"): string => {
    const latestYear = getLatestYearForDyno(bike);
    if (!latestYear) return bike;

    const bikeWithYear = `${bike}(${latestYear})`;
    return outputType === "skin" ? bikeModelGameToSkin(bikeWithYear) : bikeWithYear;
}

export const bikeModelGameToSkin = (bike: string): string => {
    return bike.replace(/\(([0-9]+)\)$/, "v$1")
}

export const bikeSkinToModelGame = (bike: string): string => {
    return bike.replace(/v([0-9]+)$/, "($1)")
}

export const getHomologationString = (bikes: BikeDynoName[], defaultBike?: string): string => {
    if (bikes.length === 0) return "";

    const firstBike = bikes[0];
    
    let defaultDyno = bikeModelToDyno(defaultBike ?? '');
    const fallbackBike = !!defaultDyno && bikes.indexOf(defaultDyno) >= 0
        ? defaultBike : getLatestBikeModelForDyno(firstBike);

    if (fallbackBike === firstBike) return bikes.join("|");

    return `${fallbackBike}|${bikes.join("|")}`;
}