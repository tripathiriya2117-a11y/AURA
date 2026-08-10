import { AuraAppPlanetProvider } from "./aura-app.provider";

async function testPlanet() {
  const provider = new AuraAppPlanetProvider();

  const data = await provider.getPlanetContext("design-studio");

  console.log(JSON.stringify(data, null, 2));
}

testPlanet();