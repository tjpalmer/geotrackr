export interface FullSite extends MinSite {
  credit: string;
  name: string;
  nameUi: string;
}

export interface MinSite {
  image: string;
}

export interface Place<Site extends MinSite> {
  id: string;
  lang: string;
  name: string;
  nameUi: string;
  point: Point2;
  sites: Site[];
}

export type Point2 = [number, number];