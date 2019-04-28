import {renderArrows, renderRound, renderSite} from './display';
import {Episode} from './episode';
import {FullSite} from './place';

export class Game {

  constructor() {
    this.wire();
  }

  depart() {
    if (this.episodeRunner) {
      this.episodeRunner.depart();
    }
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
    // TODO Put wiring in display?
    let controls = document.querySelector('.control') as HTMLElement;
    // Sites.
    let arrows = [...controls.querySelectorAll('.arrows .arrow')];
    arrows[0].addEventListener('click', () => this.goRel(-1));
    arrows[1].addEventListener('click', () => this.goRel(1));
    let goButtons = [...controls.querySelectorAll('.arrows .go')];
    goButtons.forEach((button, index) => {
      button.addEventListener('click', () => this.goTo(index));
    });
    // Other.
    let depart = controls.querySelector('.depart .button') as HTMLElement;
    depart.addEventListener('click', () => this.depart());
  }

}

class EpisodeRunner {

  constructor(episode: Episode) {
    this.episode = episode;
  }

  async depart() {
    // TODO On last round, depart means to end or to capture/encounter?
    if (this.roundIndex < this.episode.rounds.length - 1) {
      this.roundIndex += 1;
      await this.startRound();
    }
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
    if (this.roundIndex == this.episode.rounds.length - 1) {
      // TODO Put rendering in display.
      let depart = document.querySelector('.depart') as HTMLElement;
      depart.classList.add('disabled');
    }
    renderRound(this.roundIndex, this.episode);
    await this.goTo(0);
  }

}
