import synaptic = require("synaptic");
import { Solution } from "./evloution";

// neural network
class Network {
    public weights: number[];
    public network: synaptic.Network;

    // create network from weights and biases array
    public constructor(structure: number[], s: Solution) {
        const weights = s.map((w) => (w * 20) - 10);
        this.weights = weights;
        const randomNetwork = new synaptic.Architect.Perceptron(...structure);
        const json = randomNetwork.toJSON();
        const newConnections = json.connections.map((connection: any, i: any) => {
            connection.weight = weights[i];
            return connection;
        });
        const numConnections = json.connections.length;
        const newNeurons = json.neurons.map((neuron: any, i: any) => {
            neuron.bias = weights[i + numConnections];
            return neuron;
        });
        const newJson = {
            neurons: newNeurons,
            connections: newConnections,
        };
        this.network = synaptic.Network.fromJSON(newJson);
    }

    public feedForward = (inputs: number[]): number[] => {
        return this.network.activate(inputs);
    }
}

export { Network };
