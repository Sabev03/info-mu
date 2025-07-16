function addUniversity() {
  const selected = document.getElementById("universitySelect").value;
  const selectedSpec = document.getElementById("specialtySelect").value;

  if (!selected || !data[selected]) return;

  const container = document.getElementById("universitiesContainer");
  let block = document.getElementById(`block-${selected}`);

  if (block) {
    updateUniversityBlock(block, selected, selectedSpec);
  } else {
    block = document.createElement("div");
    block.className = "university-block";
    block.id = `block-${selected}`;
    block.innerHTML = `<h2>${selected}</h2>
      <button class="remove-btn" onclick="removeUniversity('${selected}')">✖</button>`;
    container.appendChild(block);
    updateUniversityBlock(block, selected, selectedSpec);
  }
}

function updateUniversityBlock(block, university, specialtyFilter) {
  const universityData = data[university];
  const info = universityData.info;
  const specialties = specialtyFilter ? [specialtyFilter] : Object.keys(universityData.specialties);

  // Събираме всички години, които имат данни (поне един непразен масив)
  const yearsSet = new Set();
  specialties.forEach(spec => {
    Object.keys(universityData.specialties[spec] || {}).forEach(year => {
      const yearData = universityData.specialties[spec][year];
      if (
        (yearData["мъже"] && yearData["мъже"].length > 0) ||
        (yearData["жени"] && yearData["жени"].length > 0)
      ) {
        yearsSet.add(year);
      }
    });
  });
  const years = Array.from(yearsSet).sort();

  if (years.length === 0) {
    block.innerHTML = `<h2>${university}</h2>
      <button class="remove-btn" onclick="removeUniversity('${university}')">✖</button>
      <p><i>Тази специалност <b>${specialtyFilter}</b> не се изучава в ${university}</i></p>`;
    return;
  }

  // Определяме максималния брой класирания (rounds)
  let maxRounds = 0;
  specialties.forEach(spec => {
    years.forEach(year => {
      const yearData = universityData.specialties[spec]?.[year] || {};
      const male = yearData["мъже"] || [];
      const female = yearData["жени"] || [];
      maxRounds = Math.max(maxRounds, male.length, female.length);
    });
  });

  let html = `
    <p><strong>Сайт:</strong> <a href="${info.site}" target="_blank">${info.site}</a></p>
    <p><strong>Ректор:</strong> ${info.rector}</p>
    <p><strong>Телефон:</strong> ${info.phone}</p>
    <table><tr><th>Специалност</th><th>Година</th>`;

  for (let i = 1; i <= maxRounds; i++) {
    html += `<th>Класиране ${i}</th>`;
  }
  html += "</tr>";

  specialties.forEach(spec => {
    years.forEach(year => {
      const yearData = universityData.specialties[spec]?.[year] || {};
      const male = yearData["мъже"] || [];
      const female = yearData["жени"] || [];

      // Ако има поне един елемент в който и да е от масивите, показваме реда (дори празни низове)
      const hasData = male.length > 0 || female.length > 0;
      if (!hasData) return;

      html += `<tr><td>${spec}</td><td>${year}</td>`;
      for (let i = 0; i < maxRounds; i++) {
        const hasMale = male[i] !== undefined && male[i] !== "";
        const hasFemale = female[i] !== undefined && female[i] !== "";

        let m = hasMale ? Number(male[i]).toFixed(2).replace('.', ',') + ' <span style="color:darkblue"><b>(м)</b></span>' : '-';
        let f = hasFemale ? Number(female[i]).toFixed(2).replace('.', ',') + ' <span style="color:red"><b>(ж)</b></span>' : '-';

        let cellContent = '';
        if (hasMale || hasFemale) {
          cellContent = `${hasFemale ? f : '- <span style="color:red"><b>(ж)</b></span>'} / ${hasMale ? m : '- <span style="color:darkblue"><b>(м)</b></span>'}`;
        }
        html += `<td>${cellContent}</td>`;
      }
      html += "</tr>";
    });
  });

  html += "</table>";
  block.innerHTML = `<h2>${university}</h2>
    <button class="remove-btn" onclick="removeUniversity('${university}')">✖</button>` + html;
}

function removeUniversity(university) {
  const block = document.getElementById(`block-${university}`);
  if (block) {
    block.remove();
  }
}

function resetFilters() {
  document.getElementById("universitySelect").value = "";
  document.getElementById("specialtySelect").value = "";
}

function clearAll() {
  document.getElementById("universitiesContainer").innerHTML = "";
  resetFilters();
}
