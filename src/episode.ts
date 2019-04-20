import {Random} from './random';
import {MinPlace, MinSite} from './place';

export type int = number;
export type Clue = string;

export interface ClueSite extends MinSite {
  clue: Clue;
}

export interface Episode {
  // TODO Perpetrator
  rounds: Round[];
  seed: string;
}

export interface EpisodeOptions {
  cluesPerPlace?: int;
  roundsPerEpisode?: int;
  seed?: int;
}

export interface Round {
  place: MinPlace;
  sites: ClueSite[];
}

export function generateEpisode(
  places: MinPlace[], options: EpisodeOptions = {},
): Episode {
  return new EpisodeGenerator(places, options).generate();
}

// TODO Load all up front for full caching!
class EpisodeGenerator {

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

  generate(): Episode {
    // TODO Perp.
    // The order has to be constant here.
    let rounds =
      [...Array(this.roundsPerEpisode).keys()].map(() => this.nextRound());
    // Prep buffer for episode id.
    let data = new DataView(new ArrayBuffer(4));
    // Set with little endianness, since that's most common these days.
    // What matters is that we have it consistent and defined.
    data.setInt32(0, this.seed);
    // Convert to base64.
    // This doesn't get us far on just a 32 bit id, but we'll have git commit
    // ids and possibly more random seed size later.
    let seed = btoa(String.fromCharCode(...new Uint8Array(data.buffer)));
    console.log(seed);
    // Done.
    return {rounds, seed};
  }

  nextRound(): Round {
    // Important! The order of generation can't be changed, or else it breaks
    // deterministic generation!
    let {cluesPerPlace, nextPlace, places, random, roundsPerEpisode} = this;
    // Current place and next.
    let place = nextPlace || random.nextItem(places);
    nextPlace = this.roundIndex < roundsPerEpisode ?
      random.nextItem(places) :
      undefined;
    // Sites.
    // TODO Always include skyline with clue, or just without clue?
    let sites = [...Array(cluesPerPlace).keys()].map(() => {
      let site = random.nextItem(place.sites);
      let clue = '';
      // Generate numbers now even if not used yet, for consistent production.
      // TODO Remove this once really getting clues.
      // TODO Do we get any "clues" at the last place?
      if (nextPlace) {
        random.nextInt(0, nextPlace!.sites.length);
      }
      return Object.assign({clue}, site) as ClueSite;
    });
    // Update and done.
    this.nextPlace = nextPlace;
    this.roundIndex += 1;
    return {place, sites};
  }

  cluesPerPlace!: int;

  nextPlace?: MinPlace = undefined;

  places!: MinPlace[];

  roundsPerEpisode!: int;

  random!: Random;

  roundIndex = 0;

  seed!: int;

}
