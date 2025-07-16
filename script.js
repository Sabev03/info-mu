document.addEventListener("DOMContentLoaded", function () {
  const universitySelect = document.getElementById("universitySelect");
  const specialtySelect = document.getElementById("specialtySelect");
  const universitiesContainer = document.getElementById("universitiesContainer");

  window.addUniversity = function () {
    const selected = universitySelect.value;
    const selectedSpec = specialtySelect.value;

    if (!selected || !data[selected]) return;

    let block = document.getElementById(`block-${selected}`);

    if (block) {
      updateUniversityBlock(block, selected, selectedSpec);
    } else {
      block = document.createElement("div");
      block.className = "university-block";
      block.id = `block-${selected}`;
      universitiesContainer.appendChild(block);
      updateUniversityBlock(block, selected, selectedSpec);
    }
  };

  window.updateUniversityBlock = function (block, university, specialtyFilter) {
    const universityData = data[university];
    const info = universityData.info;
    const specialties = specialtyFilter ? [specialtyFilter] : Object.keys(universityData.specialties);

    // Събиране на години, които имат масиви с елементи, дори и празни
    const yearsSet = new Set();
    specialties.forEach(spec => {
      if (universityData.specialties[spec]) {
        Object.keys(universityData.specialties[spec]).forEach(year => {
          const yearData = universityData.specialties[spec][year];
          const male = yearData["мъже"] || [];
          const female = yearData["жени"] || [];
          // Добавяме годината, ако има поне един елемент в масива (дори и празен)
          if (male.length > 0 || female.length > 0) {
            yearsSet.add(year);
          }
        });
      }
    });

    const years = Array.from(yearsSet).sort();

    if (years.length === 0) {
      block.innerHTML = `<h2>${university}</h2>
        <button class="remove-btn" onclick="removeUniversity('${university}')">✖</button>
        <p><i>Тази специалност <b>${specialtyFilter}</b> не се изучава в ${university}</i></p>`;
      return;
    }

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
      <table>
        <tr>
          <th>Специалност</th>
          <th>Година</th>`;

    for (let i = 1; i <= maxRounds; i++) {
      html += `<th>Класиране ${i}</th>`;
    }
    html += "</tr>";

    specialties.forEach(spec => {
      years.forEach(year => {
        const yearData = universityData.specialties[spec]?.[year] || {};
        const male = yearData["мъже"] || [];
        const female = yearData["жени"] || [];

        // Показваме ред, ако има поне един елемент в някой от масивите (включително празен)
        if (male.length === 0 && female.length === 0) return;

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

    // alert box за Софийски университет
    let alertHtml = "";
    if (university === "Софийски университет") {
      alertHtml = `<div class="alert-box" style="margin-top: 10px; padding: 10px; border: 1px solid #ffcc00; background-color: #fff8e1; color: #665500; font-weight: bold;">
        През 2023 и 2024 балообразуването различно с максимален БАЛ 36
      </div>`;
    }

    block.innerHTML = `<h2>${university}</h2>
      <button class="remove-btn" onclick="removeUniversity('${university}')">✖</button>` + html + alertHtml;
  };

  window.removeUniversity = function (name) {
    const block = document.getElementById(`block-${name}`);
    if (block) block.remove();
  };

  window.clearAll = function () {
    universitiesContainer.innerHTML = "";
    resetFilters();
  };

  window.resetFilters = function () {
    specialtySelect.value = "";
  };
});
