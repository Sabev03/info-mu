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

    const yearsSet = new Set();
    specialties.forEach(spec => {
      if (universityData.specialties[spec]) {
        Object.keys(universityData.specialties[spec]).forEach(year => {
          const yearData = universityData.specialties[spec][year];
          const male = yearData["мъже"] || [];
          const female = yearData["жени"] || [];
          if (male.length > 0 || female.length > 0) {
            yearsSet.add(year);
          }
        });
      }
    });

    const years = Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
    if (years.length === 0) {
      block.innerHTML = `<h2>${university}</h2>
        <button class="remove-btn" onclick="removeUniversity('${university}')">✖</button>
        <p><i>Тази специалност <b>${specialtyFilter}</b> не се изучава в ${university}</i></p>`;
      return;
    }

    // Откриване на максимален брой класирания
    let maxRounds = 0;
    let maxPaidRounds = 0;

    specialties.forEach(spec => {
      years.forEach(year => {
        const yearData = universityData.specialties[spec]?.[year] || {};
        const male = yearData["мъже"] || [];
        const female = yearData["жени"] || [];
        maxRounds = Math.max(maxRounds, male.length, female.length);

        const paid = yearData["платено"];
        if (paid) {
          if (university === "Софийски университет") {
            const paidMale = paid["мъже"] || [];
            const paidFemale = paid["жени"] || [];
            maxPaidRounds = Math.max(maxPaidRounds, paidMale.length, paidFemale.length);
          } else if (Array.isArray(paid)) {
            maxPaidRounds = Math.max(maxPaidRounds, paid.length);
          }
        }
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

    for (let i = 1; i <= maxPaidRounds; i++) {
      html += `<th>Платено ${i}</th>`;
    }

    html += "</tr>";

    specialties.forEach(spec => {
      years.forEach(year => {
        const yearData = universityData.specialties[spec]?.[year] || {};
        const male = yearData["мъже"] || [];
        const female = yearData["жени"] || [];

        if (male.length === 0 && female.length === 0) return;

        const isLastYear = year === years[0];
        html += `<tr${isLastYear ? ' style="background-color: #f0f0f0;"' : ''}><td>${spec}</td><td>${isLastYear ? '<b>' + year + '</b>' : year}</td>`;

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

        // Добавяне на колони за платено
        for (let i = 0; i < maxPaidRounds; i++) {
          let paidCell = "";
          const paid = yearData["платено"];
          if (paid) {
            if (university === "Софийски университет") {
              const paidMale = paid["мъже"] || [];
              const paidFemale = paid["жени"] || [];

              const hasMale = paidMale[i] !== undefined && paidMale[i] !== "";
              const hasFemale = paidFemale[i] !== undefined && paidFemale[i] !== "";

              if (hasMale || hasFemale) {
                const m = hasMale ? Number(paidMale[i]).toFixed(2).replace('.', ',') + ' <span style="color:darkblue"><b>(м)</b></span>' : '- <span style="color:darkblue"><b>(м)</b></span>';
                const f = hasFemale ? Number(paidFemale[i]).toFixed(2).replace('.', ',') + ' <span style="color:red"><b>(ж)</b></span>' : '- <span style="color:red"><b>(ж)</b></span>';
                paidCell = `${f} / ${m}`;
              }
            } else if (Array.isArray(paid) && paid[i] !== undefined && paid[i] !== "") {
              paidCell = Number(paid[i]).toFixed(2).replace('.', ',');
            }
          }

          html += `<td>${paidCell}</td>`;
        }

        html += "</tr>";
      });
    });

    html += "</table>";
    html += `
  <div class="export-buttons" style="margin-top: 10px;">
    <button onclick="printTable('${block.id}')">🖨️ Принт</button>
    <button onclick="exportPDF('${block.id}')">📄 PDF</button>
    <button onclick="exportExcel('${block.id}')">📊 Excel</button>
  </div>
`;

    let alertHtml = "";
    if (university === "Софийски университет") {
      alertHtml = `<div class="alert-box" style="margin-top: 10px; padding: 10px; border: 1px solid #ffcc00; background-color: #fff8e1; color: #665500; font-weight: bold;">
        През 2023 и 2024 балообразуването e различно с максимален БАЛ 36
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
function printTable(blockId) {
  const block = document.getElementById(blockId);
  const printWindow = window.open('', '', 'width=1000,height=700');
  const logo = '<div style="margin-bottom:20px;"><img src="logo.png" height="40" style="vertical-align:middle;"> <span style="font-size:18px;font-weight:bold;margin-left:10px;">Университети.БГ</span></div>';
  printWindow.document.write(`<html><head><title>Принт</title></head><body>${logo}${block.innerHTML}</body></html>`);
  printWindow.document.close();
  printWindow.print();
}

function exportPDF(blockId) {
  const block = document.getElementById(blockId);
  const element = block.cloneNode(true);

  // Добавяне на лого и заглавие най-горе
  const wrapper = document.createElement("div");
  wrapper.style.padding = "10px";

  const header = document.createElement("div");
  header.innerHTML = `
    <div style="display:flex; align-items:center; margin-bottom:20px;">
      <img src="logo.png" style="height:40px; margin-right:15px;">
      <span style="font-size:18px; font-weight:bold;">Университети.БГ</span>
    </div>
  `;
  wrapper.appendChild(header);
  wrapper.appendChild(element);

  html2pdf().set({
    margin: [0.3, 0.3, 0.3, 0.3],
    filename: 'университет.pdf',
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
  }).from(wrapper).save();
}

function exportExcel(blockId) {
  const table = document.querySelector(`#${blockId} table`);
  if (!table) return;

  const html = table.outerHTML;
  const filename = 'университет.xls';

  const downloadLink = document.createElement("a");
  downloadLink.href = 'data:application/vnd.ms-excel,' + encodeURIComponent(html);
  downloadLink.download = filename;
  downloadLink.click();
}

