import { faker } from "@faker-js/faker/locale/en";
import { allBikeModels, bikeModelGameToSkin } from "../../src/utils/BikeHelpers";

const firstLapLength = faker.number.int({min: 7, max: 34});
const normalLapLength = faker.number.int({min: 26, max: 50});

const serverData = {
    numbers: {
        drop_time: faker.number.float({min: 8, max: 14}),
        erode: 0, // Note: get_number returns 1024x this value
        finish_laps: faker.number.int({min: 2, max: 4}),
        finish_time: faker.helpers.arrayElement([10, 15, 20, 25, 30]),
        first_lap_length: firstLapLength,
        gate_count: firstLapLength + normalLapLength,
        holeshot_index: faker.number.int({min: 1, max: 5}),
        max_slots: 160,
        normal_lap_length: normalLapLength,
        race_time: faker.number.float({min: 0, max: 3600}),
        track_count: 1,
        ping: faker.number.int({min: 40, max: 120})
    } satisfies Record<MXServerNumberName, number>,

    numberArrays: {
      finish_laps_list: [],
      finish_time_list: [],
      muted: [],
      uid: [],
    } satisfies Record<MXServerNumberArrayName, number[]>,
    
    strings: {
      track_dir: 'trackinfo/waterloo.trackinfo',
      track_name: 'Waterloo Valley',
    } satisfies Record<MXServerStringName, string>,

    stringArrays: {
      bikeinfo: [] as string[],
      ignore: [] as Array<'ALL' | 'SPECS' | 'NONE'>,
      rank: [] as Array<'Nobody' | 'Marshal' | 'Admin'>,
      status: [] as Array<'Empty' | 'Reserved' | 'Spectator' | 'Player' | 'Zombie'>,
      track_list: [] as string[],
    } satisfies { [K in MXServerStringArrayName]: MXServerStringArrayValues[K][] },  
}

export const mxserverMock = {
    max_slots: 160,

    get_uid: vi.fn().mockImplementation(() => faker.number.int({min: 1, max: 60000})),
    get_rank: vi.fn().mockImplementation(() => faker.helpers.arrayElement(["Nobody", "Marshal", "Admin"])),
    get_status: vi.fn().mockImplementation(() => faker.helpers.arrayElement(["Empty", "Reserved", "Spectator", "Player", "Zombie"])),
    get_slot_info: vi.fn().mockImplementation((): SlotInfo => {
        const bike = faker.helpers.arrayElement(allBikeModels);
        return {
            bike: bike,
            bikeskin: bikeModelGameToSkin(bike),
            helmetskin: "",
            name: faker.person.fullName(),
            ping: faker.number.int({min: 40, max: 120}),
            rank: faker.helpers.arrayElement(["Admin", "Marshal", "Nobody"]),
            riderskin: "",
            status: faker.helpers.arrayElement(["Reserved", "Spectator", "Player", "Zombie"]),
            uid: faker.number.int({min: 1, max: 60000}),
            wheelskin: ""
        }
    }),

    file_to_string: vi.fn().mockReturnValue(""),
    string_to_file: vi.fn(),
    append_string_to_file: vi.fn(),

    system: vi.fn(),
    schedule_command: vi.fn(),
    
    broadcast: vi.fn(),
    send: vi.fn(),
    send_script_message: vi.fn(),
    write_demo_message: vi.fn(),
    write_demo_script_message: vi.fn(),

    log: vi.fn(),

    get_number: vi.fn((name: MXServerNumberName | MXServerNumberArrayName, index?: number) => {
          if (name in serverData.numbers) {
            return serverData.numbers[name as MXServerNumberName];
          }

          const arr = serverData.numberArrays[name as MXServerNumberArrayName];
          return index !== undefined ? arr[index] : arr;
        }) as {
          (name: MXServerNumberName): number;
          (name: MXServerNumberArrayName): number[];
          (name: MXServerNumberArrayName, index: number): number;
        },
    get_string: vi.fn(<T extends MXServerStringArrayName>(
          name: MXServerStringName | MXServerStringArrayName,
          index?: number
        ) => {
          if (name in serverData.strings) {
            return serverData.strings[name as MXServerStringName];
          }

          const arr = serverData.stringArrays[name as T];
          return index !== undefined ? arr[index] : arr;
        }) as {
          <T extends MXServerStringArrayName>(name: T, index: number): MXServerStringArrayValues[T];
          (name: MXServerStringArrayName): MXServerStringArrayValues[MXServerStringArrayName][];
          (name: MXServerStringName): string;
        },

    // Callback functions
    connect_handler: vi.fn(),
    disconnect_handler: vi.fn(),
    timing_handler: vi.fn(),

    info_handler: vi.fn(),
    command_handler: vi.fn(),
    chat_handler: vi.fn(),
    
    start_handler: vi.fn(),
    finish_handler: vi.fn(),
    
    tic_handler: vi.fn(),
    second_handler: vi.fn(),
    ready_handler: vi.fn(),
    script_message_handler: vi.fn()
};

export const setMockServerData = (overrides: {
  numbers?: Partial<typeof serverData.numbers>;
  numberArrays?: Partial<typeof serverData.numberArrays>;
  strings?: Partial<typeof serverData.strings>;
  stringArrays?: Partial<typeof serverData.stringArrays>;
}) => {
  if (overrides.numbers) Object.assign(serverData.numbers, overrides.numbers);
  if (overrides.numberArrays) Object.assign(serverData.numberArrays, overrides.numberArrays);
  if (overrides.strings) Object.assign(serverData.strings, overrides.strings);
  if (overrides.stringArrays) Object.assign(serverData.stringArrays, overrides.stringArrays);
}