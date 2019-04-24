import {renderPlace} from './display';
import {generateEpisode} from './episode';
import {Game} from './game';
import {MinPlace} from './place';

addEventListener('load', main);

async function main() {
  // TODO If served from github, grab the commit id and use the explicit rev.
  // TODO Actually, that also requires the same js build, too, unless we
  // TODO remember the full list of things.
  let places =
    await (await fetch('places/places-en.json')).json() as MinPlace[];
  // console.log(places);
  let game = new Game();
  let episode = await generateEpisode(places);
  await game.startEpisode(episode);
}
