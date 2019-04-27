// import {Round} from './episode';
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

export async function renderSite(site: FullSite) {
  // Image.
  let img = document.querySelector('.photo img') as HTMLImageElement;
  await setImgSrc(img, site.image);
  // Controls.
  (document.querySelector('.control') as HTMLElement).style.display = 'flex';
  // Heading.
  let headingKids = document.querySelector('h1')!.children;
  headingKids[0].textContent = site.name;
  headingKids[1].textContent = site.name == site.nameUi ? '' : site.nameUi;
  // Text.
  document.querySelector('.clue')!.textContent = 'Clue for the next place.';
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