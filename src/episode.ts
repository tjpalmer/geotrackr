import {Random} from './random';
import {FullSite, MinPlace, MinSite} from './place';
import {fetchObjectUri} from './util';

export type int = number;
export type Clue = string;

export interface ClueSite {
  clue: Clue;
  site: MinSite;
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

export async function generateEpisode(
  places: MinPlace[], options: EpisodeOptions = {},
) {
  let episode = new EpisodeGenerator(places, options).generate();
  await Promise.all(episode.rounds.map(async round => {
    let {place} = round;
    // Update place sites, which are the same sites as for the round.
    // TODO If we reach a point of more sites than use with shuffling, load the
    // TODO round clue sites rather than all the place sites.
    let imageRequests = Promise.all(place.sites.map(async site => {
      // TODO Remember to URL.revokeObjectURL() after each round?
      site.image = await fetchObjectUri(`places/${place.id}/${site.image}`);
    }));
    let text =
      await (await fetch(`places/${place.id}/${place.id}.html`)).text();
    let data = new DOMParser().parseFromString(text, "text/html");
    [...data.querySelectorAll('#sites > *')].forEach((siteBox, siteIndex) => {
      let site = place.sites[siteIndex] as FullSite;
      // Names.
      let heading = siteBox.querySelector('h2')!;
      let divs = heading.children;
      site.name = divs[0].textContent!;
      // TODO Extract by game language. Or have files extracted for each lang?
      site.nameUi = divs[1].textContent!;
      // Credit.
      let credit = siteBox.querySelector('.credit')!;
      site.credit = credit.innerHTML;
    })
    await imageRequests;
  }));
  return episode;
}

class EpisodeGenerator {

  constructor(places: MinPlace[], options: EpisodeOptions = {}) {
    let {seed} = options;
    let random = new Random(seed);
    Object.assign(
      this,
      // Defaults.
      {
        cluesPerPlace: 5,
        roundsPerEpisode: 5 + 1,
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
    // The random selection order has to be constant here.
    // Select places without replacement, for better variety.
    let places =
      this.random.shuffled(this.places).slice(0, this.roundsPerEpisode);
    let rounds =
      places.map((place, index) => this.nextRound(place, places[index + 1]));
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

  nextRound(place: MinPlace, nextPlace?: MinPlace): Round {
    // Important! The order of generation can't be changed, or else it breaks
    // deterministic generation!
    let {cluesPerPlace, places, random, roundsPerEpisode} = this;
    // Current place and next.
    nextPlace = this.roundIndex < roundsPerEpisode ?
      random.nextItem(places) :
      undefined;
    // Sites.
    let sitesContext = {cluesPerPlace, nextPlace, place, random};
    let sites = cluesPerPlace > place.sites.length ?
      sampleReplacedSites(sitesContext) :
      sampleShuffledSites(sitesContext);
    // Update and done.
    this.roundIndex += 1;
    return {place, sites};
  }

  cluesPerPlace!: int;

  places!: MinPlace[];

  roundsPerEpisode!: int;

  random!: Random;

  roundIndex = 0;

  seed!: int;

}

// Private.

interface ClueContext {
  nextPlace?: MinPlace;
  random: Random;
  site: MinSite;
}

interface SitesContext {
  cluesPerPlace: number;
  nextPlace?: MinPlace;
  place: MinPlace;
  random: Random;
}

function buildClueSite({nextPlace, random, site}: ClueContext) {
  let clue = '';
  // Generate numbers now even if not used yet, for consistent production.
  // TODO Remove this once really getting clues.
  // TODO Do we get any "clues" at the last place?
  if (nextPlace) {
    random.nextInt(0, nextPlace!.sites.length);
  }
  return { clue, site } as ClueSite;
}

function sampleReplacedSites(context: SitesContext) {
  let {cluesPerPlace, nextPlace, place, random} = context;
  return [...Array(cluesPerPlace).keys()].map(() => {
    // TODO This samples with replacement. Probably just shuffle instead.
    let site = random.nextItem(place.sites);
    return buildClueSite({nextPlace, random, site});
  });
}

function sampleShuffledSites(context: SitesContext) {
  let {cluesPerPlace, nextPlace, place, random} = context;
  // Keep the overview first.
  let sites = [place.sites[0]];
  // Then shuffle the rest.
  sites.push(...random.shuffled(place.sites.slice(1)));
  // But keep only a subset, in case we have more than required.
  return sites.slice(0, cluesPerPlace).map(site => {
    return buildClueSite({nextPlace, random, site});
  });
}
