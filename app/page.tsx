import React from "react";
import GalaxyMap from "./components/galaxy_map";
import Alert from "./components/alerts";
import MainContent from "./components/main_content";

async function Home() {

return (
  <main>
    <GalaxyMap />
    <Alert />
    <MainContent />
  </main>
);
}


export default Home