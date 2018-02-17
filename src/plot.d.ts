import Plot = require('./plot');

declare namespace Plotter {
    export function plot(obj: any):any;
}

declare function plot (obj: any): any;
export = plot;