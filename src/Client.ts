import api from "./config";

export type Agent = "Aki" | "Micko" | "Uki" | "Jocke";

export interface MapData {
    map_name: string;
    coins: Array<IPoint>;
}

export interface IPoint {
    x: number;
    y: number;
}

export interface IStep {
    step: number;
    to_node: number;
    from_node: number;
    cost: number;
}

export default class Client {
    /**
     *
     */
    static async getMapsData(): Promise<Array<MapData>> {
        const response = await api.get("/maps/");
        return response.data;
    }

    /**
     *
     */
    static async calculateSteps(mapName: string, agent: Agent) {
        const response = await api.post("/calculate/", {
            map: mapName,
            algorithm: agent,
        });

        return response.data;
    }
}
