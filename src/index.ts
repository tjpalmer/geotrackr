import Prando from 'prando';
import {MinSite, Place} from './place';

addEventListener('load', main);

async function main() {
  // TODO If served from github, grab the commit id and use the explicit rev.
  let places =
    await (await fetch('places/places-en.json')).json() as Place<MinSite>[];
  console.log(places);
  let prando = new Prando();
  let seed = prando.nextInt(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
  prando = new Prando(seed);
  console.log(seed);
  console.log(prando.nextInt());
  console.log(prando.nextArrayItem(places));
}
