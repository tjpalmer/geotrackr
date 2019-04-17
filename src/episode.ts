import {MinSite, Place} from './place';

type int = number;

interface Episode {
  //
  rounds: Round[];
}

interface EpisodeOptions {
  cluesPerPlace?: int;
  placesPerEpisode?: int;
  randInt?: () => int;
}

interface Round {
  placeIndex: int;
  siteIndices: int[];
}

function generateEpisode(places: Place<MinSite>[], options: EpisodeOptions) {
  // Extract options, including defaults.
  let {cluesPerPlace, placesPerEpisode, randInt} = Object.assign({
    cluesPerPlace: 5,
    // There are 5 places to guess and also a starting place.
    placesPerEpisode: 6,
    random: () => crypto.getRandomValues(new Uint32Array(1))[0],
  }, options);
  // Pick each place.
  let previousRound: Round | undefined;
  let rounds = [] as Round[];
  for (let p = 0; p < placesPerEpisode; ++p) {
    let placeIndex = randInt() % places.length;
    let {sites} = places[placeIndex];
    // Sites.
    let siteIndices = [] as int[];
    for (let s = 0; s < cluesPerPlace; ++s) {
      siteIndices.push(randInt() % sites.length);
    }
    // Clues.
    if (previousRound) {
      //
    }
  }
}

class EpisodeGenerator {

  constructor(options: EpisodeOptions) {
    //
  }

}
