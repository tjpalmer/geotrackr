import {renderArrows, renderSite} from './display';
import {Episode} from './episode';
import {FullSite} from './place';

export class Game {

  constructor() {
    this.wire();
  }

  episodeRunner?: EpisodeRunner;

  goRel(siteStep: number) {
    if (this.episodeRunner) {
      this.episodeRunner.goRel(siteStep);
    }
  }

  goTo(siteIndex: number) {
    if (this.episodeRunner) {
      this.episodeRunner.goTo(siteIndex);
    }
  }

  async startEpisode(episode: Episode) {
    this.episodeRunner = new EpisodeRunner(episode);
    await this.episodeRunner.start();
  }

  wire() {
    let controls = document.querySelector('.control') as HTMLElement;
    // Going to sites.
    let arrows = [...controls.querySelectorAll('.arrows .arrow')];
    arrows[0].addEventListener('click', () => this.goRel(-1));
    arrows[1].addEventListener('click', () => this.goRel(1));
    let goButtons = [...controls.querySelectorAll('.arrows .go')];
    goButtons.forEach((button, index) => {
      button.addEventListener('click', () => this.goTo(index));
    })
  }

}

class EpisodeRunner {

  constructor(episode: Episode) {
    this.episode = episode;
  }

  episode: Episode;

  async goRel(siteStep: number) {
    let {length} = this.round.sites;
    let siteIndex = (this.siteIndex + siteStep) % length;
    if (siteIndex < 0) {
      siteIndex += length;
    }
    await this.goTo(siteIndex);
  }

  async goTo(siteIndex: number) {
    this.siteIndex = siteIndex;
    renderArrows(siteIndex);
    await renderSite(this.site.site as FullSite);
  }

  get round() {
    return this.episode.rounds[this.roundIndex];
  }

  roundIndex = 0;

  get site() {
    return this.round.sites[this.siteIndex];
  }

  siteIndex = 0;

  async start() {
    let {episode} = this;
    console.log(episode);
    this.episode = episode;
    this.roundIndex = 0;
    await this.startRound();
  }

  async startRound() {
    await this.goTo(0);
  }

}
