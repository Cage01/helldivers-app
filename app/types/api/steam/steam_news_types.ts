//TODO: consider making these interfaces for easy passing between client and server
export type SteamNews = {
    appnews: Appnews;
}

export type Appnews = {
    appid:     number;
    newsitems: Newsitem[];
    count:     number;
}

export type Newsitem = {
    gid:             string;
    title:           string;
    url:             string;
    is_external_url: boolean;
    author:          string;
    contents:        string;
    feedlabel:       string;
    date:            number;
    feedname:        string;
    feed_type:       number;
    appid:           number;
    tags?:           string[];
}
