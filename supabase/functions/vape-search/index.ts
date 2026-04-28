// VapeSearch — interpreta una query in italiano (con gergo vaping)
// e ritorna un oggetto strutturato con i criteri di ricerca.
// Il filtro/ranking sul catalogo viene fatto lato client.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Sei l'assistente di ricerca di VapeSearch, un motore italiano per il mondo dello svapo.
Devi interpretare una richiesta a linguaggio naturale dell'utente (in italiano, spesso con gergo vaping)
e restituire SOLO una chiamata alla funzione "interpret_query" con i parametri estratti.

Conosci il gergo italiano del vaping:
- "tiro in bocca" / "guancia" / "MTL" → drawStyle MTL
- "tiro diretto" / "diretto" / "DTL" / "polmonare" → drawStyle DTL
- "restricted" / "RDL" → drawStyle RDL
- "salts" / "nic salts" → nic salts (salts-10, salts-20)
- "base neutra" / "shot" / "scomposto" → liquido da diluire
- "pod" → dispositivi compatti, di solito principiante
- "mod" / "box" → dispositivi avanzati, esperto
- "rigenerabile" / "RDA" / "RTA" → categoria esperto
- "coil" / "resistenza" → categoria resistenze
- intensità: "leggero", "medio", "intenso"
- dolcezza: "secco", "neutro", "dolce", "molto-dolce"

Categorie possibili: liquidi, dispositivi, resistenze, accessori.
Livelli: principiante, intermedio, esperto.
Nicotina: "0", "3", "6", "9", "salts-10", "salts-20".

Estrai SOLO ciò che l'utente dice o implica chiaramente. Lascia gli altri campi vuoti.`;

interface SearchCriteria {
  category?: string;
  flavors?: string[];
  sweetness?: string;
  intensity?: string;
  nicotine?: string;
  drawStyle?: string;
  level?: string;
  priceMax?: number;
  keywords?: string[];
  summary?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "query mancante" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY non configurata");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: query },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "interpret_query",
                description:
                  "Estrae i criteri di ricerca strutturati dalla richiesta dell'utente.",
                parameters: {
                  type: "object",
                  properties: {
                    category: {
                      type: "string",
                      enum: [
                        "liquidi",
                        "dispositivi",
                        "resistenze",
                        "accessori",
                      ],
                    },
                    flavors: {
                      type: "array",
                      items: { type: "string" },
                      description: "Aromi/gusti citati, in italiano lowercase",
                    },
                    sweetness: {
                      type: "string",
                      enum: ["secco", "neutro", "dolce", "molto-dolce"],
                    },
                    intensity: {
                      type: "string",
                      enum: ["leggero", "medio", "intenso"],
                    },
                    nicotine: {
                      type: "string",
                      enum: ["0", "3", "6", "9", "salts-10", "salts-20"],
                    },
                    drawStyle: {
                      type: "string",
                      enum: ["MTL", "DTL", "RDL"],
                    },
                    level: {
                      type: "string",
                      enum: ["principiante", "intermedio", "esperto"],
                    },
                    priceMax: { type: "number" },
                    keywords: {
                      type: "array",
                      items: { type: "string" },
                      description:
                        "Parole chiave libere per il ranking testuale",
                    },
                    summary: {
                      type: "string",
                      description:
                        "Una riga in italiano che riassume cosa cerca l'utente",
                    },
                  },
                  required: ["summary"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "interpret_query" },
          },
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Troppe richieste, riprova fra poco." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "Crediti AI esauriti. Aggiungi crediti al workspace.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const t = await response.text();
      console.error("AI gateway error", response.status, t);
      return new Response(
        JSON.stringify({ error: "Errore del servizio AI" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(
        JSON.stringify({ criteria: { summary: query } as SearchCriteria }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const criteria: SearchCriteria = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify({ criteria }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("vape-search error", e);
    const msg = e instanceof Error ? e.message : "Errore sconosciuto";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
