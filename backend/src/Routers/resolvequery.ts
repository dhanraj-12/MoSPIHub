import express from "express";
import client from "../Util/Rds.js";
import type { Request, Response } from "express";
const resolvRouter = express.Router();
import { variableMap_HHRV } from "../Data_Dictionary/(PLFS)/HHRV.js";
import { variableMap_HHFV } from "../Data_Dictionary/(PLFS)/HHFV.js";

const surveyMap: Record<string, Record<string, string>> = {
  "HHRV_2019_20": variableMap_HHRV,
  "HHRV_2018_19": variableMap_HHRV,
  "HHFV_2018_19": variableMap_HHFV,
  "HHFV_2019_20": variableMap_HHFV,
};

function getReverseMap(survey: string): Record<string, string> {
  const variableMap = surveyMap[survey];
  if (!variableMap) throw new Error(`Survey ${survey} not supported`);
  return Object.fromEntries(
    Object.entries(variableMap).map(([key, val]) => [val.toLowerCase(), key])
  );
}

function convertToShortform(query: string, survey: string) {
  const revMap = getReverseMap(survey);
  let shortQuery = query;

  // Replace longer phrases first to avoid partial matches breaking them
  const sortedKeys = Object.keys(revMap).sort((a, b) => b.length - a.length);

  for (const longName of sortedKeys) {
    const escaped = longName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex chars
    const regex = new RegExp(escaped, 'gi'); // case-insensitive
    shortQuery = shortQuery.replace(regex, revMap[longName]!);
  }

  return shortQuery;
}
const resolvQueryhandler = async (req: Request, res: Response) => {
  const { query, survey } = req.body;

  if (!query) return res.status(400).json({ error: "Query is empty" });
  if (!survey) return res.status(400).json({ error: "Survey is required" });

  try {
    // const shortQuery = convertToShortform(query, survey);
    console.log("Converted query:", query);
    const result = await client.query(query); // ✅ use converted query
    res.json(result.rows);
  } catch (e) {
    console.error("Error in resolving query", e);
    res.status(500).json({ error: "Internal server error" });
  }
};

resolvRouter.post("/resolve", resolvQueryhandler);
export default resolvRouter;
