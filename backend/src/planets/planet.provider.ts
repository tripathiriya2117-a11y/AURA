export type PlanetItem = {
  id: string;
  title: string;
  type: "text" | "link";
  content: string;
};

export type PlanetCollection = {
  id: string;
  title: string;
  items: PlanetItem[];
};

export type PlanetSummary = {
  id: string;
  name: string;
};

export type PlanetContext = {
  id: string;
  name: string;
  collections: PlanetCollection[];
};

export interface PlanetProvider {
  getPlanets(): Promise<PlanetSummary[]>;
  getPlanetContext(planetId: string): Promise<PlanetContext>;
}