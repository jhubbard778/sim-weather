import { bikeDynoToBikeModels, bikeModelToDyno, getHomologationString, getLatestBikeModelForDyno, getYearsForDyno } from "../../src/utils/BikeHelpers";

describe('bike dyno to years', () => {
    it('should return null when given bike without years', () => {
        expect(getYearsForDyno("125sx")).toBeNull();
        expect(getYearsForDyno("rs50cr")).toBeNull();
        expect(getYearsForDyno("250sxf")).toBeDefined(); // Should not be null, has years
    });

    it('should return correct years for bikes', () => {
        expect(getYearsForDyno("yz250f_se")).toEqual([2006]);
        expect(getYearsForDyno("fc450")).toEqual([2018, 2017]);
        expect(getYearsForDyno("250sxf")).toEqual([2018, 2017, 2016, 2013, 2009]);
        expect(getYearsForDyno("350sxf")).toEqual([2017, 2013, 2011]);
    });
});

describe('bike dyno to model names', () => {
    it('should return dyno only for non year dynos', () => {
        expect(bikeDynoToBikeModels("125sx")).toEqual(["125sx"]);
        expect(bikeDynoToBikeModels("rs50cr")).toEqual(["rs50cr"]);
        expect(bikeDynoToBikeModels("yz125")).toEqual(["yz125"]);
    });

    it('should return correct bike models for dynos with years', () => {
        expect(bikeDynoToBikeModels("yz250f_se")).toEqual(["yz250f_se(2006)"]);
        expect(bikeDynoToBikeModels("250sxf")).toEqual(["250sxf(2018)", "250sxf(2017)", "250sxf(2016)", "250sxf(2013)", "250sxf(2009)"]);
        expect(bikeDynoToBikeModels("fc250")).toEqual(["fc250(2018)", "fc250(2017)"]);
        expect(bikeDynoToBikeModels("350sxf")).toEqual(["350sxf(2017)", "350sxf(2013)", "350sxf(2011)"]);
    });

    it('should return correct skin version', () => {
        expect(bikeDynoToBikeModels("yz250f_se", "skin")).toEqual(["yz250f_sev2006"]);
        expect(bikeDynoToBikeModels("250sxf", "skin")).toEqual(["250sxfv2018", "250sxfv2017", "250sxfv2016", "250sxfv2013", "250sxfv2009"]);
        expect(bikeDynoToBikeModels("fc250", "skin")).toEqual(["fc250v2018", "fc250v2017"]);
        expect(bikeDynoToBikeModels("350sxf", "skin")).toEqual(["350sxfv2017", "350sxfv2013", "350sxfv2011"]);
    });
});

describe('bike dyno to latest model name', () => {
    it('should return bike dyno for dyno without year', () => {
        expect(getLatestBikeModelForDyno("125sx")).toBe("125sx");
        expect(getLatestBikeModelForDyno("rs50rm")).toBe("rs50rm");
        expect(getLatestBikeModelForDyno("cr125")).toBe("cr125");
    });

    it('should return correct bike model for dyno with year', () => {
        expect(getLatestBikeModelForDyno("fc250")).toBe("fc250(2018)");
        expect(getLatestBikeModelForDyno("350sxf")).toBe("350sxf(2017)");
        expect(getLatestBikeModelForDyno("250sx")).toBe("250sx(2012)");
        expect(getLatestBikeModelForDyno("250sxf")).toBe("250sxf(2018)");
    });
});

describe('bike model to dyno', () => {
    it('should return null when invalid bike model is given', () => {
        expect(bikeModelToDyno("mc125")).toBeNull();
        expect(bikeModelToDyno("fc350(2016)")).toBeNull();
        expect(bikeModelToDyno("250mcf(2025)")).toBeNull();
        expect(bikeModelToDyno("350sx(2026)")).toBeNull();
    });
    
    it('should return correct dyno for model without year', () => {
        expect(bikeModelToDyno("125sx")).toBe("125sx");
        expect(bikeModelToDyno("rs50cr")).toBe("rs50cr");
    });

    it('should return correct dyno for model with year', () => {
        expect(bikeModelToDyno("rmz250(2018)")).toBe("rmz250");
        expect(bikeModelToDyno("fc450(2018)")).toBe("fc450");
        expect(bikeModelToDyno("250sxf(2018)")).toBe("250sxf");
        expect(bikeModelToDyno("yz250f_se(2006)")).toBe("yz250f_se");
    });
});

describe('bike models to homolgation string', () => {
    it('should return correct homologation string', () => {
        expect(getHomologationString([
            "125sx", "cr125", "kx125", "rm125", "yz125"
        ])).toBe("125sx|cr125|kx125|rm125|yz125");

        expect(getHomologationString([
            "crf250", "kx250f", "rmz250", "yz250f", "yz250f_se"
        ])).toBe("crf250(2018)|crf250|kx250f|rmz250|yz250f|yz250f_se");

        expect(getHomologationString([
            "250sx", "cr250", "kx250", "rm250", "yz250"
        ])).toBe("250sx(2012)|250sx|cr250|kx250|rm250|yz250");

        expect(getHomologationString([
            "450sxf", "crf450", "kx450f", "rmz450", "yz450f", "350sxf"
        ])).toBe("450sxf(2018)|450sxf|crf450|kx450f|rmz450|yz450f|350sxf");

        expect(getHomologationString([
            "450sxf", "crf450", "kx450f", "rmz450", "yz450f", "350sxf"
        ], "crf450(2011)")).toBe("crf450(2011)|450sxf|crf450|kx450f|rmz450|yz450f|350sxf");

        expect(getHomologationString([
            "rs50cr", "rs50kx", "rs50rm", "rs50yz"
        ])).toBe("rs50cr|rs50kx|rs50rm|rs50yz");
    });
});