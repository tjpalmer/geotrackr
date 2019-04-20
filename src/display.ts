// import {Round} from './episode';
import {FullSite, MinPlace} from './place';

export function renderPlace(place: MinPlace) {
  // TODO Make sure we receive full places above, so to avoid casting.
  let site = place.sites[0] as FullSite;
  // Image.
  let img = document.querySelector('.photo img') as HTMLImageElement;
  img.src = site.image;
  // Heading.
  let headingKids = document.querySelector('h1')!.children;
  headingKids[0].textContent = site.name;
  headingKids[1].textContent = site.nameUi;
}
