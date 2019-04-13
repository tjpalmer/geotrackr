addEventListener('load', main);

async function main() {
  // TODO If served from github, grab the commit id and use the explicit rev.
  let places = await (await fetch('places/places-en.json')).json();
  console.log(places);
}
