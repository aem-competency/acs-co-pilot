export default function decorate(block) {
  // Get all rows from the block
  const rows = [...block.children];
  
  // Create table element
  const table = document.createElement('table');
  table.className = 'table-content';
  
  // Create thead with first row
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  // Process header row
  const firstRow = rows[0];
  [...firstRow.children].forEach((cell) => {
    const th = document.createElement('th');
    th.textContent = cell.textContent.trim();
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Create tbody with remaining rows
  const tbody = document.createElement('tbody');
  
  // Calculate rowspans for first two columns
  const columnData = [];
  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const cells = [...row.children];
    columnData.push({
      col1: cells[0]?.textContent.trim() || '',
      col2: cells[1]?.textContent.trim() || '',
      cells
    });
  }
  
  // Calculate rowspan for column 1 (Activation)
  const col1Rowspans = [];
  let currentValue = null;
  let spanStart = 0;
  
  for (let i = 0; i < columnData.length; i += 1) {
    if (columnData[i].col1 !== currentValue) {
      if (currentValue !== null) {
        const spanLength = i - spanStart;
        for (let j = spanStart; j < i; j += 1) {
          col1Rowspans[j] = { rowspan: spanLength, isFirst: j === spanStart };
        }
      }
      currentValue = columnData[i].col1;
      spanStart = i;
    }
  }
  // Handle last group
  if (currentValue !== null) {
    const spanLength = columnData.length - spanStart;
    for (let j = spanStart; j < columnData.length; j += 1) {
      col1Rowspans[j] = { rowspan: spanLength, isFirst: j === spanStart };
    }
  }
  
  // Calculate rowspan for column 2 (Phase)
  const col2Rowspans = [];
  currentValue = null;
  spanStart = 0;
  
  for (let i = 0; i < columnData.length; i += 1) {
    const key = `${columnData[i].col1}|${columnData[i].col2}`;
    if (columnData[i].col2 !== currentValue || 
        (i > 0 && columnData[i].col1 !== columnData[i - 1].col1)) {
      if (currentValue !== null) {
        const spanLength = i - spanStart;
        for (let j = spanStart; j < i; j += 1) {
          col2Rowspans[j] = { rowspan: spanLength, isFirst: j === spanStart };
        }
      }
      currentValue = columnData[i].col2;
      spanStart = i;
    }
  }
  // Handle last group
  if (currentValue !== null) {
    const spanLength = columnData.length - spanStart;
    for (let j = spanStart; j < columnData.length; j += 1) {
      col2Rowspans[j] = { rowspan: spanLength, isFirst: j === spanStart };
    }
  }
  
  // Build table rows with rowspans
  for (let i = 0; i < columnData.length; i += 1) {
    const tr = document.createElement('tr');
    const { cells } = columnData[i];
    
    cells.forEach((cell, index) => {
      const td = document.createElement('td');
      td.textContent = cell.textContent.trim();
      
      // Handle first column (Activation)
      if (index === 0) {
        td.classList.add('table-first-column');
        if (col1Rowspans[i]) {
          if (col1Rowspans[i].isFirst) {
            td.setAttribute('rowspan', col1Rowspans[i].rowspan);
            tr.appendChild(td);
          }
          // Skip adding if not the first in the span
        }
      } 
      // Handle second column (Phase)
      else if (index === 1) {
        if (col2Rowspans[i]) {
          if (col2Rowspans[i].isFirst) {
            td.setAttribute('rowspan', col2Rowspans[i].rowspan);
            tr.appendChild(td);
          }
          // Skip adding if not the first in the span
        }
      } 
      // All other columns
      else {
        tr.appendChild(td);
      }
    });
    
    tbody.appendChild(tr);
  }
  
  table.appendChild(tbody);
  
  // Create container and add table
  const container = document.createElement('div');
  container.className = 'table-container';
  container.appendChild(table);
  
  // Replace block content with new structure
  block.innerHTML = '';
  block.appendChild(container);
}
