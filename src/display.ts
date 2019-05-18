import {Episode} from './episode';
import {ClueSiteChoice} from './game';
import {FullSite, Point2, SimpleSite} from './place';

export function renderArrows(
  info: {siteIndex: number, sites: ClueSiteChoice[]},
) {
  let controls = document.querySelector('.control') as HTMLElement;
  let goButtons = [...controls.querySelectorAll('.arrows .go')];
  goButtons.forEach((element, index) => {
    let button = element as HTMLElement;
    // Active.
    if (info.siteIndex == index) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
    // Used.
    if (info.sites[index].siteTagIndex != null) {
      button.classList.add('used');
    } else {
      button.classList.remove('used');
    }
  })
}

export function renderPoint(point?: Point2) {
  let pointBox = document.querySelector('.point') as HTMLElement;
  if (point) {
    pointBox.style.display = 'block';
    pointBox.style.left = `${point[0] * 100}%`;
    pointBox.style.top = `${point[1] * 100}%`;
  } else {
    pointBox.style.display = 'none';
  }
}

export function renderRound(roundIndex: number, episode: Episode) {
  let box = document.querySelector('.round') as HTMLElement;
  let roundNumber = roundIndex + 1;
  let {length} = episode.rounds;
  box.textContent = roundNumber < length ?
    `Round ${roundNumber}/${length - 1}` :
    `Finish`;
}

export async function renderSite(clueSite: ClueSiteChoice, end: boolean) {
  let site = clueSite.site as FullSite;
  // Image.
  await renderSiteImage(site);
  // Controls.
  (document.querySelector('.control') as HTMLElement).style.display = 'flex';
  // Heading.
  let headingKids = document.querySelector('h1')!.children;
  headingKids[0].textContent = site.name;
  headingKids[1].textContent = site.name == site.nameUi ? '' : site.nameUi;
  // Text.
  let clueBox = document.querySelector('.clue') as HTMLElement;
  clueBox.innerHTML = typeof clueSite.clue == 'string' ?
    `The next place is ${clueSite.clue}.` :
    '';
  let wantClueBox = document.querySelector('.wantClue') as HTMLElement;
  if (clueSite.siteTagIndex == null && !end) {
    clueBox.style.display = 'none';
    wantClueBox.style.display = 'block';
  } else {
    clueBox.style.display = 'block';
    wantClueBox.style.display = 'none';
  }
}

export async function renderSiteImage(site: SimpleSite) {
  let img = document.querySelector('.photo img') as HTMLImageElement;
  await setImgSrc(img, site.image);
  let creditText = document.querySelector('.creditText') as HTMLElement;
  creditText.innerHTML = site.credit;
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
