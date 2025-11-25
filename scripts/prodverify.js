import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://aqkeprwxxsryropnhfvm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2Vwcnd4eHNyeXJvcG5oZnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MzE4MjksImV4cCI6MjA1MzQwNzgyOX0.1nstrLtlahU3kGAu-UrzgOVw6XwyKU6n5H5q4Taqtus'
);

async function getUrlStats() {
  console.log("🔍 Checking product URLs...\n");

  let withUrl = 0;
  let withoutUrl = 0;
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("zara_cloth")
      .select("product_url")
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error || !data || data.length === 0) break;

    data.forEach((p) => {
      if (p.product_url && p.product_url.trim() !== "") {
        withUrl++;
      } else {
        withoutUrl++;
      }
    });

    hasMore = data.length === pageSize;
    page++;
  }

  const total = withUrl + withoutUrl;
  
  console.log("📊 RESULTS:");
  console.log("─────────────────────────────────");
  console.log(`Total Products:    ${total}`);
  console.log(`✅ With URLs:       ${withUrl} (${((withUrl/total)*100).toFixed(1)}%)`);
  console.log(`❌ Without URLs:    ${withoutUrl} (${((withoutUrl/total)*100).toFixed(1)}%)`);
  console.log("─────────────────────────────────");
}

getUrlStats();