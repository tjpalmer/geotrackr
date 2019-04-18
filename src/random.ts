export class Random {

	constructor(seed?: number) {
    if (!seed) {
      seed = crypto.getRandomValues(new Int32Array(1))[0] || 1;
    }
    this.state = seed;
	}

	next() {
		return this.state = xorshift32(this.state);
	}

	nextInt(min: number, max: number): number {
		return Math.floor(map(this.next(), min, max + 1));
	}

	nextItem<Item>(array: Item[]): Item {
		return array[this.nextInt(0, array.length - 1)];
	}

	state: number;

}

let i32Min = -0x80000000;
let i32Max = 0x7FFFFFFF;

function map(x: number, min: number, max: number) {
	return (x - i32Min) / (i32Max - i32Min) * (max - min) + min;
}

function xorshift32(x: number) {
	// See:
	// http://www.jstatsoft.org/v08/i14/paper
	// https://en.wikipedia.org/wiki/Xorshift
  x ^= x << 13;
  x ^= x >> 17;
  x ^= x << 5;
  return x;
}
