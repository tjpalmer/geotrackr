import {renderArrows, renderSiteImage, renderRound, renderSite, renderPoint} from './display';
import {Episode, generateEpisode} from './episode';
import {MinPlace, Point2} from './place';

export interface GameData {
  places: MinPlace[];
}

export class Game {

  constructor(data: GameData) {
    Object.assign(this, data);
    this.wire();
  }

  depart() {
    if (this.episodeRunner) {
      this.hideCredit();
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

  hideCredit() {
    let {classList} = document.querySelector('.credit') as HTMLElement;
    classList.remove('expanded');
  }

  places!: MinPlace[];

  pointAt(event: MouseEvent) {
    event.preventDefault();
    let credit = document.querySelector('.credit') as HTMLElement;
    if (event.buttons & 1) {
      credit.style.pointerEvents = 'none';
      let bounds = (event.target as HTMLElement).getBoundingClientRect();
      let x = (event.x - bounds.left) / bounds.width;
      let y = (event.y - bounds.top) / bounds.height;
      if (this.episodeRunner) {
        this.episodeRunner.pointAt([x, y]);
      }
    } else {
      credit.style.pointerEvents = 'auto';
    }
  }

  async run() {
    let episode = await generateEpisode(this.places);
    await this.startEpisode(episode);
  }

  async startEpisode(episode: Episode) {
    this.episodeRunner = new EpisodeRunner({episode, game: this});
    await this.episodeRunner.start();
  }

  toggleCredit() {
    let {classList} = document.querySelector('.credit') as HTMLElement;
    if (classList.contains('expanded')) {
      classList.remove('expanded');
    } else {
      classList.add('expanded');
    }
  }

  wire() {
    // TODO Put wiring in display?
    // Meta things.
    let credit = document.querySelector('.credit') as HTMLElement;
    let creditButton = credit.querySelector('.button')!;
    creditButton.addEventListener('click', () => this.toggleCredit());
    // Map click handling.
    let photo = document.querySelector('.photo img') as HTMLElement;
    photo.addEventListener('mousedown', event => this.pointAt(event));
    photo.addEventListener('mousemove', event => this.pointAt(event));
    photo.addEventListener('mouseup', event => this.pointAt(event));
    // Game controls.
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

interface EpisodeRunnerData {
  episode: Episode;
  game: Game;
}

class EpisodeRunner {

  constructor(data: EpisodeRunnerData) {
    Object.assign(this, data);
  }

  cancelDepart() {
    if (this.departing) {
      this.departing = false;
      document.querySelector('.depart .button')!.textContent = 'Depart';
      renderPoint();
    }
  }

  async chooseDestination() {
    await renderSiteImage(this.episode.world);
  }

  async depart() {
    // TODO On last round, depart means to end or to capture/encounter?
    if (this.roundIndex < this.episode.rounds.length - 1) {
      if (this.departing) {
        this.roundIndex += 1;
        await this.startRound();
      } else {
        this.departing = true;
        renderPoint(this.point);
        document.querySelector('.depart .button')!.textContent = 'Confirm';
        await this.chooseDestination();
      }
    }
  }

  departing = false;

  episode!: Episode;

  game!: Game;

  async goRel(siteStep: number) {
    let {length} = this.round.sites;
    let siteIndex = (this.siteIndex + siteStep) % length;
    if (siteIndex < 0) {
      siteIndex += length;
    }
    await this.goTo(siteIndex);
  }

  async goTo(siteIndex: number) {
    this.cancelDepart();
    this.siteIndex = siteIndex;
    renderArrows(siteIndex);
    await renderSite(this.site);
  }

  point?: Point2;

  pointAt(point: Point2) {
    if (!this.departing) {
      return;
    }
    this.point = point;
    renderPoint(point);
    if (false) {
      let latlon = [(0.5 - point[1]) * 180, (point[0] - 0.5) * 360];
      console.log(latlon);
    }
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
    this.point = undefined;
    if (this.roundIndex == this.episode.rounds.length - 1) {
      // TODO Put rendering in display.
      let depart = document.querySelector('.depart') as HTMLElement;
      depart.classList.add('disabled');
    }
    renderRound(this.roundIndex, this.episode);
    await this.goTo(0);
  }

}
