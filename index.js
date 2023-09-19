// Load environment variables from a .env file
require("dotenv").config();

// Import the Quip module
const quip = require("./quip");

// Create a new instance of the Quip client using an access token from the environment variables
const client = new quip.Client({
  accessToken: process.env.token,
});

// Specify a Quip folder ID where the document will be created (replace with an actual folder ID)
let folderId = "<QUIP_FOLDER_ID>";

// Define a function to convert a number into an English ordinal suffix (e.g., 1st, 2nd, 3rd, 4th)
const english_ordinal_suffix = (dt) => {
  // Logic for determining the appropriate suffix based on the number
  return dt + (dt % 10 == 1 && dt != 11 ? "st" : dt % 10 == 2 && dt != 12 ? "nd" : dt % 10 == 3 && dt != 13 ? "rd" : "th");
};

// Define a function to get the week of the month for a given date
const getWeekOfMonth = (date) => {
  let adjustedDate = date.getDate() + date.getDay();
  let prefixes = ["0", "1", "2", "3", "4", "5"];
  return parseInt(prefixes[0 | (adjustedDate / 7)]) + 1;
};

// Authenticate the Quip client and execute the following code
client.getAuthenticatedUser(function (err, user) {
  const today = new Date();

  // Determine the fiscal year (FY) based on the current date
  let fy = today.getMonth < 1 ? today.getFullYear() : today.getFullYear() + 1;

  // Get the full name of the current month
  let monthName = today.toLocaleString("default", {
    month: "long",
  });

  // Initialize variables for later use
  let year;
  let daysStr = "";
  let startDay;
  let endDay;

  // Loop through the next 5 days, generating HTML content for each day
  for (let i = 1; i < 6; i++) {
    let first = today.getDate() - today.getDay() + i;
    let day = new Date(today.setDate(first));

    // Get the full weekday name, day with ordinal suffix, and full month name for the current day
    let day_weekday = day.toLocaleString("default", {
      weekday: "long",
    });
    let day_formatted = english_ordinal_suffix(today.getDate());
    let day_month = day.toLocaleString("default", {
      month: "long",
    });

    // Construct a string for the current day's information and append it to 'daysStr'
    daysStr += `<strong><h3>${day_weekday}, ${day_formatted} ${day_month}, ${today.getFullYear()}</h3></strong> <p class='line'>​</p>`;

    // Track the start and end days of the week
    if (i === 1) {
      startDay = day;
    }
    endDay = day;
  }

  // Determine if the start and end days are in the same month
  let isSameMonth = startDay.getMonth() == endDay.getMonth();
  let startDay_formatted = english_ordinal_suffix(startDay.getDate());
  let endDay_formatted = english_ordinal_suffix(endDay.getDate());

  // If not in the same month, append the month and year to the formatted dates
  if (!isSameMonth) {
    startDay_formatted += ` ${startDay.toLocaleString("default", {
      month: "short",
      year: "numeric",
    })}`;
    endDay_formatted += ` ${endDay.toLocaleString("default", {
      month: "short",
      year: "numeric",
    })}`;
  }

  // Create a heading string for the document
  let heading = `FY${fy.toString().substr(-2)} - ${monthName} - Week ${getWeekOfMonth(startDay)} - ${startDay_formatted} to ${endDay_formatted}`;

  // Document Content - combine the heading and day information into the 'content' string
  let content = `<strong><h1>${heading}</h1></strong> ${daysStr}`;

  console.log(content);

  // Define document properties including content and folder IDs, then create a new document
  let docProps = { content: content, memberIds: [folderId] };
  client.newDocument(docProps, function (err, data) {
    if (err) {
      console.log("error creating", err);
      return;
    }
    console.log(data);
  });
});
