// =====================================================================
//  THIS IS THE ONLY FILE YOU NEED TO EDIT EACH WEEK
// =====================================================================
//
//  - List players in this order: goalkeeper first, then defenders,
//    then midfielders, then forwards (left to right in each line).
//  - "formation" is the outfield players from the back, e.g. "2-1-2".
//    The numbers must add up to (number of players - 1).
//    Leave it out and a sensible default is used for 5, 6, 7 or 8 a side.
//  - "photo" is a file inside the photos/ folder, e.g. "photos/joe.jpg".
//    Leave it as "" to show a placeholder.
//  - "position" is optional (GK, DEF, MID, FWD are filled in for you).
//  - "subs" is optional - just leave it as [] if there are none.
//
window.LINEUP = {
  date: "Monday 19 October",
  kickoff: "7:30pm",
  venue: "Arsenal Hub",

  teams: [
    {
      name: "Reds",
      colour: "#d7182a",
      formation: "2-1-2",
      players: [
        { name: "Kenny",   number: 1, photo: "" },
        { name: "Al",      number: 2, photo: "" },
        { name: "Dave",    number: 3, photo: "" },
        { name: "Andy",    number: 4, photo: "" },
        { name: "Mark",    number: 5, photo: "" },
        { name: "Chris",   number: 6, photo: "" },
      ],
      subs: [],
    },
    {
      name: "Blues",
      colour: "#1f5fd6",
      formation: "2-1-2",
      players: [
        { name: "Ted",     number: 1, photo: "" },
        { name: "Eduardo", number: 2, photo: "" },
        { name: "Justin",  number: 3, photo: "" },
        { name: "Dom",     number: 4, photo: "" },
        { name: "Joe C",   number: 5, photo: "" },
        { name: "Huw",     number: 6, photo: "" },
      ],
      subs: [],
    },
  ],
};
