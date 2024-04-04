import React from "react";
import GalaxyMap from "./components/galaxy_map";
import PlanetsView from "./components/planet_container/index";
import FirebaseInstance from "./classes/firebase";
import AtAGlance from "./components/overview";
import Alert from "./components/alerts";
import { Accordion, AccordionItem } from "@nextui-org/react";
import MainContent from "./components/main_content";

async function Home() {
  let firebase = new FirebaseInstance();
  let message = await firebase.getSiteMessage();

return (
  <main>
    <GalaxyMap />
    <Alert />
    <MainContent />
  </main>
);
}


export default Home