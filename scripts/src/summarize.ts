import {load} from 'cheerio';
import {existsSync, statSync, readdirSync, readFileSync} from 'fs';
import {join} from 'path';
import {MinSite, Place, Point2} from '../../src/place';

let langUi = 'en';

function process() {
  let root = './places';
  let places = [] as Place<MinSite>[];
  // TODO Extract this parsing for use in main code, too.
  // TODO Or extract a json file for each place and language?
  readdirSync(root).forEach(kid => {
    let kidFull = join(root, kid);
    if (statSync(kidFull).isDirectory()) {
      let docName = join(kidFull, `${kid}.html`);
      if (existsSync(docName)) {
        let doc = load(readFileSync(docName));
        let nameBox = doc('h1 > div').first();
        let lang = nameBox.attr('lang');
        places.push({
          id: kid,
          lang,
          name: nameBox.text(),
          nameUi: doc(`h1 > div[lang="${langUi}"]`).first().text(),
          point: parsePoint(doc('#point').text()),
          sites: doc('#sites').children().toArray().map(kidElement => {
            let kid = load(kidElement);
            return {
              // credit: kid('.credit').html()!.trim(),
              image: kid('img').attr('src'),
              // name: kid(`h2 > *[lang="${lang}"]`).first().text(),
              // nameUi: kid(`h2 > *[lang="${langUi}"]`).first().text(),
            };
          }),
        })
      }
    }
  });
  console.log(JSON.stringify(places, undefined, 2));
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
