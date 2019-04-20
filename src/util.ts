export async function fetchObjectUri(uri: string) {
  return URL.createObjectURL(await (await fetch(uri)).blob());
}
