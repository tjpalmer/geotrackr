// import Prando from 'prando';
import {MinSite, Place} from './place';
import {compressToEncodedURIComponent, decompressFromEncodedURIComponent} from 'lz-string';

addEventListener('load', main);

async function main() {
  // TODO If served from github, grab the commit id and use the explicit rev.
  // TODO Actually, that also requires the same js build, too, unless we
  // TODO remember the full list of things.
  let places =
    await (await fetch('places/places-en.json')).json() as Place<MinSite>[];
  // console.log(places);
  let place = places[(Math.random() * places.length) | 0];
  console.log(place);
}

function exploreEpisodeEncoding(places: Place<MinSite>[]) {
  // TODO Maybe go back to the deterministic random numbers thing after all?
  // TODO The main issue is that we need to be careful that the logic for
  // TODO choosing the sequence doesn't change across code versions, but that's
  // TODO not hugely different than ensuring the serialization doesn't change.
  // TODO Also, is Prando as good as crypto.getRandomValues for uniformity?
  // TODO Is crypto.getRandomValues uniform or just random?
  // let prando = new Prando();
  // let seed = prando.nextInt(
  //   Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
  // prando = new Prando(seed);
  // console.log(seed);
  // console.log(prando.nextInt());
  // console.log(prando.nextArrayItem(places));
  // Following here is exploration of storing all the numbers together.
  let buffer = new ArrayBuffer(5 * 2 + 25);
  // let choices = crypto.getRandomValues(new Uint32Array(30));
  // let placeChoices = choices.slice(0, 5);
  // let siteChoices = choices.slice(5);
  // TODO Need to control endianness?!?
  let placeChoices = crypto.getRandomValues(new Uint16Array(buffer, 0, 5));
  for (let i in placeChoices) {
    placeChoices[i] %= places.length;
  }
  let siteChoices = crypto.getRandomValues(
    new Uint8Array(buffer, placeChoices.byteLength),
  );
  for (let i in siteChoices) {
    let place = places[((i as any as number) / 5) | 0];
    siteChoices[i] %= place.sites.length;
  }
  // let info = [Array.from(placeChoices), Array.from(siteChoices)];
  // console.log(info);
  // console.log(JSON.stringify(info));
  console.log(placeChoices, siteChoices);
  // console.log(compressToEncodedURIComponent(JSON.stringify(choices)));
  let choicesText =
    String.fromCharCode.apply(undefined, new Uint8Array(buffer));
  console.log(choicesText);
  // console.log(btoa(choicesText));
  // let compressed = compressToEncodedURIComponent(JSON.stringify(info));
  let compressed = compressToEncodedURIComponent(choicesText);
  console.log(compressed);
  let decompressed = decompressFromEncodedURIComponent(compressed);
  console.log(decompressed);
  let decBuffer = new ArrayBuffer(decompressed.length);
  for (let i = 0; i < decBuffer.byteLength; i += 1) {
    decBuffer[i] = decompressed.charCodeAt(i);
  }
  console.log(decBuffer);
  let index = placeChoices[0];
  console.log(index, places[index]);
}
