import { Network } from "./network";

const sigmoid = (x: number): number => {
    return Math.exp(x) / (Math.exp(x) + 1);
};

const rectangleCollision =
  (x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number) => {
    const hw1 = w1 / 2;
    const hw2 = w2 / 2;
    const hh1 = h1 / 2;
    const hh2 = h2 / 2;
    const l1 = x1 - hw1;
    const l2 = x2 - hw2;
    const r1 = x1 + hw1;
    const r2 = x2 + hw2;
    const t1 = y1 + hh1;
    const t2 = y2 + hh2;
    const b1 = y1 - hh1;
    const b2 = y2 - hh2;
    return (l1 < r2 && r1 > l2 && t1 > b2 && b1 < t2);
};

class FlappyBirds {
    public turn: number;
    public targetsHit: boolean[];
    public targets: number[];
    public player: {
        position: number;
        velocity: number;
        alive: boolean;
    };
    public logic: Network;
    public X = 1000;
    public Y = 500;
    public TARGET_SIZE = 50;
    public PLAYER_SIZE = 5;
    public ACCELERATION = -0.3;
    public TOP_SPEED = 7;

    public constructor(n: Network, targets: number[]) {
        this.turn = 0;
        this.targetsHit = targets.map(() => false);
        this.targets = targets;
        this.player = {
            position: 0.6 * this.Y,
            velocity: 0,
            alive: true,
        };
        this.logic = n;
    }

    public getState = (): number[] => {
        const state = [];
        const targetPositions = this.targets
            .map( (t: number, i: number) => [i, ((1 + i) * 0.5 * this.X) - (this.turn * 5)] );
        const nextTarget = targetPositions.find( (t) => (t[1] + (this.TARGET_SIZE / 2)) > 0.02 * this.X );
        if (!nextTarget) {
            return [];
        }
        state.push(this.targets[nextTarget[0]]);
        state.push(nextTarget[1] / this.X);
        state.push(this.player.position / this.Y);
        state.push(sigmoid(this.player.velocity));
        return state;
    }

    public nextMove = (): boolean | null => {
        const state = this.getState();
        if (state === [] || !this.player.alive) {
            return null;
        }
        const output = this.logic.feedForward(state);
        return (output[0] > 0.5);
    }

    public move = (tap: boolean | null): void => {
        if (!this.player.alive || tap === null) {
            return;
        }
        this.turn += 1;
        const prevPosition = this.player.position;
        this.player.position += this.player.velocity;
        this.player.velocity += this.ACCELERATION;
        if (tap) {
            this.player.velocity = this.TOP_SPEED;
        }
        const targetPositions = this.targets
            .map( (t: number, i: number) => [i, ((1 + i) * 0.5 * this.X) - (this.turn * 5)] );
        const nextTarget = targetPositions.find( (t) => (t[1] + (this.TARGET_SIZE / 2)) > 0.02 * this.X );
        if (nextTarget && !this.targetsHit[nextTarget[0]]) {
            const movementRectangle = [(0.02 * this.X), (this.player.position + prevPosition) / 2,
                this.PLAYER_SIZE, this.PLAYER_SIZE + Math.abs(this.player.position - prevPosition)];
            const targetRectangle = [nextTarget[1],
                (this.Y * this.targets[nextTarget[0]]), this.TARGET_SIZE, this.TARGET_SIZE];
            const args = movementRectangle.concat(targetRectangle);
            if (rectangleCollision.apply(this, args)) {
                this.targetsHit[nextTarget[0]] = true;
            }
        }
        if (this.player.position < 0) {
            this.player.alive = false;
        }
        if (this.player.position > this.Y) {
            this.player.alive = false;
        }
    }

    public getScore = () => {
        const targetsHitNumber = this.targetsHit.filter((h) => h).length;
        return this.turn + (500 * targetsHitNumber);
    }

    public play = (): number => {
        let done = false;
        while (!done) {
            const move = this.nextMove();
            if (move === null || !this.player.alive) {
                done = true;
            } else {
                this.move(move);
            }
        }
        return this.getScore();
    }
}

export { FlappyBirds };
