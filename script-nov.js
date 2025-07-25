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

//АЛЪРТ ЗА ВСЕКИ УНИВЕРСИТЕТ
    let alertHtml = "";
    if (university === "Софийски университет") {
      alertHtml = `<div class="alert-box" style="margin-top: 10px; padding: 10px; border: 1px solid #ffcc00; background-color: #fff8e1; color: #665500; font-weight: bold;">
        През 2023 и 2024 балообразуването e различно с максимален БАЛ 36
      </div>`;
      } else if (university === "Бургаски държавен университет Проф д-р. Асен Златанов") {
  alertHtml = `<div class="alert-box" style="margin-top: 10px; padding: 10px; border: 1px solid #0077cc; background-color: #e6f3ff; color: #003366; font-weight: bold;">
    След подадено заявление за достъп до обществена информация от БДУ отказаха да ми предоставят справка за минималните балове. Тази информация била статистика, а те нямали ресусрса да я изготвят...
  </div>`;
  } else if (university === "Медицински университет-София") {
  alertHtml = `<div class="alert-box" style="margin-top: 10px; padding: 10px; border: 1px solid #0077cc; background-color: #e6f3ff; color: #003366; font-weight: bold;">
    В момента тече въвеждане на информацията от стари години.
  </div>`;
  } else if (university === "Медицински университет-Варна") {
  alertHtml = `<div class="alert-box" style="margin-top: 10px; padding: 10px; border: 1px solid #0077cc; background-color: #e6f3ff; color: #003366; font-weight: bold;">
    В момента тече въвеждане на информацията от стари години.
  </div>`;
  } else if (university === "Медицински университет-Пловдив") {
  alertHtml = `<div class="alert-box" style="margin-top: 10px; padding: 10px; border: 1px solid #0077cc; background-color: #e6f3ff; color: #003366; font-weight: bold;">
    В момента тече въвеждане на информацията от стари години.
  </div>`;
  } else if (university === "Медицински университет-Плевен") {
  alertHtml = `<div class="alert-box" style="margin-top: 10px; padding: 10px; border: 1px solid #0077cc; background-color: #e6f3ff; color: #003366; font-weight: bold;">
    Ще бъде подадено заявление по ЗДОИ за справка за минимални балове от предходни години.
  </div>`;
  } else if (university === "Тракийски университет-Стара Загора") {
  alertHtml = `<div class="alert-box" style="margin-top: 10px; padding: 10px; border: 1px solid #0077cc; background-color: #e6f3ff; color: #003366; font-weight: bold;">
    Подадено е заявление по ЗДОИ за справка за минимални балове от предходни години. В очакване съм на отговор. Статус: още не е входирано
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

function exportPDF(blockId) {
  const block = document.getElementById(blockId);
  if (!block) return;

  const uniName = fileSafe(getUniversityName(block));

  // Клониране на блока без бутона за изтриване
  const clonedBlock = block.cloneNode(true);
  const removeBtn = clonedBlock.querySelector('.remove-btn');
  if (removeBtn) removeBtn.remove();

  // Премахване на емоджита и празен телефон
  clonedBlock.innerHTML = clonedBlock.innerHTML.replace('😢', '').replace(/Телефон:<[^>]+><\/p>/g, '');

  // Създаваме невидим контейнер
  const hiddenContainer = document.createElement('div');
  hiddenContainer.style.position = 'fixed';
  hiddenContainer.style.left = '-9999px';
  hiddenContainer.style.top = '0';
  hiddenContainer.style.width = '297mm'; // A4 landscape
  hiddenContainer.style.background = '#fff';

  const wrapper = document.createElement('div');
  wrapper.style.padding = '20px';
  wrapper.style.fontFamily = 'Arial, sans-serif';

  const header = document.createElement('div');
  header.innerHTML = `
    <div style="display:flex; align-items:center; margin-bottom:20px;">
      <img src="sabev-orange.png" style="height:40px; margin-right:15px;">
      <span style="font-size:18px; font-weight:bold;">Университети.БГ</span>
    </div>
  `;

  // Слагаме стилове за таблицата да се мащабира
  const style = document.createElement('style');
  style.textContent = `
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 6px;
      text-align: center;
      font-size: 10px;
    }
    h2 {
      margin-bottom: 10px;
    }
  `;
  wrapper.appendChild(style);
  wrapper.appendChild(header);
  wrapper.appendChild(clonedBlock);
  hiddenContainer.appendChild(wrapper);
  document.body.appendChild(hiddenContainer);

  html2pdf().set({
    margin: [0.5, 0.5, 0.5, 0.5],
    filename: `${uniName}.pdf`,
    html2canvas: { scale: 1, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  })
  .from(wrapper)
  .save()
  .then(() => document.body.removeChild(hiddenContainer))
  .catch(() => document.body.removeChild(hiddenContainer));
}

function exportExcel(blockId) {
  const block = document.getElementById(blockId);
  if (!block) return;

  const table = block.querySelector('table');
  if (!table) return;

  const uniName = fileSafe(getUniversityName(block));
  const html = '\ufeff' + table.outerHTML;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${uniName}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printBlock(blockId) {
  const block = document.getElementById(blockId);
  if (!block) return;

  const uniName = getUniversityName(block);

  const printWindow = window.open('', '', 'width=1200,height=800');
  printWindow.document.write(`
    <html>
      <head>
        <title>${uniName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
          h2 { margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div style="display:flex; align-items:center; margin-bottom:20px;">
          <img src="sabev-orange.png" style="height:40px; margin-right:15px;">
          <span style="font-size:18px; font-weight:bold;">Университети.БГ</span>
        </div>
        ${block.innerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

function getUniversityName(block) {
  const h2 = block.querySelector('h2');
  return h2 ? h2.innerText.trim() : 'Университет';
}

function fileSafe(name) {
  return name.replace(/[^a-zA-Z0-9а-яА-Я _-]/g, '').replace(/\s+/g, '_');
}