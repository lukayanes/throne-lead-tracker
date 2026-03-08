export default {
  async fetch(request, env) {

    if (request.method !== "POST") {
      return new Response("Worker ready");
    }

    try {

      const body = await request.json();

      const now = new Date();

      const row = [

now.toLocaleString(), // Date
body.name || "", // Name
body.address || "", // Address
body.phone || "", // PhoneNumber
body.email || "", // Email

"", "", "", "", "", // spacer columns

"", // Motivation Scale
"Lead", // Disposition
"", // Deal Spread
"", // Contract Date
"", // Notes
"", // Motivation
"", // AskingPrice
"", // Listed
"", // Zestimate
"Lead", // Status

"", // Geolocation
"", // Geo <100

body.utm_source || "",
body.utm_campaign || "",
body.utm_campaign || "",
body.utm_adgroup || "",
"", // utm_ad
body.utm_term || "",
"", // utm_matchtype
body.utm_device || "",
"", // utm_bid

request.headers.get("cf-connecting-ip") || "", // IP
"Throne Holdings", // utm_acct

body.gclid || "", // GCLID
body.url || "", // URL
body.wbraid || "", // WBRAID
body.gbraid || "", // GBRAID

now.toISOString() // Google Time

];

      const token = await getAccessToken(env);

      await fetch(
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

      return new Response("OK");

    } catch (err) {

      console.error(err);

      return new Response("ERROR");

    }

  }
};
