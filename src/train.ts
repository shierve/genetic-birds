import { Solution, Population } from "./evloution";
import { FlappyBirds } from "./game";
import fs = require("fs");
import Plotter = require("./plot");
import { Network } from "./network";

const STRUCT = [4, 6, 1];

const xorFitness = (s: Solution): number => {
    const nn = new Network([2, 4, 1], s);
    let totalError = 0;
    const res1 = nn.feedForward([0, 0])[0];
    // console.log("res", res1);
    totalError += res1;
    const res2 = nn.feedForward([0, 1])[0];
    totalError += 1 - res2;
    const res3 = nn.feedForward([1, 0])[0];
    totalError += 1 - res3;
    const res4 = nn.feedForward([1, 1])[0];
    totalError += res4;
    return 1 - totalError;
};

const flappyFitness = (s: Solution): number => {
    const nn = new Network(STRUCT, s);
    const targets = Array.from({length: 50}, () => Math.random());
    const game = new FlappyBirds(nn, targets);
    return game.play();
};

const now = new Date();

const generations = async (pop: Population, g: number) => {
    const winners = [];
    for (let i = 0; i < g; i += 1) {
        fs.writeFile("./out/temp/" + now.toISOString() + "-gen" + i.toString() + ".json", JSON.stringify(pop.solutions),
            (e) => {
                return;
            });
        winners.push(await pop.nextGeneration());
        Plotter({
            data: {
                average: pop.averageFitnesses,
                max: pop.maxFitnesses,
            },
            filename: "plot.png",
        });
    }
    return winners;
};

const structureLength = (s: number[]) => {
    return s
        .map((nodes, i) => {
            if (s[i - 1]) {
                return (s[i - 1] * nodes) + nodes;
            } else {
                return nodes;
            }
        })
        .reduce((acc, v) => acc + v, 0);
};

console.log("solution length: ", structureLength(STRUCT));

const p = new Population(500, structureLength(STRUCT), flappyFitness);

generations(p, 25)
.then((winners) => {
    const winner = winners[winners.length - 1][0];
    // const nn = new Network([3, 4, 1], winner);
    // console.log("winner", winner);
    const population = p.solutions;
    fs.writeFileSync("./out/population.json", JSON.stringify(p.solutions));
});

// const p = new Population(100, 19, xorFitness);

// generations(p, 10)
// .then((winners) => {
//     const winner = winners[winners.length - 1][0];
//     const nn = new Network([2, 4, 1], winner);
//     // console.log("winner", winner);
//     const res1 = nn.feedForward([0, 0])[0];
//     const res2 = nn.feedForward([0, 1])[0];
//     const res3 = nn.feedForward([1, 0])[0];
//     const res4 = nn.feedForward([1, 1])[0];
//     console.log("answers", res1, res2, res3, res4);
//     Plotter({
//         data: {
//             average: p.averageFitnesses,
//             max: p.maxFitnesses,
//         },
//         filename: "plot.png",
//     });
// });
