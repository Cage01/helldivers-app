import { MajorOrderType } from "../../../enums";

export type Assignment = {
    source: string,
    determinedType: MajorOrderType;
    enemyID: number,
    id32: number;
    progress: number[];
    expiresIn: number;
    setting: Setting;
}

export type Setting = {
    type: number;
    overrideTitle: string;
    overrideBrief: string;
    taskDescription: string;
    tasks: Task[];
    reward: Reward;
    flags: number;
}

export type Reward = {
    type: number;
    id32: number;
    amount: number;
}

export type Task = {
    planetIndex: number | undefined,
    planetName: string | undefined,
    type: number;
    values: number[];
    valueTypes: number[];
}

