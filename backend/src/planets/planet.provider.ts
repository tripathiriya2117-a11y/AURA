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

export type PlanetContext = {
  id: string;
  name: string;
  collections: PlanetCollection[];
};

export interface PlanetProvider {
  getPlanetContext(planetId: string): Promise<PlanetContext>;
}