export default {
  async fetch(request, env) {

    if (request.method !== "POST") {
      return new Response("Worker ready");
    }

    try {

      const body = await request.json();

      console.log("Incoming Lead:", body);

      const now = new Date();

      const ip =
        request.headers.get("cf-connecting-ip") ||
        request.headers.get("x-forwarded-for") ||
        "";

      const row = [

        now.toLocaleString(),                // Date
        body.name || "",                     // Name
        body.address || "",                  // Address
        body.phone || "",                    // PhoneNumber
        body.email || "",                    // Email

        "", "", "", "", "",                  // spacer columns

        "",                                  // Motivation Scale
        "Lead",                              // Disposition
        "",                                  // Deal Spread
        "",                                  // Contract Date
        "",                                  // Notes
        "",                                  // Motivation
        "",                                  // AskingPrice
        "",                                  // Listed
        "",                                  // Zestimate
        "Lead",                              // Status

        "",                                  // Geolocation
        "",                                  // Geo <100

        body.utm_source || "",
        body.utm_campaign || "",
        body.utm_campaign || "",
        body.utm_adgroup || "",
        "",                                  // utm_ad
        body.utm_term || "",
        "",                                  // utm_matchtype
        body.utm_device || "",
        "",                                  // utm_bid

        ip,                                  // IP
        "Throne Holdings",                   // utm_acct

        body.gclid || "",                    // GCLID
        body.url || "",                      // URL
        body.wbraid || "",                   // WBRAID
        body.gbraid || "",                   // GBRAID

        now.toISOString()                    // Google Time

      ];

      const token = await getAccessToken(env);

      const sheetResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${env.SHEET_ID}/values/A1:append?valueInputOption=USER_ENTERED`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            values: [row]
          })
        }
      );

      const sheetText = await sheetResponse.text();

      console.log("Sheets Response:", sheetText);

      if (!sheetResponse.ok) {
        throw new Error(sheetText);
      }

      return new Response("Lead stored");

    } catch (err) {

      console.error("Worker Error:", err);

      return new Response(
        JSON.stringify({
          error: err.toString()
        }),
        { status: 500 }
      );

    }

  }
};


/* =========================================
GOOGLE ACCESS TOKEN
========================================= */

async function getAccessToken(env) {

  const jwt = await createJWT(env);

  const res = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded"
      },
      body:
        `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    }
  );

  const data = await res.json();

  return data.access_token;

}


/* =========================================
CREATE JWT
========================================= */

async function createJWT(env) {

  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iss: env.CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  const encode = obj =>
    btoa(JSON.stringify(obj))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const unsigned =
    `${encode(header)}.${encode(payload)}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(env.PRIVATE_KEY),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned)
  );

  const signed =
    btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  return `${unsigned}.${signed}`;

}


/* =========================================
FIX PRIVATE KEY FORMAT
========================================= */

function pemToArrayBuffer(pem) {

  pem = pem.replace(/\\n/g, '\n').trim();

  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");

  const binary = atob(base64);

  const buffer = new ArrayBuffer(binary.length);

  const view = new Uint8Array(buffer);

  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }

  return buffer;

}
