import {Random} from './random';
import {MinPlace, MinSite} from './place';

type int = number;
type Clue = string;

interface Episode {
  // TODO Criminal
  rounds: Round[];
}

interface EpisodeOptions {
  cluesPerPlace?: int;
  roundsPerEpisode?: int;
  seed?: int;
}

interface Round {
  clues: Clue[];
  nextPlace?: MinPlace;
  place: MinPlace;
  sites: MinSite[];
}

export class EpisodeGenerator {

  constructor(places: MinPlace[], options: EpisodeOptions = {}) {
    let {seed} = options;
    let random = new Random(seed);
    Object.assign(
      this,
      // Defaults.
      {
        cluesPerPlace: 5,
        roundsPerEpisode: 5,
      },
      // Options.
      options,
      // Explicits and overrides.
      {
        places,
        random,
        seed: random.state,
      },
    );
  }

  nextRound(): Round {
    // Important! The order of generation can't be changed, or else it breaks
    // deterministic generation!
    let {cluesPerPlace, nextPlace, places, random, roundsPerEpisode} = this;
    // Current place.
    let place = nextPlace || random.nextItem(places);
    // Sites.
    let sites = [...Array(cluesPerPlace).keys()].map(
      () => random.nextItem(place.sites),
    );
    // Next place and clues.
    let clues: Clue[];
    if (this.roundIndex < roundsPerEpisode) {
      nextPlace = random.nextItem(places);
      clues = [...Array(cluesPerPlace).keys()].map(() => '');
      // Generate numbers now even if not used yet, for consistent production.
      clues.forEach(() => random.nextInt(0, nextPlace!.sites.length));
    } else {
      // Do we get any "clues" at the last place?
      clues = [];
    }
    // Done.
    return {clues, nextPlace, place, sites};
  }

  cluesPerPlace!: int;

  nextPlace?: MinPlace = undefined;

  places!: MinPlace[];

  roundsPerEpisode!: int;

  random!: Random;

  roundIndex = 0;

  seed!: int;

}
