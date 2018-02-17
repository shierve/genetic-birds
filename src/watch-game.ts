import { Network } from "./network";
import { FlappyBirds } from "./game";
import fs = require("fs");
import * as populationJson from "../out/population.json";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

canvas.width = window.screen.width;
canvas.height = window.screen.height;

const context = canvas.getContext("2d");
if (!context) {
    throw new Error("no context");
}

const targets = Array.from({length: 50}, () => Math.random());
const populationObj = JSON.parse(JSON.stringify(populationJson));
const indexes = Object.keys(populationObj);
const population = indexes.map((i) => populationObj[i]).reverse();
const N_PLAYERS = population.length;
const networks = population.map((p: number[]) => {
    return new Network([3, 6, 1], p);
});
// const player = new Network([3, 4, 1], population[0]);
const players = networks.map((n) => new FlappyBirds(n, targets));

const X = players[0].X;
const Y = players[0].Y;
const TARGET_SIZE = players[0].TARGET_SIZE;

const drawPlayer = (p: FlappyBirds, color = "blue") => {
    if (p.player.alive) {
        const position = p.player.position;
        const width = p.PLAYER_SIZE;
        context.fillStyle = color;
        context.fillRect((0.02 * X) - (width / 2), Y - (position) - (width / 2), width, width);
    }
};

let turn = 0;

window.requestAnimationFrame(function loop() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#DCDCDC";
    context.fillRect(0, 0, X, Y);

    const targetPositions = targets.map( (t: number, i: number) => [i, ((1 + i) * 0.5 * X) - (turn * 5)] );
    for (let i = 0; i < targets.length; i += 1) {
        context.fillStyle = "green";
        context.fillRect(targetPositions[i][1] - (TARGET_SIZE / 2), Y - (targets[i] * Y) - (TARGET_SIZE / 2),
        TARGET_SIZE, TARGET_SIZE);
    }

    players.forEach((p, i) => {
        if (i === N_PLAYERS - 1) {
            drawPlayer(p, "red");
        } else {
            drawPlayer(p);
        }
        p.move(p.nextMove());
    });

    turn += 1;
    window.requestAnimationFrame(loop);
});

document.addEventListener("mousedown", (event) => {
    if (event.button === 0) {
        // velocity = -7;
    }
});
