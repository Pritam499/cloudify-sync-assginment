import dotenv from "dotenv";
import axios from "axios";
import type { PipedrivePerson } from "./types/pipedrive";
import inputData from "./mappings/inputData.json";
import mappings from "./mappings/mappings.json";

// Load env variables
dotenv.config();

const apiKey = process.env.PIPEDRIVE_API_KEY;
const companyDomain = process.env.PIPEDRIVE_COMPANY_DOMAIN;

const input: Record<string, any> = inputData;

// Validate env variables
if (!apiKey || !companyDomain) {
  throw new Error("Missing PIPEDRIVE_API_KEY or PIPEDRIVE_COMPANY_DOMAIN in .env file");
}

// Base API URL
const pipedrive = axios.create({
  baseURL: `https://${companyDomain}.pipedrive.com/api/v1`,
  params: { api_token: apiKey },
});

const syncPdPerson = async (): Promise<PipedrivePerson> => {
  try {
    // Step 1: Create payload from inputData and mappings
    const payload: Record<string, any> = {};

    mappings.forEach(({ pipedriveKey, inputKey }) => {
      const value = inputKey.split(".").reduce((obj, key) => obj?.[key], input);
      if (value !== undefined) {
        payload[pipedriveKey] = value;
      }
    });

    // Step 2: Use the 'name' mapping to find the person
    const nameMapping = mappings.find(m => m.pipedriveKey === "name");
    if (!nameMapping) throw new Error("Missing 'name' mapping in mappings.json");

    const personName = nameMapping.inputKey.split(".").reduce((obj, key) => obj?.[key], input);
    if (!personName) throw new Error(`No name found in inputData using key '${nameMapping.inputKey}'`);

    const searchRes = await pipedrive.get("/persons/search", {
      params: { term: personName, fields: "name", exact_match: true },
    });

    const existingPerson = searchRes.data?.data?.items?.[0]?.item;

    let response;
    if (existingPerson) {
      // Step 3: Person found → Update
      response = await pipedrive.put(`/persons/${existingPerson.id}`, payload);
      console.log(`🔁 Updated person '${personName}' (ID: ${existingPerson.id})`);
    } else {
      // Step 4: Person not found → Create
      response = await pipedrive.post("/persons", payload);
      console.log(`✨ Created new person '${personName}'`);
    }

    return response.data.data as PipedrivePerson;
  } catch (err) {
    console.error("❌ Error syncing Pipedrive person:", err);
    throw err;
  }
};

// Run the function
(async () => {
  try {
    const person = await syncPdPerson();
    console.log("✅ Final synced person:", person);
  } catch (e) {
    console.error("❌ Failed to sync person.");
  }
})();
