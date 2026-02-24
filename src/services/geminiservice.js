import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const MEDICAL_EXTRACTION_PROMPT = `
You are a medical data extraction expert. Analyze the following medical document text and extract all relevant information into a structured JSON format.

Extract and structure the following fields (use null if not found):
{
  "patient": {
    "name": "",
    "age": "",
    "gender": "",
    "dob": "",
    "id": "",
    "contact": ""
  },
  "visit": {
    "date": "",
    "type": "",
    "department": "",
    "doctor": "",
    "hospital": "",
    "duration": ""
  },
  "clinical": {
    "chief_complaint": "",
    "diagnosis": [],
    "symptoms": [],
    "vitals": {
      "blood_pressure": "",
      "heart_rate": "",
      "temperature": "",
      "weight": "",
      "height": "",
      "spo2": ""
    }
  },
  "medications": [
    {
      "name": "",
      "dosage": "",
      "frequency": "",
      "duration": "",
      "route": ""
    }
  ],
  "lab_results": [
    {
      "test": "",
      "value": "",
      "unit": "",
      "reference_range": "",
      "flag": ""
    }
  ],
  "procedures": [],
  "allergies": [],
  "follow_up": "",
  "notes": ""
}

Return ONLY valid JSON, no explanation, no markdown, no code blocks. Just raw JSON.

Document text:
`;

export async function extractMedicalData(text) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(MEDICAL_EXTRACTION_PROMPT + text);
    const response = await result.response;
    const rawText = response.text().trim();

    // Clean up in case model wraps in markdown
    const cleaned = rawText.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();

    return JSON.parse(cleaned);
}