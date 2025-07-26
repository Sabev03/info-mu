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
  <div style="margin-top: 15px;">
    <button onclick="printBlock('block-${university}')">🖨️ Принтирай</button>
    <button onclick="exportPDFTable('block-${university}')">📄 PDF</button>
    <button type="button" onclick="exportExcel('block-${university}')">📊 Excel</button>

  </div>`;

//АЛЪРТ ЗА ВСЕКИ УНИВЕРСИТЕТ
    let alertHtml = "";
    //СОФИЙСКИ
    if (university === "Софийски университет") {
      alertHtml = `<div class="alert-box" style="margin-top: 10px; padding: 10px; border: 1px solid #ffcc00; background-color: #fff8e1; color: #665500; font-weight: bold;">
        През 2023 и 2024 балообразуването e различно с максимален БАЛ 36
      </div> <i>Данните за 2022-2024 г. са предоствени от СУ "Св. Климент Охридски" по заявление за достъп до обществена информация №90-00-10/17.07.2025 г. с Решение №РД-19-447/23.07.2025 Г.</i>`;
    //БУРГАСКИ  
    } else if (university === "Бургаски държавен университет Проф д-р. Асен Златанов") {
  alertHtml = `<div class="alert-box" style="margin-top: 10px; padding: 10px; border: 1px solid #0077cc; background-color: #e6f3ff; color: #003366; font-weight: bold;">
    След подадено заявление за достъп до обществена информация от БДУ отказаха да ми предоставят справка за минималните балове. Тази информация била статистика, а те нямали ресусрса да я изготвят...
  </div>`;
    //МУ-СОФИЯ
  //} else if (university === "Медицински университет-София") {
  //alertHtml = `<div class="alert-box" style="margin-top: 10px; padding: 10px; border: 1px solid #0077cc; background-color: #e6f3ff; color: #003366; font-weight: bold;">
    
  //</div>`;
  //МУ-ВАРНА
} else if (university === "Медицински университет-Варна") {
  alertHtml = `<div class="alert-box" style="margin-top: 10px; padding: 10px; border: 1px solid #0077cc; background-color: #e6f3ff; color: #003366; font-weight: bold;">
    За специалността "Военен лекар" балообразуването е друго!
  </div>`;
 //МУ-ПЛОВДИВ 
} else if (university === "Медицински университет-Пловдив") {
  alertHtml = `<div class="alert-box" style="margin-top: 10px; padding: 10px; border: 1px solid #0077cc; background-color: #e6f3ff; color: #003366; font-weight: bold;">
    В момента тече въвеждане на информацията от стари години.
  </div>`;
  //МУ ПЛЕВЕН  
} else if (university === "Медицински университет-Плевен") {
  alertHtml = `<div class="alert-box" style="margin-top: 10px; padding: 10px; border: 1px solid #0077cc; background-color: #e6f3ff; color: #003366; font-weight: bold;">
    Ще бъде подадено заявление по ЗДОИ за справка за минимални балове от предходни години.
  </div>`;
  //ТРАКИЙСКИ УНИВЕРСИТЕТ  
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

//ЕКСПОРТ
//window.printBlock = function (blockId) {
  //const printContents = document.getElementById(blockId).innerHTML;
  //const originalContents = document.body.innerHTML;

  //document.body.innerHTML = printContents;
  //window.print();
 // document.body.innerHTML = originalContents;
  //location.reload(); // да възстановим JS-а след принт
//}; 
window.printBlock = function (blockId) {
  const content = document.getElementById(blockId);
  if (!content) return alert("Няма какво да се принтира.");

  const win = window.open("", "_blank");

  const siteUrl = window.location.origin;
const now = new Date();
const formattedDate = now.toLocaleString('bg-BG', {
  dateStyle: 'short',
  timeStyle: 'short'
});
  win.document.write(`
    <html>
      <head>
        <title>Принтиране</title>
        <style>
          @media print {
            @page {
              size: landscape;
              margin: 0; /* Премахва полетата колкото браузърът позволява */
            }
            body {
              margin: 0;
            }
          }

          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: white;
          }

          table {
            border-collapse: collapse;
            width: 100%;
          }

          th, td {
            border: 1px solid #ccc;
            padding: 6px;
            text-align: center;
          }

          th {
            background-color: #2980b9;
            color: white;
          }

          tr:nth-child(even) {
            background-color: #f2f2f2;
          }

          .remove-btn, button {
            display: none;
          }

          .generated-note {
            margin-top: 30px;
            text-align: center;
            font-style: italic;
            font-size: 0.9em;
            color: #666;
          }
        </style>
      </head>
      <body>
        ${content.innerHTML}

        <div class="generated-note">
          Справката е генерирана през <a href="${siteUrl}/info-mu" target="_blank">${siteUrl}/info-mu</a> на ${formattedDate} ч.
        </div>

        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
            }, 300);

            window.onafterprint = function () {
              window.close();
            };
          };
        </script>
      </body>
    </html>
  `);

  win.document.close();
};


window.exportPDFTable = async function (blockId) {
  const block = document.getElementById(blockId);
  if (!block) return alert("Таблицата не е намерена.");

  const table = block.querySelector("table");
  if (!table) return alert("Таблица не е намерена.");

  const universityName = block.querySelector("h2")?.innerText || "Университет";

  const now = new Date();
  const formattedDate = now.toLocaleString('bg-BG', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

  const siteUrl = window.location.origin;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape" });

  // Зареждаме кирилския шрифт
  doc.addFileToVFS("LiberationSans-Regular.ttf", LiberationSans);
  doc.addFont("LiberationSans-Regular.ttf", "LiberationSans", "normal");
  doc.setFont("LiberationSans", "normal");
  doc.setFontSize(16);
  doc.text(universityName, 14, 15);

  doc.setFontSize(10);

  doc.autoTable({
    html: table,
    startY: 20,
    useCSS: true,
    styles: {
      font: "LiberationSans",
      fontSize: 9,
      cellPadding: 2,
      overflow: 'linebreak',
      textColor: [0, 0, 0],
      fillColor: false,
    },
    didParseCell: function (data) {
  const cell = data.cell;
  const node = data.cell.raw;
  if (!node) return;

  const html = node.innerHTML;

  // Превръщане на HTML съдържанието в plain текст с цветови маркери
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const richParts = [];
  tempDiv.childNodes.forEach(child => {
    if (child.nodeType === Node.TEXT_NODE) {
      richParts.push({
        text: child.textContent,
        styles: { textColor: [0, 0, 0] } // черен текст
      });
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const color = window.getComputedStyle(child).color;
      let rgb = [0, 0, 0]; // по подразбиране
      if (color) {
        const matches = color.match(/\d+/g);
        if (matches) {
          rgb = matches.map(Number);
        }
      }

      richParts.push({
        text: child.textContent,
        styles: { textColor: rgb }
      });
    }
  });

  if (richParts.length > 0) {
    cell.richText = richParts;
    cell.text = richParts.map(p => p.text).join(""); // fallback
  }

  // Поддръжка на фонов цвят
  const bg = window.getComputedStyle(node).backgroundColor;
  if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
    const rgb = bg.match(/\d+/g);
    if (rgb) {
      cell.styles.fillColor = [parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2])];
    }
  }
},
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    theme: 'grid'
  });

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Справката е генерирана през ${siteUrl}/info-mu на ${formattedDate} ч.`, 14, doc.internal.pageSize.height - 10);

  doc.save(`${universityName.replace(/\s+/g, "_")}_${formattedDate.replace(/[^\d]/g, "-")}.pdf`);
};



window.exportExcel = function (blockId) {
  const block = document.getElementById(blockId);
  if (!block) return alert("Блокът не е намерен.");

  const table = block.querySelector("table");
  if (!table) return alert("Таблицата не е намерена.");

  const universityName = block.querySelector("h2")?.innerText || "Университет";

  const now = new Date();
  const formattedDate = now.toLocaleString('bg-BG', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

  const clonedTable = table.cloneNode(true);
  clonedTable.querySelectorAll("button").forEach(btn => btn.remove());

  const siteUrl = window.location.origin;

  // 🆕 Генерирай безопасно име за файл още тук
 const safeFileName = `${universityName.replace(/\s+/g, "_")}_${formattedDate.replace(/[^\d]/g, "-")}.xls`;

  const htmlContent = `
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${universityName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 13px;
          padding: 20px;
        }
        h2 {
          margin-bottom: 10px;
        }
        table {
          border-collapse: collapse;
          width: 100%;
        }
        th, td {
          border: none;
          padding: 6px;
          text-align: center;
        }
        span[color="red"] {
          color: red;
          font-weight: bold;
        }
        span[color="blue"] {
          color: blue;
          font-weight: bold;
        }
        .footer-note {
          margin-top: 30px;
          text-align: center;
          font-style: italic;
          color: #555;
        }
        .zaglavie { text-align: center; }
      </style>
    </head>
    <body>
      <h2 class="zaglavie">${universityName}</h2>
      ${clonedTable.outerHTML}<br>
      <div class="footer-note">
        Справката е генерирана през <a href="${siteUrl}/info-mu" target="_blank">${siteUrl}/info-mu</a> на ${formattedDate} ч.
      </div>

      <script>
        const blob = new Blob([document.documentElement.outerHTML], { type: "application/vnd.ms-excel" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "${safeFileName}";  // 👈 директно вградено като текст
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          window.close();
        }, 10000);
      </script>
    </body>
    </html>
  `;

  const win = window.open("", "_blank");
  win.document.open();
  win.document.write(htmlContent);
  win.document.close();
};







