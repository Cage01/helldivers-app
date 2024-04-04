import React from "react";
import Logo from "./Logo";
import Button from "./patchNotes";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link } from "@nextui-org/react";
import {  SteamNews } from "@/app/types/api/steam/steam_news_types";
import './navbar.scss'

async function Navigation() {
  //TODO: need to store in DB and check for new updates. If none exists then use DB version
  const res_steam_news = await fetch('https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=' + process.env.NEXT_PUBLIC_STEAM_APP_ID + "&count=500")
  const news: SteamNews = await res_steam_news.json();

  return (
    <>
      <Navbar className="h-20 bg-gray-800 opacity-90">
        <NavbarBrand>
          <Logo />
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem isActive>
            <Link color="foreground" href="#" aria-current="page">
              Home
            </Link>
          </NavbarItem>
          <NavbarItem >
            
              <Link href="/timeline" isDisabled style={{color: "white"}}>
                Timeline
              </Link>
          </NavbarItem>
          <NavbarItem>
              <Link color="foreground" href="/coalitions" isDisabled>
                Coalitions
              </Link>
          </NavbarItem>
          <NavbarItem>
              <Link color="foreground" href="/newsfeed" isDisabled>
                News Feed
              </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem>
            <Button news={news} />
          </NavbarItem>
        </NavbarContent>
      </Navbar>
    </>

  );
};

export default Navigation;