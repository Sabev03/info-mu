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
      const years = ["2025", "2024"];

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

          html += `<tr><td>${spec}</td><td>${year}</td>`;
          for (let i = 0; i < maxRounds; i++) {
            const hasMale = male[i] !== undefined;
            const hasFemale = female[i] !== undefined;

            let m = hasMale ? Number(male[i]).toFixed(2).replace('.', ',') + ' <span style="color:darkblue"><b>(м)</b></span>' : '-';
            let f = hasFemale ? Number(female[i]).toFixed(2).replace('.', ',') + ' <span style="color:red"><b>(ж)</b></span>' : '-';

            let cellContent = (hasMale || hasFemale) ? `${hasFemale ? f : '- <span style="color:red"><b>(ж)</b></span>'} / ${hasMale ? m : '- <span style="color:darkblue"><b>(м)</b></span>'}` : '';

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