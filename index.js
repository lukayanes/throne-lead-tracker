export default {
  async fetch(request, env) {

    if (request.method !== "POST") {
      return new Response("Worker ready");
    }

    try {

      const lead = await request.json();

      const now = new Date();

      const ip =
        request.headers.get("cf-connecting-ip") ||
        request.headers.get("x-forwarded-for") ||
        "";

      const geo = request.cf || {};

      const geolocation = [
        geo.city,
        geo.region,
        geo.country
      ].filter(Boolean).join(", ");

      const row = [

        now.toLocaleString(),                  // Date
        lead.name || "",                       // Name
        lead.address || "",                    // Address
        lead.phone || "",                      // Phone
        lead.email || "",                      // Email

        "", "", "",                            // empty spacer columns

        "",                                    // Motivation Scale
        "Lead",                                // Disposition
        "",                                    // Deal Spread
        "",                                    // Contract Date
        "",                                    // Notes
        "",                                    // Motivation
        "",                                    // Asking Price
        "",                                    // Listed
        "",                                    // Zestimate
        "Lead",                                // Status

        geolocation,                           // Geolocation
        "",                                    // Geo <100

        lead.utm_source || "",
        lead.utm_campaign || "",
        lead.utm_campaign || "",
        lead.utm_adgroup || "",
        "",
        lead.utm_term || "",
        "",
        lead.utm_device || "",
        "",

        ip,
        "Throne Holdings",

        lead.gclid || "",
        lead.url || "",
        lead.wbraid || "",
        lead.gbraid || "",

        now.toISOString()

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

      return new Response("Lead stored");

    } catch (err) {

      return new Response(err.toString(), { status: 500 });

    }

  }
};
