import {load} from 'cheerio';
import {existsSync, statSync, readdirSync, readFileSync} from 'fs';
import {join} from 'path';

interface Place {
  name: string;
  point: Point2;
}

type Point2 = [number, number];

function process() {
  let root = './places';
  let places = [] as Place[];
  readdirSync(root).forEach(kid => {
    let kidFull = join(root, kid);
    if (statSync(kidFull).isDirectory()) {
      let docName = join(kidFull, `${kid}.html`);
      if (existsSync(docName)) {
        let doc = load(readFileSync(docName));
        let name = doc('title').text();
        places.push({
          name: doc('title').text(),
          point: parsePoint(doc('#point').text()),
        })
      }
    }
  });
  console.log(JSON.stringify(places));
}

function parsePoint(pointText: string): Point2 {
  let match = pointText.match(/([0-9.]+)° ([NS]), ([0-9.]+)° ([EW])/)!;
  let x = Number(match[3]);
  x *= match[4] == 'E' ? 1 : -1;
  let y = Number(match[1]);
  y *= match[2] == 'N' ? 1 : -1;
  return [x, y];
}

process();
