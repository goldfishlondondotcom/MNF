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
  date: "Monday 20 October",
  kickoff: "8:00pm",
  venue: "Venue TBC",

  teams: [
    {
      name: "Reds",
      colour: "#d7182a",
      formation: "2-1-2",
      players: [
        { name: "Sam Carter",     number: 1,  photo: "" },
        { name: "Dan Hughes",     number: 4,  photo: "" },
        { name: "Matt Price",     number: 5,  photo: "" },
        { name: "Chris Doyle",    number: 8,  photo: "" },
        { name: "Tom Whitfield",  number: 7,  photo: "" },
        { name: "Alex Mensah",    number: 9,  photo: "" },
      ],
      subs: [{ name: "Ben Lowe", number: 12, photo: "" }],
    },
    {
      name: "Blues",
      colour: "#1f5fd6",
      formation: "2-1-2",
      players: [
        { name: "Rob Fletcher",   number: 1,  photo: "" },
        { name: "Liam O'Neill",   number: 3,  photo: "" },
        { name: "Jack Turner",    number: 6,  photo: "" },
        { name: "Ollie Grant",    number: 10, photo: "" },
        { name: "Harry Walsh",    number: 11, photo: "" },
        { name: "Kieran Brooks",  number: 9,  photo: "" },
      ],
      subs: [],
    },
  ],
};
