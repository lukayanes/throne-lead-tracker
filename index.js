export default {
  async fetch(request, env) {

    if (request.method !== "POST") {
      return new Response("Worker ready");
    }

    try {

      const body = await request.json();

      const now = new Date();

      const row = [

        now.toLocaleString(),

        body.name || "",
        body.address || "",
        body.phone || "",
        body.email || "",

        "", "", "", "", "",

        "",

        "Lead",

        "",

        "",

        "",

        "",

        "",

        "",

        "Lead",

        "",

        "",

        body.utm_source || "",

        body.utm_campaign || "",

        body.utm_campaign || "",

        body.utm_adgroup || "",

        "",

        body.utm_term || "",

        "",

        body.utm_device || "",

        "",

        request.headers.get("cf-connecting-ip") || "",

        "Throne Holdings",

        body.gclid || "",

        body.url || "",

        body.wbraid || "",

        body.gbraid || "",

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

      return new Response("OK");

    } catch (err) {

      console.error(err);

      return new Response("ERROR");

    }

  }
};
