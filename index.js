require("dotenv").config();
var quip = require("./quip");

var client = new quip.Client({
  accessToken: process.env.token,
});

let folderId = "ZRAAOA3335g";

const english_ordinal_suffix = (dt) => {
  return (
    dt +
    (dt % 10 == 1 && dt != 11
      ? "st"
      : dt % 10 == 2 && dt != 12
      ? "nd"
      : dt % 10 == 3 && dt != 13
      ? "rd"
      : "th")
  );
};

const getWeekOfMonth = (date) => {
  let adjustedDate = date.getDate() + date.getDay();
  let prefixes = ["0", "1", "2", "3", "4", "5"];
  return parseInt(prefixes[0 | (adjustedDate / 7)]) + 1;
};

client.getAuthenticatedUser(function (err, user) {
  /* client.getFolder(user["starred_folder_id"], function (err, folder) {
    console.log(
      "You have",
      folder["children"].length,
      "items in your starred folder"
    );
  }); */

  const today = new Date();

  let fy = today.getMonth < 1 ? today.getFullYear() : today.getFullYear() + 1;
  let monthName = today.toLocaleString("default", {
    month: "long",
  });
  let year;

  let daysStr = "";
  let startDay;
  let endDay;
  for (let i = 1; i < 6; i++) {
    let first = today.getDate() - today.getDay() + i;
    let day = new Date(today.setDate(first));

    let day_weekday = day.toLocaleString("default", {
      weekday: "long",
    });
    let day_formatted = english_ordinal_suffix(today.getDate());
    let day_month = day.toLocaleString("default", {
      month: "long",
    });

    daysStr += `<strong><h3>${day_weekday}, ${day_formatted} ${day_month}, ${today.getFullYear()}</h3></strong> <p class='line'>​</p>`;

    if (i === 1) {
      startDay = day;
    }
    endDay = day;
  }

  let isSameMonth = startDay.getMonth() == endDay.getMonth();
  let startDay_formatted = english_ordinal_suffix(startDay.getDate());
  let endDay_formatted = english_ordinal_suffix(endDay.getDate());

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

  let heading = `FY${fy
    .toString()
    .substr(-2)} - ${monthName} - Week ${getWeekOfMonth(
    startDay
  )} - ${startDay_formatted} to ${endDay_formatted}`;

  let content = `<strong><h1>${heading}</h1></strong> ${daysStr}`;

  console.log(content);

  /* 
  client.getThread("EbY4AqwhXBv8", function (err, data) {
    if (err) {
      console.log("error creating", err);
      return;
    }
    console.log(data);
  });
 */

  let docProps = { content: content, memberIds: [folderId] };
  client.newDocument(docProps, function (err, data) {
    if (err) {
      console.log("error creating", err);
      return;
    }
    console.log(data);
  });
});
