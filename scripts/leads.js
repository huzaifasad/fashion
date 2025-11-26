import fetch from "node-fetch";

const TOKEN = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImEyOGExOWZhNWFjMjQ0ZTFhN2Y2NzZkOTcwMTM5ZjE3NDY2NTA5YzNiYjVhNmM0OWU1YmYwYzQ0N2U0Y2M3ZGU3NDA5NTE3ZTZiMGM4MzhkIn0.eyJhdWQiOiIxNWIxMjE2NC1jZGRiLTQ1M2YtODY2MS00OTY1ZDFjMjAxODUiLCJqdGkiOiJhMjhhMTlmYTVhYzI0NGUxYTdmNjc2ZDk3MDEzOWYxNzQ2NjUwOWMzYmI1YTZjNDllNWJmMGM0NDdlNGNjN2RlNzQwOTUxN2U2YjBjODM4ZCIsImlhdCI6MTc2NDAwMDk0NCwibmJmIjoxNzY0MDAwOTQ0LCJleHAiOjE3NjQ0NjA4MDAsInN1YiI6IjExNTMxOTE5IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMzMTEzNjM5LCJiYXNlX2RvbWFpbiI6ImtvbW1vLmNvbSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiNDQzNTJhNGMtM2NkYy00NzM3LWI4MjYtODI4NzM2NGE4NDA3IiwidXNlcl9mbGFncyI6MCwiYXBpX2RvbWFpbiI6ImFwaS1nLmtvbW1vLmNvbSJ9.qgnm6cY_cO4VhkL2KPhORbwTsrMzhfGX_lAeKyR1wRgCSw6Ibj-T1tgIvHu3tmjOGDB1jD3iq0hTf2QzV8IXvdMPALCRGceXYbE-mbE35eRJbI9w7i6LilgQ4aHcng14rOgHxl1Sj-2HtCgZo5-UVyq8n_BxNqcvfVVsNVtYXdDOGyv-ovqFV9CIURwwq3CMCgkqKVrgb4SvxfP6y5mdQIOxSSOFrM2nEaugtXggUsmXjzlmMk5bA3rxq8p0dcut9pnNUpcycn6GAfs5L9ER5Mgll9ogBbYj5uEnNt1k__5Ke6FB5sfr9fyMtvOTFB5YBFRXnpqRRroffetec9eY_w";
const BASE = "https://contactotraveltodoccom.kommo.com";

async function getAllLeads() {
  const res = await fetch(`${BASE}/api/v4/leads`, {
    headers: {
      Authorization: TOKEN,
      "Content-Type": "application/json"
    }
  });

  const data = await res.json();

  return data?._embedded?.leads || [];
}

async function getLeadMessages(leadId) {
  const url = `${BASE}/api/v4/leads/${leadId}/notes`;

  const res = await fetch(url, {
    headers: {
      Authorization: TOKEN,
      "Content-Type": "application/json"
    }
  });

  if (res.status === 204) return []; // no content

  const data = await res.json();
  return data?._embedded?.notes || [];
}

async function main() {
  console.log("Fetching all leads...");

const messages = await getLeadMessages(4254858);
console.log(messages)
    if (messages.length > 0) {
      console.log("=====================================");

      console.log("Messages Found:");

      messages.forEach((m) => {
        console.log("- Type:", m.note_type);
        console.log("  Text:", m.params?.text || m.text || "No text");
      });

      console.log("=====================================\n");
    }




  console.log("Done.");
}

main().catch(console.error);


//4254858 /// as this is the id that have the message so you can see it 