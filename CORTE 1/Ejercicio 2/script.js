document.getElementById('csvFileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function(event) {
      const csvText = event.target.result;
      formatCSVData(csvText); // Formatea la tabla directamente
    };

    reader.onerror = function() {
      alert('Error al leer el archivo CSV.');
    };

    reader.readAsText(file); // Lee el archivo como texto
  }
});

document.getElementById('toggleCsvButton').addEventListener('click', function() {
  const csvOutput = document.getElementById('csvOutput');
  if (csvOutput.style.display === 'none') {
    csvOutput.style.display = 'table';
    this.textContent = 'Ocultar Datos CSV';
  } else {
    csvOutput.style.display = 'none';
    this.textContent = 'Mostrar Datos CSV';
  }
});

document.getElementById('generateGroupsButton').addEventListener('click', function() {
  const groupSize = parseInt(document.getElementById('groupSize').value);
  if (isNaN(groupSize) || groupSize <= 0) {
    alert("Por favor, ingrese un tamaño de grupo válido (mayor que cero).");
    return;
  }

  const data = getTableData();
  if (data.length === 0) {
    alert("Por favor, cargue un archivo CSV y asegúrese de que la tabla esté visible.");
    return;
  }

  const groups = generateGroups(data, groupSize);
  displayGroupsInTable(groups); // Muestra los grupos en una tabla
});

document.getElementById('toggleGroupsButton').addEventListener('click', function() {
  const groupsTable = document.getElementById('groupsTable');
  if (groupsTable.style.display === 'none') {
    groupsTable.style.display = 'table';
    this.textContent = 'Ocultar Grupos';
  } else {
    groupsTable.style.display = 'none';
    this.textContent = 'Mostrar Grupos';
  }
});


function formatCSVData(csvText) {
  const outputTable = document.getElementById('csvOutput');
  outputTable.innerHTML = ''; // Limpia la tabla

  const lines = csvText.split('\n');
  if (lines.length === 0) {
    outputTable.innerHTML = '<tr><td>No data to display</td></tr>';
    return;
  }

  // Detecta el delimitador (coma, punto y coma, tabulación, etc.)
  const delimiter = detectDelimiter(csvText);

  // Crea las filas y celdas de la tabla
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const values = line.split(delimiter);
    const row = document.createElement('tr');

    for (let j = 0; j < values.length; j++) {
      const value = values[j];
      const cell = document.createElement(i === 0 ? 'th' : 'td'); // Usa <th> para la primera fila (encabezados)
      cell.textContent = value;
      row.appendChild(cell);
    }

    outputTable.appendChild(row);
  }
}

function detectDelimiter(csvText) {
    const delimiters = [',', ';', '\t', '|', ':'];
    const counts = {};
    const sampleLines = csvText.slice(0, 1000).split('\n').slice(0, 10); // Muestra de las primeras 10 líneas o 1000 caracteres

    for (const delimiter of delimiters) {
        counts[delimiter] = 0;
        for (const line of sampleLines) {
            // Utilizar una expresión regular para evitar problemas con delimitadores escapados
            const regex = new RegExp(escapeRegExp(delimiter), 'g');
            counts[delimiter] += (line.match(regex) || []).length;
        }
    }

    let bestDelimiter = ','; // Delimitador por defecto
    let bestCount = 0;

    for (const delimiter in counts) {
        if (counts[delimiter] > bestCount) {
            bestDelimiter = delimiter;
            bestCount = counts[delimiter];
        }
    }

    return bestDelimiter;
}

// Función para escapar caracteres especiales para la expresión regular
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getTableData() {
  const outputTable = document.getElementById('csvOutput');
  const data = [];
  const headers = [];

  // Obtiene los encabezados de la tabla
  const headerRow = outputTable.querySelector('tr');
  if (headerRow) {
    const headerCells = headerRow.querySelectorAll('th');
    headerCells.forEach(cell => {
      headers.push(cell.textContent.trim());
    });
  }

  // Obtiene los datos de las filas de la tabla
  const dataRows = outputTable.querySelectorAll('tr:not(:first-child)'); // Ignora la primera fila (encabezados)
  dataRows.forEach(row => {
    const rowData = {};
    const cells = row.querySelectorAll('td');

    for (let i = 0; i < headers.length; i++) {
      rowData[headers[i]] = cells[i].textContent.trim();
    }

    data.push(rowData);
  });

  return data;
}

function generateGroups(data, groupSize) {
    const males = [];
    const females = [];

    // Ensure that the keys "Nombre" and "Genero" are present in the data
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const name = row["Nombres y Apellidos"] || row["Nombre"] || row["Nombre Completo"] || ""; // Handle different name variations
        const gender = row["Genero"] || row["Género"] || ""; // Handle different gender variations

        if (gender.toUpperCase().includes("M")) {
            males.push({ name: name, gender: "M" });
        } else if (gender.toUpperCase().includes("F")) {
            females.push({ name: name, gender: "F" });
        }
    }

    // Shuffle the arrays to generate new random groups each time
    shuffleArray(males);
    shuffleArray(females);

    const groups = [];
    let currentGroup = [];

    // Prioritize females for balanced groups
    while (females.length > 0 || males.length > 0) {
        if (females.length > 0 && currentGroup.length < groupSize) {
            currentGroup.push(females.pop());
        } else if (males.length > 0 && currentGroup.length < groupSize) {
            currentGroup.push(males.pop());
        } else {
            groups.push(currentGroup);
            currentGroup = [];
        }
    }

    if (currentGroup.length > 0) {
        groups.push(currentGroup);
    }

    return groups;
}

// Function to shuffle an array (Fisher-Yates shuffle)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}


function displayGroupsInTable(groups) {
    const groupsTable = document.getElementById('groupsTable');
    groupsTable.innerHTML = ''; // Clear previous groups

    if (groups.length === 0) {
        groupsTable.style.display = 'none';
        return;
    }
    groupsTable.style.display = 'table'; // Show the groups table

    // Crea la cabecera de la tabla
    let headerRow = '<tr>';
    for (let i = 0; i < groups.length; i++) {
        headerRow += `<th>Grupo #${i + 1}</th>`;
    }
    headerRow += '</tr>';
    groupsTable.innerHTML += headerRow;

    // Encuentra el grupo más grande para determinar la cantidad de filas necesarias
    let maxGroupSize = 0;
    for (const group of groups) {
        if (group.length > maxGroupSize) {
            maxGroupSize = group.length;
        }
    }

    // Crea las filas de la tabla
    for (let i = 0; i < maxGroupSize; i++) {
        let dataRow = '<tr>';
        for (const group of groups) {
            if (group[i]) {
                dataRow += `<td>${group[i].name} - ${group[i].gender}</td>`;
            } else {
                dataRow += '<td></td>'; // Celda vacía si el grupo es más pequeño
            }
        }
        dataRow += '</tr>';
        groupsTable.innerHTML += dataRow;
    }
}