import {generateEpisode} from './episode';
import {MinPlace} from './place';
import {renderPlace} from './ui';

addEventListener('load', main);

async function main() {
  // TODO If served from github, grab the commit id and use the explicit rev.
  // TODO Actually, that also requires the same js build, too, unless we
  // TODO remember the full list of things.
  let places =
    await (await fetch('places/places-en.json')).json() as MinPlace[];
  // console.log(places);
  let episode = generateEpisode(places);
  let round = episode.rounds[0];
  console.log(episode);
  renderPlace(round.place);
}
