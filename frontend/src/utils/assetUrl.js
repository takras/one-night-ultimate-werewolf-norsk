// GitHub Pages project sites are served from a subpath (e.g.
// /one-night-ultimate-werewolf-norsk/), not the domain root. Vite rewrites
// index.html and imported assets automatically, but runtime-constructed
// paths (character images, audio URLs from the API/manifest) need the base
// path applied by hand.
export function assetUrl(path) {
  return import.meta.env.BASE_URL + path.replace(/^\//, '');
}
