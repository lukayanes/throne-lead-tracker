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

      const url = lead.url || request.headers.get("referer") || "";

      const row = [

        now.toLocaleString(),                // Date
        lead.name || "",                     // Name
        lead.address || "",                  // Address
        lead.phone || "",                    // PhoneNumber
        lead.email || "",                    // Email

        "",                                  // blank spacer
        "",                                  // blank spacer
        "",                                  // blank spacer

        lead.motivation_scale || "Unknown",  // Motivation Scale
        lead.disposition || "Lead",          // Disposition
        lead.deal_spread || "",              // Deal Spread
        lead.contract_date || "",            // Contract Date
        lead.notes || "",                    // Notes
        lead.motivation || "",               // Motivation
        lead.asking_price || "",             // AskingPrice
        lead.listed || "",                   // Listed
        lead.zestimate || "",                // Zestimate
        lead.status || "Lead",               // Status

        geolocation,                         // Geolocation
        "",                                  // Geo <100 (optional logic later)

        lead.utm_source || "",               // utm_source
        lead.utm_campaign_name || "",        // utm_campaign_name
        lead.utm_campaign || "",             // utm_campaign
        lead.utm_adgroup || "",              // utm_adgroup
        lead.utm_ad || "",                   // utm_ad
        lead.utm_term || "",                 // utm_term
        lead.utm_matchtype || "",            // utm_matchtype
        lead.utm_device || "",               // utm_device
        lead.utm_bid || "",                  // utm_bid

        ip,                                  // IP
        lead.utm_acct || "Throne Holdings",  // utm_acct

        lead.gclid || "",                    // GCLID
        url,                                 // URL
        lead.wbraid || "",                   // WBRAID
        lead.gbraid || "",                   // GBRAID

        now.toISOString()                    // Google Time

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
