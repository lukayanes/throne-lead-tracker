export default {
  async fetch(request, env) {

    if (request.method !== "POST") {
      return new Response("Worker ready");
    }

    try {

      const lead = await request.json();

      console.log("LEAD RECEIVED:", lead);

      const now = new Date();

      const ip =
        request.headers.get("cf-connecting-ip") ||
        "";

      const geo = request.cf || {};

      const geolocation = [
        geo.city,
        geo.region,
        geo.country
      ].filter(Boolean).join(", ");

      const row = [

        now.toLocaleString(),
        lead.name || "",
        lead.address || "",
        lead.phone || "",
        lead.email || "",

        "", "", "",

        "",
        "Lead",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Lead",

        geolocation,
        "",

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

      const res = await fetch(
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

      const text = await res.text();

      console.log("Sheets response:", text);

      return new Response("Lead stored");

    } catch (err) {

      console.error(err);

      return new Response(err.toString(), { status: 500 });

    }

  }
};
