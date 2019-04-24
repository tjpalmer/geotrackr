import {renderPlace} from './display';
import {Episode} from './episode';

export class Game {

  constructor() {
    this.wire();
  }

  episode?: Episode;

  roundIndex = 0;

  startEpisode(episode: Episode) {
    console.log(episode);
    this.episode = episode;
    this.roundIndex = 0;
    this.startRound();
  }

  startRound() {
    let round = this.episode!.rounds[0];
    renderPlace(round.place);
  }

  wire() {
    let controls = document.querySelector('.control') as HTMLElement;
    let arrows = [...controls.querySelector('.arrows')!.children];
    arrows[0].addEventListener('click', () => console.log('prev'));
    arrows.slice(-1)[0].addEventListener('click', () => console.log('next'));
  }

}
