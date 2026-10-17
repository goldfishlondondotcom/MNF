// =====================================================================
//  THIS IS THE ONLY FILE YOU NEED TO EDIT EACH WEEK
// =====================================================================
//
//  - There's no fixed keeper (it rotates), so nobody is shown in goal.
//  - List players from the back: defenders, then midfielders, then
//    forwards (left to right in each line).
//  - "formation" is the lines from the back, e.g. "2-2-2".
//    The numbers must add up to the number of players.
//    Leave it out and a sensible default is used for 5, 6, 7 or 8 a side.
//  - "photo" is a file inside the photos/ folder, e.g. "photos/joe.jpg".
//    Leave it as "" to show a placeholder.
//  - "position" is optional (DEF, MID, FWD are filled in for you).
//  - "subs" is optional - just leave it as [] if there are none.
//
window.LINEUP = {
  date: "Monday 19 October",
  kickoff: "7:30pm",
  venue: "Arsenal Hub",

  teams: [
    {
      name: "Bibs",
      colour: "#e8332d",
      formation: "2-2-2",
      players: [
        { name: "Andy",  number: 1, photo: "" },
        { name: "Kenny", number: 2, photo: "" },
        { name: "Mark",  number: 3, photo: "" },
        { name: "Ted",   number: 4, photo: "" },
        { name: "Dom",   number: 5, photo: "" },
        { name: "Huw",   number: 6, photo: "" },
      ],
      subs: [],
    },
    {
      name: "Shirts",
      colour: "#6f7f96",
      formation: "2-2-2",
      players: [
        { name: "Chris",   number: 1, photo: "" },
        { name: "Al",      number: 2, photo: "" },
        { name: "Joe C",   number: 3, photo: "" },
        { name: "Justin",  number: 4, photo: "" },
        { name: "Dave",    number: 5, photo: "" },
        { name: "Eduardo", number: 6, photo: "" },
      ],
      subs: [],
    },
  ],
};
