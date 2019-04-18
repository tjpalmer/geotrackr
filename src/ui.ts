// import {Round} from './episode';
import {MinPlace} from './place';

export function renderPlace(place: MinPlace) {
  let image = document.querySelector('.photo img') as HTMLImageElement;
  image.src = `/places/${place.id}/${place.sites[0].image}`;
}
