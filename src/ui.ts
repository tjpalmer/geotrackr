// import {Round} from './episode';
import {MinPlace} from './place';

export async function renderPlace(place: MinPlace) {
  let img = document.querySelector('.photo img') as HTMLImageElement;
  img.src = await loadImageData(`places/${place.id}/${place.sites[0].image}`);
}

async function loadImageData(uri: string) {
  return URL.createObjectURL(await (await fetch(uri)).blob());
}
