import {renderPlace} from './display';
import {Episode} from './episode';

export class Game {

  constructor() {
    this.wire();
  }

  episode?: Episode;

  roundIndex = 0;

  async startEpisode(episode: Episode) {
    console.log(episode);
    this.episode = episode;
    this.roundIndex = 0;
    await this.startRound();
  }

  async startRound() {
    let round = this.episode!.rounds[0];
    await renderPlace(round.place);
  }

  wire() {
    let controls = document.querySelector('.control') as HTMLElement;
    let arrows = [...controls.querySelector('.arrows')!.children];
    arrows[0].addEventListener('click', () => console.log('prev'));
    arrows.slice(-1)[0].addEventListener('click', () => console.log('next'));
    arrows.slice(1, -1).forEach((button, index) => {
      button.addEventListener('click', () => console.log(`go to ${index}`));
    })
  }

}
