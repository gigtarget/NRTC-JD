const aisleConfig = {
  A: { front: 3, back: 9 }, B: { front: 3, back: 9 }, C: { front: 3, back: 9 },
  D: { front: 3, back: 12 }, E: { front: 7, back: 12 }, F: { front: 7, back: 12 },
  G: { front: 7, back: 12 }, H: { front: 7, back: 12 }, I: { front: 7, back: 12 },
};

const aisleSpacing = 55, sectionSize = 20, padding = 2, offsetX = 10;
const svg = document.getElementById("aisles");
const dynamicViewBoxWidth = Object.keys(aisleConfig).length * aisleSpacing;
svg.setAttribute("viewBox", `0 0 ${dynamicViewBoxWidth} 550`);

function drawSections() {
  let index = 0;
  for (let aisle in aisleConfig) {
    const { front, back } = aisleConfig[aisle];
    const x = offsetX + index * aisleSpacing;
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", x + sectionSize); label.setAttribute("y", 15);
    label.setAttribute("class", "aisle-label"); label.textContent = aisle;
    svg.appendChild(label);

    // FRONT
    for (let i = 0; i < front; i++) ["Left", "Right"].forEach((side, sIndex) => {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x + sIndex * (sectionSize + padding));
      rect.setAttribute("y", 30 + i * (sectionSize + padding));
      rect.setAttribute("width", sectionSize); rect.setAttribute("height", sectionSize);
      rect.setAttribute("class", "section");
      rect.setAttribute("id", `${aisle}-Top-BeforeWalkway-${side}-${i + 1}`);
      svg.appendChild(rect);
    });

    // BACK
    for (let i = 0; i < back; i++) ["Left", "Right"].forEach((side, sIndex) => {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x + sIndex * (sectionSize + padding));
      rect.setAttribute("y", 160 + i * (sectionSize + padding));
      rect.setAttribute("width", sectionSize); rect.setAttribute("height", sectionSize);
      rect.setAttribute("class", "section");
      rect.setAttribute("id", `${aisle}-Top-AfterWalkway-${side}-${i + 1}`);
      svg.appendChild(rect);
    });

    index++;
  }
}

function clearHighlights() {
  document.querySelectorAll(".section").forEach(el => el.classList.remove("highlight"));
}

async function searchItem() {
  const query = document.getElementById("searchBox").value.trim().toUpperCase();
  const response = await fetch("warehouse_inventory_map.csv");
  const text = await response.text();
  const rows = text.split("\n").slice(1);
  const data = rows.map(row => {
    const [code, aisle, level, block, side, section] = row.split(",").map(s => s.trim());
    return { code, aisle, level, block, side, section };
  });

  clearHighlights();
  const match = data.find(r => r.code === query);
  const resultBox = document.getElementById("result");

  if (match) {
    let highlightId = `${match.aisle}-${match.level}-${match.block.replace(/\s/g, '')}-${match.side}-${match.section}`;
    resultBox.textContent = `✅ Found: Aisle ${match.aisle}, Level: ${match.level}, ${match.block}, ${match.side}, Section ${match.section}`;
    const el = document.getElementById(highlightId);
    if (el) el.classList.add("highlight");
    else {
      document.querySelectorAll(`[id^="${match.aisle}-"]`).forEach(el => el.classList.add("highlight"));
      resultBox.textContent += " (Entire aisle highlighted)";
    }
  } else resultBox.textContent = "⚠️ Item not found";
}

document.getElementById("searchBox").addEventListener("input", searchItem);
drawSections();
