// Global variables
let tableA = [];
let tableB = [];

// Function to add data to a table
function addToTable(tableName) {
    const input = document.getElementById(`table${tableName}Input`).value.trim();
    if (!input) {
        alert(`Please enter data for Table ${tableName}`);
        return;
    }

    const rows = input.split('\n').map(row => row.split(',').map(cell => cell.trim()));
    if (rows.length < 2) {
        alert(`Table ${tableName} must have at least two rows (header and data)`);
        return;
    }

    if (tableName === 'A') {
        tableA = rows;
        updateKeySelection('A', rows[0]);
    } else {
        tableB = rows;
        updateKeySelection('B', rows[0]);
    }

    updateTableDisplay(tableName);
    updateSqlCode();
}

// Function to update table display
function updateTableDisplay(tableName) {
    const display = document.getElementById(`table${tableName}Display`);
    const data = tableName === 'A' ? tableA : tableB;
    display.innerHTML = data.map((row, index) => 
        `<div class="${index === 0 ? 'title-row' : ''}">${row.join(', ')}</div>`
    ).join('\n');
}

// Function to update key selection dropdowns
function updateKeySelection(tableName, columns) {
    const select = document.getElementById(`key${tableName}`);
    select.innerHTML = '<option value="all" selected>All Keys</option>' + 
        columns.map((col, index) => `<option value="${index}">${col}</option>`).join('');
}

// Function to update SQL code display
function updateSqlCode() {
    const joinType = document.getElementById('joinType').value;
    const keyA = document.getElementById('keyA').value;
    const keyB = document.getElementById('keyB').value;
    
    const tableAName = 'TableA';
    const tableBName = 'TableB';
    
    if (!tableA.length || !tableB.length) {
        document.getElementById('sqlCode').textContent = 'Please enter data for both tables.';
        return;
    }
    
    let joinCondition;
    if (keyA === 'all' && keyB === 'all') {
        joinCondition = tableA[0].map((col, i) => `${tableAName}.${col} = ${tableBName}.${tableB[0][i]}`).join(' AND ');
    } else if (keyA === 'all' || keyB === 'all') {
        document.getElementById('sqlCode').textContent = 'Please select either all keys for both tables or specific keys for each table.';
        return;
    } else {
        joinCondition = `${tableAName}.${tableA[0][keyA]} = ${tableBName}.${tableB[0][keyB]}`;
    }
    
    let sqlCode = '';
    switch (joinType) {
        case 'inner':
            sqlCode = `SELECT * FROM ${tableAName} INNER JOIN ${tableBName} ON ${joinCondition};`;
            break;
        case 'left':
            sqlCode = `SELECT * FROM ${tableAName} LEFT JOIN ${tableBName} ON ${joinCondition};`;
            break;
        case 'right':
            sqlCode = `SELECT * FROM ${tableAName} RIGHT JOIN ${tableBName} ON ${joinCondition};`;
            break;
        case 'full':
            sqlCode = `SELECT * FROM ${tableAName} FULL OUTER JOIN ${tableBName} ON ${joinCondition};`;
            break;
        case 'cross':
            sqlCode = `SELECT * FROM ${tableAName} CROSS JOIN ${tableBName};`;
            break;
        case 'self':
            sqlCode = `SELECT A.*, B.* FROM ${tableAName} A JOIN ${tableAName} B ON ${joinCondition.replace(tableBName, 'B').replace(tableAName, 'A')};`;
            break;
        case 'union':
            sqlCode = `SELECT * FROM ${tableAName} UNION SELECT * FROM ${tableBName};`;
            break;
        case 'intersect':
            sqlCode = `SELECT * FROM ${tableAName} INTERSECT SELECT * FROM ${tableBName};`;
            break;
        case 'except':
            sqlCode = `SELECT * FROM ${tableAName} EXCEPT SELECT * FROM ${tableBName};`;
            break;
        case 'natural':
            sqlCode = `SELECT * FROM ${tableAName} NATURAL JOIN ${tableBName};`;
            break;
        case 'left_semi':
            sqlCode = `SELECT DISTINCT ${tableAName}.* FROM ${tableAName} LEFT SEMI JOIN ${tableBName} ON ${joinCondition};`;
            break;
        case 'right_semi':
            sqlCode = `SELECT DISTINCT ${tableBName}.* FROM ${tableBName} RIGHT SEMI JOIN ${tableAName} ON ${joinCondition};`;
            break;
        case 'anti':
            sqlCode = `SELECT ${tableAName}.* FROM ${tableAName} LEFT JOIN ${tableBName} ON ${joinCondition} WHERE ${tableBName}.${tableB[0][0]} IS NULL;`;
            break;
    }
    
    document.getElementById('sqlCode').textContent = sqlCode.trim();
}

// Function to perform join operation
function performJoin() {
    const joinType = document.getElementById('joinType').value;
    const keyA = document.getElementById('keyA').value;
    const keyB = document.getElementById('keyB').value;
    
    if (!tableA.length || !tableB.length) {
        alert('Please enter data for both tables.');
        return;
    }
    
    if ((keyA === 'all' && keyB !== 'all') || (keyA !== 'all' && keyB === 'all')) {
        alert('Please select either all keys for both tables or specific keys for each table.');
        return;
    }

    let result = [];
    try {
        switch (joinType) {
            case 'inner':
                result = keyA === 'all' ? innerJoinAllKeys(tableA, tableB) : innerJoin(tableA, tableB, parseInt(keyA), parseInt(keyB));
                break;
            case 'left':
                result = keyA === 'all' ? leftJoinAllKeys(tableA, tableB) : leftJoin(tableA, tableB, parseInt(keyA), parseInt(keyB));
                break;
            case 'right':
                result = keyA === 'all' ? rightJoinAllKeys(tableA, tableB) : rightJoin(tableA, tableB, parseInt(keyA), parseInt(keyB));
                break;
            case 'full':
                result = keyA === 'all' ? fullOuterJoinAllKeys(tableA, tableB) : fullOuterJoin(tableA, tableB, parseInt(keyA), parseInt(keyB));
                break;
            case 'cross':
                result = crossJoin(tableA, tableB);
                break;
            case 'self':
                result = keyA === 'all' ? selfJoinAllKeys(tableA) : selfJoin(tableA, parseInt(keyA), parseInt(keyB));
                break;
            case 'union':
                result = unionJoin(tableA, tableB);
                break;
            case 'intersect':
                result = intersectJoin(tableA, tableB);
                break;
            case 'except':
                result = exceptJoin(tableA, tableB);
                break;
            case 'natural':
                result = naturalJoin(tableA, tableB);
                break;
            case 'left_semi':
                result = leftSemiJoin(tableA, tableB, keyA, keyB);
                break;
            case 'right_semi':
                result = rightSemiJoin(tableA, tableB, keyA, keyB);
                break;
            case 'anti':
                result = antiJoin(tableA, tableB, keyA, keyB);
                break;
        }
        updateJoinResultDisplay(result);
        visualizeJoin(joinType, result.length - 1); // Pass join type and result count to visualization
    } catch (error) {
        alert(`Error performing join: ${error.message}`);
    }
}


// Join functions for specific keys
function innerJoin(tableA, tableB, keyA, keyB) {
    const headerA = tableA[0], headerB = tableB[0];
    const dataA = tableA.slice(1), dataB = tableB.slice(1);
    const result = [headerA.concat(headerB.filter((_, i) => i !== keyB))];
    
    return result.concat(dataA.flatMap(rowA => 
        dataB.filter(rowB => rowA[keyA] === rowB[keyB])
            .map(rowB => rowA.concat(rowB.filter((_, i) => i !== keyB)))
    ));
}

function leftJoin(tableA, tableB, keyA, keyB) {
    const headerA = tableA[0], headerB = tableB[0];
    const dataA = tableA.slice(1), dataB = tableB.slice(1);
    const result = [headerA.concat(headerB.filter((_, i) => i !== keyB))];
    
    return result.concat(dataA.map(rowA => {
        const matchingRowsB = dataB.filter(rowB => rowA[keyA] === rowB[keyB]);
        return matchingRowsB.length > 0
            ? matchingRowsB.map(rowB => rowA.concat(rowB.filter((_, i) => i !== keyB)))
            : [rowA.concat(Array(headerB.length - 1).fill('NULL'))];
    }).flat());
}

function rightJoin(tableA, tableB, keyA, keyB) {
    return leftJoin(tableB, tableA, keyB, keyA)
        .map(row => [...row.slice(tableB[0].length), ...row.slice(0, tableB[0].length)]);
}

function fullOuterJoin(tableA, tableB, keyA, keyB) {
    const left = leftJoin(tableA, tableB, keyA, keyB);
    const right = rightJoin(tableA, tableB, keyA, keyB).slice(1);
    const header = left[0];
    
    const leftKeys = new Set(left.slice(1).map(row => row[keyA]));
    const rightOnly = right.filter(row => !leftKeys.has(row[tableB[0].length + keyA]));
    
    return [header, ...left.slice(1), ...rightOnly];
}

function crossJoin(tableA, tableB) {
    const headerA = tableA[0], headerB = tableB[0];
    const dataA = tableA.slice(1), dataB = tableB.slice(1);
    const result = [headerA.concat(headerB)];
    
    return result.concat(dataA.flatMap(rowA => 
        dataB.map(rowB => rowA.concat(rowB))
    ));
}

function selfJoin(table, keyA, keyB) {
    const header = table[0];
    const data = table.slice(1);
    const result = [header.concat(header.map(h => h + '_2'))];
    
    return result.concat(data.flatMap(rowA => 
        data.filter(rowB => rowA[keyA] === rowB[keyB] && rowA !== rowB)
            .map(rowB => rowA.concat(rowB))
    ));
}

function unionJoin(tableA, tableB) {
    if (tableA[0].length !== tableB[0].length) {
        throw new Error("Tables must have the same number of columns for UNION");
    }
    
    const result = [tableA[0]];
    const uniqueRows = new Set(tableA.slice(1).map(JSON.stringify));
    
    tableB.slice(1).forEach(row => {
        const rowString = JSON.stringify(row);
        if (!uniqueRows.has(rowString)) {
            uniqueRows.add(rowString);
            result.push(row);
        }
    });
    
    return result;
}

// Join functions for all keys
function innerJoinAllKeys(tableA, tableB) {
    const headerA = tableA[0], headerB = tableB[0];
    const dataA = tableA.slice(1), dataB = tableB.slice(1);
    const result = [headerA.concat(headerB)];
    
    return result.concat(dataA.flatMap(rowA => 
        dataB.filter(rowB => rowA.every((val, i) => val === rowB[i]))
            .map(rowB => rowA.concat(rowB))
    ));
}

function leftJoinAllKeys(tableA, tableB) {
    const headerA = tableA[0], headerB = tableB[0];
    const dataA = tableA.slice(1), dataB = tableB.slice(1);
    const result = [headerA.concat(headerB)];
    
    return result.concat(dataA.map(rowA => {
        const matchingRowsB = dataB.filter(rowB => rowA.every((val, i) => val === rowB[i]));
        return matchingRowsB.length > 0
            ? matchingRowsB.map(rowB => rowA.concat(rowB))
            : [rowA.concat(Array(headerB.length).fill('NULL'))];
    }).flat());
}

function rightJoinAllKeys(tableA, tableB) {
    return leftJoinAllKeys(tableB, tableA)
        .map(row => [...row.slice(tableB[0].length), ...row.slice(0, tableB[0].length)]);
}

function fullOuterJoinAllKeys(tableA, tableB) {
    const left = leftJoinAllKeys(tableA, tableB);
    const right = rightJoinAllKeys(tableA, tableB).slice(1);
    const header = left[0];
    
    const leftKeys = new Set(left.slice(1).map(row => row.slice(0, tableA[0].length).join(',')));
    const rightOnly = right.filter(row => !leftKeys.has(row.slice(tableB[0].length).join(',')));
    
    return [header, ...left.slice(1), ...rightOnly];
}

function selfJoinAllKeys(table) {
    const header = table[0];
    const data = table.slice(1);
    const result = [header.concat(header.map(h => h + '_2'))];
    
    return result.concat(data.flatMap((rowA, i) => 
        data.slice(i + 1).map(rowB => rowA.concat(rowB))
    ));
}

// Function to update join result display
function updateJoinResultDisplay(result) {
    const display = document.getElementById('joinResultDisplay');
    display.innerHTML = result.map((row, index) => 
        `<div class="${index === 0 ? 'title-row' : ''}">${row.join(', ')}</div>`
    ).join('\n');
    
    const message = document.getElementById('joinResultMessage');
    message.textContent = `Join result: ${result.length - 1} rows`;
}

// Function to visualize join operation
function visualizeJoin(joinType, resultCount) {
    const canvas = document.getElementById('visualizationCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Draw two circles representing the tables
    ctx.beginPath();
    ctx.arc(centerX - radius/3, centerY, radius/2, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fill();
    ctx.strokeStyle = 'red';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX + radius/3, centerY, radius/2, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
    ctx.fill();
    ctx.strokeStyle = 'blue';
    ctx.stroke();

    // Highlight the intersection based on join type
    ctx.beginPath();
    switch (joinType) {
        case 'inner':
            ctx.arc(centerX - radius/3, centerY, radius/2, -Math.PI/3, Math.PI/3);
            ctx.arc(centerX + radius/3, centerY, radius/2, 2*Math.PI/3, 4*Math.PI/3);
            ctx.fillStyle = 'rgba(128, 0, 128, 0.5)';
            ctx.fill();
            break;
        case 'left':
            ctx.arc(centerX - radius/3, centerY, radius/2, -Math.PI/2, Math.PI/2);
            ctx.fillStyle = 'rgba(128, 0, 128, 0.5)';
            ctx.fill();
            break;
        case 'right':
            ctx.arc(centerX + radius/3, centerY, radius/2, Math.PI/2, 3*Math.PI/2);
            ctx.fillStyle = 'rgba(128, 0, 128, 0.5)';
            ctx.fill();
            break;
        case 'full':
            ctx.arc(centerX - radius/3, centerY, radius/2, 0, 2 * Math.PI);
            ctx.arc(centerX + radius/3, centerY, radius/2, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(128, 0, 128, 0.5)';
            ctx.fill();
            break;
        case 'cross':
            ctx.rect(centerX - radius, centerY - radius/2, radius * 2, radius);
            ctx.fillStyle = 'rgba(128, 0, 128, 0.5)';
            ctx.fill();
            break;
        case 'union':
            ctx.arc(centerX - radius/3, centerY, radius/2, 0, 2 * Math.PI);
            ctx.arc(centerX + radius/3, centerY, radius/2, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(128, 0, 128, 0.5)';
            ctx.fill();
            break;
        case 'intersect':
            ctx.arc(centerX - radius/3, centerY, radius/2, -Math.PI/3, Math.PI/3);
            ctx.arc(centerX + radius/3, centerY, radius/2, 2*Math.PI/3, 4*Math.PI/3);
            ctx.fillStyle = 'rgba(128, 0, 128, 0.5)';
            ctx.fill();
            break;
        case 'except':
            ctx.arc(centerX - radius/3, centerY, radius/2, Math.PI/3, 5*Math.PI/3);
            ctx.fillStyle = 'rgba(128, 0, 128, 0.5)';
            ctx.fill();
            break;
        // For other join types, we'll just show the two circles
    }

    // Add labels
    ctx.fillStyle = 'black';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Table A', centerX - radius/3, centerY - radius/2 - 10);
    ctx.fillText('Table B', centerX + radius/3, centerY - radius/2 - 10);
    ctx.fillText(`${joinType.toUpperCase()} JOIN`, centerX, canvas.height - 20);
    ctx.fillText(`Result: ${resultCount} rows`, centerX, 20);
}

function intersectJoin(tableA, tableB) {
    const headerA = tableA[0];
    const dataA = tableA.slice(1);
    const dataB = tableB.slice(1);
    const result = [headerA];
    
    return result.concat(dataA.filter(rowA => 
        dataB.some(rowB => rowA.every((val, i) => val === rowB[i]))
    ));
}

function exceptJoin(tableA, tableB) {
    const headerA = tableA[0];
    const dataA = tableA.slice(1);
    const dataB = tableB.slice(1);
    const result = [headerA];
    
    return result.concat(dataA.filter(rowA => 
        !dataB.some(rowB => rowA.every((val, i) => val === rowB[i]))
    ));
}

function naturalJoin(tableA, tableB) {
    const headerA = tableA[0];
    const headerB = tableB[0];
    const dataA = tableA.slice(1);
    const dataB = tableB.slice(1);
    
    const commonColumns = headerA.filter(col => headerB.includes(col));
    const result = [commonColumns.concat(headerA.filter(col => !commonColumns.includes(col)), headerB.filter(col => !commonColumns.includes(col)))];
    
    return result.concat(dataA.flatMap(rowA => {
        const matchingRowsB = dataB.filter(rowB => 
            commonColumns.every(col => rowA[headerA.indexOf(col)] === rowB[headerB.indexOf(col)])
        );
        return matchingRowsB.map(rowB => 
            commonColumns.map(col => rowA[headerA.indexOf(col)])
                .concat(headerA.filter(col => !commonColumns.includes(col)).map(col => rowA[headerA.indexOf(col)]))
                .concat(headerB.filter(col => !commonColumns.includes(col)).map(col => rowB[headerB.indexOf(col)]))
        );
    }));
}

function leftSemiJoin(tableA, tableB, keyA, keyB) {
    const headerA = tableA[0];
    const dataA = tableA.slice(1);
    const dataB = tableB.slice(1);
    const result = [headerA];
    
    return result.concat(dataA.filter(rowA => 
        dataB.some(rowB => (keyA === 'all' ? rowA.every((val, i) => val === rowB[i]) : rowA[keyA] === rowB[keyB]))
    ));
}

function rightSemiJoin(tableA, tableB, keyA, keyB) {
    return leftSemiJoin(tableB, tableA, keyB, keyA);
}

function antiJoin(tableA, tableB, keyA, keyB) {
    const headerA = tableA[0];
    const dataA = tableA.slice(1);
    const dataB = tableB.slice(1);
    const result = [headerA];
    
    return result.concat(dataA.filter(rowA => 
        !dataB.some(rowB => (keyA === 'all' ? rowA.every((val, i) => val === rowB[i]) : rowA[keyA] === rowB[keyB]))
    ));
}

// Function to update join result display
function updateJoinResultDisplay(result) {
    const display = document.getElementById('joinResultDisplay');
    display.innerHTML = result.map((row, index) => 
        `<div class="${index === 0 ? 'title-row' : ''}">${row.join(', ')}</div>`
    ).join('\n');
    
    const message = document.getElementById('joinResultMessage');
    message.textContent = `Join result: ${result.length - 1} rows`;
}

// Function to export result as CSV
function exportCSV(result) {
    const csvContent = result.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'join_result.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Initialize the application
function init() {
    // Populate tables with sample data
    document.getElementById('tableAInput').value = 'id,name\n1,Alice\n2,Bob\n3,Charlie';
    document.getElementById('tableBInput').value = 'id,age\n1,30\n2,25\n4,35';
    
    // Add event listeners
    document.getElementById('updateTableABtn').addEventListener('click', () => addToTable('A'));
    document.getElementById('updateTableBBtn').addEventListener('click', () => addToTable('B'));
    document.getElementById('tableAInput').addEventListener('change', () => addToTable('A'));
    document.getElementById('tableBInput').addEventListener('change', () => addToTable('B'));
    document.getElementById('joinType').addEventListener('change', updateSqlCode);
    document.getElementById('keyA').addEventListener('change', updateSqlCode);
    document.getElementById('keyB').addEventListener('change', updateSqlCode);
    document.getElementById('performJoinBtn').addEventListener('click', performJoin);
    document.getElementById('exportBtn').addEventListener('click', () => {
        const result = document.getElementById('joinResultDisplay').textContent
            .split('\n')
            .map(row => row.split(', '));
        exportCSV(result);
    });

    // Initialize tables
    addToTable('A');
    addToTable('B');

    // Setup instructions mouseover
    const instructionsButton = document.getElementById('instructionsButton');
    const instructions = document.getElementById('instructions');

    instructionsButton.addEventListener('mouseenter', () => {
        instructions.style.display = 'block';
    });

    instructionsButton.addEventListener('mouseleave', () => {
        instructions.style.display = 'none';
    });

    instructions.addEventListener('mouseenter', () => {
        instructions.style.display = 'block';
    });

    instructions.addEventListener('mouseleave', () => {
        instructions.style.display = 'none';
    });
	
	// Remove the visualization canvas as it's no longer needed
    //const canvas = document.getElementById('visualizationCanvas');
    //if (canvas) {
    //    canvas.remove();
    //}
}

// Call init function when the page loads
window.onload = init;