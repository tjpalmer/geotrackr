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

	nextItem<Item>(items: Item[]): Item {
		return items[this.nextInt(0, items.length - 1)];
	}

	shuffled<Item>(items: Item[]) {
		let result = items.slice();
		// For non-full samples, Vitter's Method D might be good.
		for (let i = result.length - 1; i > 0; i -= 1) {
			let j = this.nextInt(0, i);
			let temp = result[i];
			result[i] = result[j];
			result[j] = temp;
		}
		return result;
  }

	state: number;

}

let i32Min = -0x80000000;
let i32Max = 0x7FFFFFFF;

function map(x: number, min: number, max: number) {
	return (x - i32Min) / (i32Max - i32Min) * (max - min) + min;
}

// TODO Consider splitmix64 or others sometime.
function xorshift32(x: number) {
	// See:
	// http://www.jstatsoft.org/v08/i14/paper
	// https://en.wikipedia.org/wiki/Xorshift
  x ^= x << 13;
  x ^= x >> 17;
  x ^= x << 5;
  return x;
}
