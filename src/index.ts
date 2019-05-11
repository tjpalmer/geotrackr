import {generateEpisode} from './episode';
import {Game} from './game';
import {MinPlace} from './place';
import {fetchObjectUri} from './util';

addEventListener('load', main);

async function main() {
  // TODO If served from github, grab the commit id and use the explicit rev.
  // TODO Actually, that also requires the same js build, too, unless we
  // TODO remember the full list of things.
  let places = (async () =>
    await (await fetch('places/places-en.json')).json() as MinPlace[]
  )();
  let worldImage = fetchObjectUri(`places/world/world.webp`);
  let worldCredit = (async () =>
    await (await fetch('places/world/world.txt')).text()
  )();
  // console.log(places);
  let game = new Game({
    places: await places,
    world: {credit: await worldCredit, image: await worldImage},
  });
  await game.run();
}
