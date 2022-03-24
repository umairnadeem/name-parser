import fs from "fs";
import _ from "lodash";
import * as csv from "csv/sync";

const FILE_PATH: string = process.env.INPUT || "input.csv";

const csvToArray = (fileName: string = FILE_PATH): string[] => {
  const parsedCsv = csv.parse(fs.readFileSync(fileName));
  return parsedCsv.map((e: string[]) => e.join(" ").trim());
};

const arrayToCsv = (
  arr: string[],
  originalFileName: string = FILE_PATH
): string => {
  const originalParsedCsv = csv.parse(fs.readFileSync(originalFileName));
  return csv.stringify(
    originalParsedCsv.map((e: string[], i: number) => _.compact([...e, arr[i]]))
  );
};

const sanitize = (names: string[]) => {
  return names.map(
    (name) =>
      name
        .replace(/[^a-zA-Z,\-._\s]/g, "") // remove everything that's not alphanumeric, comma, dot, dash, underscore or whitespace
        .replace(/[._]/g, " ") // replace dots and underscores with whitespace
        .replace(/\s\s+/g, " ") // remove consecutive spaces
  );
};

const capitalize = (names: string[]) => {
  return names.map((name) => name.replace(/\w+(?=\s|-|$)/gi, _.capitalize)); // capitalize around spaces or dashes
};

const findGivenName = (names: string[]) => {
  const pakistaniPrefixes = [
    "Muhammad",
    "Muhammed",
    "Mohammad",
    "Mohammed",
    "Syed",
    "Hafiz",
    "Bin",
    "Mir",
    "Mian",
    "Sheikh",
    "Raja",
    "Syeda",
  ];
  return names.map((name) => {
    const possibleFirstNames = name.split(" ").slice(0, -1).join(" "); // extract everything but last name
    const firstName = possibleFirstNames.length > 1 ? possibleFirstNames : name;
    const splitFirstName = firstName.split(" ");
    const givenName = splitFirstName.find(
      (e) => !pakistaniPrefixes.includes(e) && e.length > 2
    );
    return givenName ? givenName : splitFirstName[0];
  });
};

const givenNames = _.flow(sanitize, capitalize, findGivenName)(csvToArray());
fs.writeFileSync(`${FILE_PATH}_modified`, arrayToCsv(givenNames));
