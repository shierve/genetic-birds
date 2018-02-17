type Solution = number[];

// Generates a crossover solution from two solutions, has random change for mutation
const crossover = (w1: Solution, w2: Solution): Solution => {
    const randomBool = () => Math.random() < 0.5;
    const randomMutation = Math.random() < (1 / 2);
    const newWeights = w1.map((w, i) => {
        if (randomMutation) {
            const picker = Math.random() < (2 / w1.length);
            if (picker) {
                return Math.random();
            } else {
                const picker2 = randomBool();
                if (picker2) {
                    return w;
                } else {
                    return w2[i];
                }
            }
        } else {
            const picker = randomBool();
            if (picker) {
                return w;
            } else {
                return w2[i];
            }
        }
    });
    return newWeights;
};

const shuffle = (a: Solution[]) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

const reproduce = (survivors: Solution[], length: number): Solution[] => {
    const offspring = [];
    for (let i = 0; i < (length - 1); i += 1) {
        shuffle(survivors);
        offspring.push(crossover(survivors[0], survivors[1]));
    }
    return [survivors[0]].concat(offspring);
};

const randomSolution = (length: number): Solution => {
    return Array.from({length: (length)}, () => Math.random());
};

class Population {
    public size: number;
    public solutionLength: number;
    public currentGeneration: number;
    public averageFitnesses: number[];
    public maxFitnesses: number[];
    public solutions: Solution[];
    public fitnessFunction: (s: Solution) => number;

    public SURVIVORS = 4;

    public constructor(size: number, solutionLength: number, fitnessFunction: (s: Solution) => number) {
        this.size = size;
        this.solutionLength = solutionLength;
        this.currentGeneration = 0;
        this.averageFitnesses = [];
        this.maxFitnesses = [];
        this.solutions = Array.from({length: size}, () => randomSolution(solutionLength));
        this.fitnessFunction = fitnessFunction;
    }

    public fitnessPromise = (s: Solution): Promise<number> => {
        return new Promise((resolve, reject) => {
            const fitness = this.fitnessFunction(s);
            resolve(fitness);
        });
    }

    public nextGeneration = async (): Promise<Solution[]> => {
        console.log("Generation", this.currentGeneration);
        const fitnessPromises = this.solutions.map((s) => this.fitnessPromise(s));
        const fitnesses: number[] = await Promise.all(fitnessPromises);
        this.averageFitnesses.push( fitnesses.reduce((acc, f) => acc + f) / this.size );
        console.log("average fitness:", this.averageFitnesses[this.currentGeneration]);
        const indexedF = fitnesses.map((f, i) => [i, f]);
        const sortedF = indexedF.sort((a, b) => b[1] - a[1]);
        this.maxFitnesses.push(sortedF[0][1]);
        console.log("max fitness:", sortedF[0][1]);
        const survivorsI = sortedF.slice(0, this.SURVIVORS).map((s) => s[0]);
        const survivors = survivorsI.map((i) => this.solutions[i]);
        this.solutions = reproduce(survivors, this.size);
        this.currentGeneration += 1;
        return survivors;
    }

    public nextGenerationSync = (): Solution => {
        console.log("Generation", this.currentGeneration);
        const fitnesses = this.solutions.map((s) => this.fitnessFunction(s));
        this.averageFitnesses.push( fitnesses.reduce((acc, f) => acc + f) / this.size );
        console.log("average fitness:", this.averageFitnesses[this.currentGeneration]);
        const indexedF = fitnesses.map((f, i) => [i, f]);
        const sortedF = indexedF.sort((a, b) => b[1] - a[1]);
        console.log("max fitness:", sortedF[0][1]);
        const survivorsI = sortedF.slice(0, this.SURVIVORS).map((s) => s[0]);
        const survivors = survivorsI.map((i) => this.solutions[i]);
        this.solutions = reproduce(survivors, this.size);
        this.currentGeneration += 1;
        return survivors[0];
    }
}

export { Solution, Population };
