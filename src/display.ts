// import {Round} from './episode';
import {FullSite, MinPlace} from './place';

export async function renderPlace(place: MinPlace) {
  // TODO Make sure we receive full places above, so to avoid casting.
  let site = place.sites[0] as FullSite;
  // Image.
  let img = document.querySelector('.photo img') as HTMLImageElement;
  await setImgSrc(img, site.image);
  // Controls.
  (document.querySelector('.control') as HTMLElement).style.display = 'flex';
  // Heading.
  let headingKids = document.querySelector('h1')!.children;
  headingKids[0].textContent = site.name;
  headingKids[1].textContent = site.nameUi;
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
