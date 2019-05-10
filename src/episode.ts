import {Random} from './random';
import {FullSite, MinPlace, MinSite} from './place';
import {fetchObjectUri} from './util';

export type int = number;
export type Clue = string;

export interface ClueSite {
  clue?: int | string;
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
  // Generate the episode choices in advance.
  let episode = new EpisodeGenerator(places, options).generate();
  let {rounds} = episode;
  // Load site data.
  await Promise.all(rounds.map(async round => {
    let {place} = round;
    // Update place sites.
    // Start image requests for just those needed for the round.
    let imageRequests = Promise.all(round.sites.map(async clueSite => {
      let {site} = clueSite;
      // TODO Remember to URL.revokeObjectURL() after each round?
      site.image = await fetchObjectUri(`places/${place.id}/${site.image}`);
    }));
    // Load the text data.
    let text =
      await (await fetch(`places/${place.id}/${place.id}.html`)).text();
    let data = new DOMParser().parseFromString(text, "text/html");
    // Clues.
    place.clues = [...data.querySelectorAll('#clues > *')].map(
      clueBox => clueBox.innerHTML,
    );
    // Sites, and easier just to get them all, since they come bundled.
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
    // Now let the images finish.
    await imageRequests;
  }));
  // Fill in the clues.
  rounds.slice(0, -1).forEach((round, roundIndex) => {
    // We just put in the strings above.
    let clues = rounds[roundIndex + 1].place.clues as string[];
    round.sites.forEach(site => {
      // And all but the last round has clue indices for where's next.
      site.clue = clues[site.clue as number];
    });
  });
  // Done.
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
  clue?: number;
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

function buildClueSite({clue, nextPlace, random, site}: ClueContext) {
  return {clue, site} as ClueSite;
}

function permutation(random: Random, count: int) {
  return random.shuffled([...Array<int>(count).keys()]);
}

function sampleClues(context: SitesContext) {
  let {cluesPerPlace, nextPlace, random} = context;
  return nextPlace ?
    permutation(random, nextPlace.clues.length).slice(0, cluesPerPlace) :
    [];
}

function sampleReplacedSites(context: SitesContext) {
  let {cluesPerPlace, nextPlace, place, random} = context;
  let clues = sampleClues(context);
  return [...Array(cluesPerPlace).keys()].map((_, index) => {
    // TODO This samples with replacement. Probably just shuffle instead.
    let site = random.nextItem(place.sites);
    return buildClueSite({clue: clues[index], nextPlace, random, site});
  });
}

function sampleShuffledSites(context: SitesContext) {
  let {cluesPerPlace, nextPlace, place, random} = context;
  let clues = sampleClues(context);
  // Keep the overview first.
  let sites = [place.sites[0]];
  // Then shuffle the rest.
  sites.push(...random.shuffled(place.sites.slice(1)));
  // But keep only a subset, in case we have more than required.
  return sites.slice(0, cluesPerPlace).map((site, index) => {
    return buildClueSite({clue: clues[index], nextPlace, random, site});
  });
}
