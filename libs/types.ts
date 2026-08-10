export type Gender = "male" | "female";
export type FanGroup = "Descendants" | "Angels";

export type FanPrefs = {
  shows: boolean;
  news: boolean;
  releases: boolean;
};

export type FanProfile = {
  artist: "Yarden";
  id: string;
  name: string;
  email: string;
  gender: Gender;
  group: FanGroup;
  prefs: FanPrefs;
  createdAt: string;
};
