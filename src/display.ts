import {ClueSite, Episode} from './episode';
import {FullSite, MinPlace} from './place';

export function renderArrows(siteIndex: number) {
  let controls = document.querySelector('.control') as HTMLElement;
  let goButtons = [...controls.querySelectorAll('.arrows .go')];
  goButtons.forEach((element, index) => {
    let button = element as HTMLElement;
    if (siteIndex == index) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  })
}

export function renderRound(roundIndex: number, episode: Episode) {
  let box = document.querySelector('.round') as HTMLElement;
  let roundNumber = roundIndex + 1;
  let {length} = episode.rounds;
  box.textContent = roundNumber < length ?
    `Round ${roundNumber}/${length - 1}` :
    `Finale`;
}

export async function renderSite(clueSite: ClueSite) {
  let site = clueSite.site as FullSite;
  // Image.
  let img = document.querySelector('.photo img') as HTMLImageElement;
  await setImgSrc(img, site.image);
  let creditText = document.querySelector('.creditText') as HTMLElement;
  creditText.innerHTML = site.credit;
  // Controls.
  (document.querySelector('.control') as HTMLElement).style.display = 'flex';
  // Heading.
  let headingKids = document.querySelector('h1')!.children;
  headingKids[0].textContent = site.name;
  headingKids[1].textContent = site.name == site.nameUi ? '' : site.nameUi;
  // Text.
  document.querySelector('.clue')!.innerHTML =
    typeof clueSite.clue == 'string' ?
      `The next place is ${clueSite.clue}.` :
      '';
}

function setImgSrc(img: HTMLImageElement, src: string): Promise<void> {
  img.src = src;
  return new Promise((resolve, reject) => {
    if (img.complete) {
      resolve();
    }
    img.addEventListener('error', onError);
    img.addEventListener('load', onLoad);
    // Functions.
    function detach() {
      img.removeEventListener('error', onError);
      img.removeEventListener('load', onLoad);
    }
    function onError(event: ErrorEvent) {
      detach();
      reject(new Error(event.message));
    }
    function onLoad() {
      detach();
      resolve();
    }
  });
}
