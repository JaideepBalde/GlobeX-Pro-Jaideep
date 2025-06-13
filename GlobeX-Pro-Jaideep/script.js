// Global Variables
let currentSection = 'overview';
let meetings = JSON.parse(localStorage.getItem('meetings') || '[]');
let snippets = JSON.parse(localStorage.getItem('snippets') || '[]');
let notes = JSON.parse(localStorage.getItem('notes') || '[]');
let tasks = JSON.parse(localStorage.getItem('kanbanTasks') || '[]');
let currentDate = new Date();
let currentNote = null;
let currentSnippet = null;
let draggedTask = null;
let mindMapNodes = [];
let mindMapConnections = [];
let nodeIdCounter = 0;
let countries = [];
let isScientificMode = false;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateStats();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    loadCountries();
});

function initializeApp() {
    showSection('overview');
    renderCalendar();
    renderMeetings();
    renderSnippets();
    renderNotes();
    renderKanbanBoard();
    initializeMindMap();
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            showSection(section);
            updateNavigation(section);
        });
    });

    // Utility cards navigation
    document.querySelectorAll('.utility-card').forEach(card => {
        card.addEventListener('click', () => {
            const section = card.dataset.section;
            showSection(section);
            updateNavigation(section);
        });
    });

    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.closest('.modal').classList.remove('active');
        });
    });

    // Meeting Scheduler
    setupMeetingScheduler();
    
    // Resume Builder
    setupResumeBuilder();
    
    // Markdown Converter
    setupMarkdownConverter();
    
    // CSV Viewer
    setupCSVViewer();
    
    // Mind Map
    setupMindMap();
    
    // Code Snippets
    setupCodeSnippets();
    
    // Secure Notes
    setupSecureNotes();
    
    // JSON Tools
    setupJSONTools();
    
    // Kanban Board
    setupKanbanBoard();
    
    // Image Compressor
    setupImageCompressor();
    
    // Dictionary
    setupDictionary();
    
    // Countries
    setupCountries();
    
    // Calculator
    setupCalculator();
    
    // Weather
    setupWeather();
    
    // QR Generator
    setupQRGenerator();
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    currentSection = sectionId;
}

function updateNavigation(sectionId) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
}

function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('currentTime').textContent = timeString;
}

function updateStats() {
    document.getElementById('schedulerCount').textContent = `${meetings.length} meetings`;
    document.getElementById('snippetCount').textContent = `${snippets.length} snippets`;
    document.getElementById('taskCount').textContent = `${tasks.length} tasks`;
}

// Meeting Scheduler Functions
function setupMeetingScheduler() {
    document.getElementById('addMeeting').addEventListener('click', () => {
        document.getElementById('meetingModal').classList.add('active');
    });

    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    document.getElementById('meetingForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveMeeting();
    });
}

function renderCalendar() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    
    document.getElementById('currentMonth').textContent = 
        `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';

    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        dayHeader.style.cssText = 'font-weight: 600; color: rgba(255,255,255,0.8); padding: 10px; text-align: center;';
        calendarGrid.appendChild(dayHeader);
    });

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }

    // Add days of the month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;

        const currentDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Check if today
        if (today.getFullYear() === currentDate.getFullYear() &&
            today.getMonth() === currentDate.getMonth() &&
            today.getDate() === day) {
            dayElement.classList.add('today');
        }

        // Check if has meetings
        if (meetings.some(meeting => meeting.date === currentDateStr)) {
            dayElement.classList.add('has-meeting');
        }

        calendarGrid.appendChild(dayElement);
    }
}

function renderMeetings() {
    const meetingsList = document.getElementById('meetingsList');
    meetingsList.innerHTML = '';

    const upcomingMeetings = meetings
        .filter(meeting => new Date(meeting.date + 'T' + meeting.time) >= new Date())
        .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
        .slice(0, 5);

    if (upcomingMeetings.length === 0) {
        meetingsList.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center; padding: 20px;">No upcoming meetings</p>';
        return;
    }

    upcomingMeetings.forEach(meeting => {
        const meetingItem = document.createElement('div');
        meetingItem.className = 'meeting-item';
        
        const meetingDate = new Date(meeting.date + 'T' + meeting.time);
        const timeString = meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateString = meetingDate.toLocaleDateString();

        meetingItem.innerHTML = `
            <h5>${meeting.title}</h5>
            <p><i class="fas fa-calendar"></i> ${dateString}</p>
            <p><i class="fas fa-clock"></i> ${timeString} (${meeting.timezone})</p>
            <p><i class="fas fa-clock"></i> Duration: ${meeting.duration} min</p>
        `;
        meetingsList.appendChild(meetingItem);
    });
}

function saveMeeting() {
    const meeting = {
        id: Date.now(),
        title: document.getElementById('meetingTitle').value,
        date: document.getElementById('meetingDate').value,
        time: document.getElementById('meetingTime').value,
        timezone: document.getElementById('meetingTimezone').value,
        duration: parseInt(document.getElementById('meetingDuration').value),
        description: document.getElementById('meetingDescription').value
    };

    meetings.push(meeting);
    localStorage.setItem('meetings', JSON.stringify(meetings));
    
    renderCalendar();
    renderMeetings();
    updateStats();
    
    closeModal('meetingModal');
    document.getElementById('meetingForm').reset();
}

// Resume Builder Functions
function setupResumeBuilder() {
    document.getElementById('addExperience').addEventListener('click', addExperienceField);
    document.getElementById('downloadResume').addEventListener('click', downloadResume);
    document.getElementById('loadTemplate').addEventListener('click', loadTemplate);

    // Add real-time preview updates
    ['fullName', 'email', 'phone', 'summary', 'skills'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateResumePreview);
    });
}

function addExperienceField() {
    const experienceList = document.getElementById('experienceList');
    const experienceItem = document.createElement('div');
    experienceItem.className = 'experience-item';
    experienceItem.innerHTML = `
        <button type="button" class="remove-experience" onclick="this.parentElement.remove(); updateResumePreview();">&times;</button>
        <input type="text" placeholder="Job Title" onchange="updateResumePreview()">
        <input type="text" placeholder="Company Name" onchange="updateResumePreview()">
        <input type="text" placeholder="Duration (e.g., 2020-2023)" onchange="updateResumePreview()">
        <textarea placeholder="Job Description" rows="3" onchange="updateResumePreview()"></textarea>
    `;
    experienceList.appendChild(experienceItem);
}

function updateResumePreview() {
    const preview = document.getElementById('resumePreview');
    const fullName = document.getElementById('fullName').value || 'Your Name';
    const email = document.getElementById('email').value || 'your.email@example.com';
    const phone = document.getElementById('phone').value || '+1 (555) 123-4567';
    const summary = document.getElementById('summary').value || 'Professional summary will appear here...';
    const skills = document.getElementById('skills').value || 'Your skills will appear here...';

    let experienceHtml = '';
    document.querySelectorAll('.experience-item').forEach(item => {
        const inputs = item.querySelectorAll('input, textarea');
        const title = inputs[0]?.value || 'Job Title';
        const company = inputs[1]?.value || 'Company Name';
        const duration = inputs[2]?.value || 'Duration';
        const description = inputs[3]?.value || 'Job description...';

        experienceHtml += `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #4285f4; margin-bottom: 5px;">${title}</h4>
                <p style="font-weight: 600; margin-bottom: 5px;">${company} | ${duration}</p>
                <p style="color: #666; line-height: 1.6;">${description}</p>
            </div>
        `;
    });

    preview.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin-bottom: 10px; font-size: 2rem;">${fullName}</h1>
            <p style="color: #666; margin-bottom: 5px;">${email}</p>
            <p style="color: #666;">${phone}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
            <h3 style="color: #4285f4; border-bottom: 2px solid #4285f4; padding-bottom: 5px; margin-bottom: 15px;">Professional Summary</h3>
            <p style="color: #666; line-height: 1.6;">${summary}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
            <h3 style="color: #4285f4; border-bottom: 2px solid #4285f4; padding-bottom: 5px; margin-bottom: 15px;">Experience</h3>
            ${experienceHtml || '<p style="color: #999;">No experience added yet...</p>'}
        </div>
        
        <div style="margin-bottom: 30px;">
            <h3 style="color: #4285f4; border-bottom: 2px solid #4285f4; padding-bottom: 5px; margin-bottom: 15px;">Skills</h3>
            <p style="color: #666; line-height: 1.6;">${skills}</p>
        </div>
    `;
}

function loadTemplate() {
    document.getElementById('fullName').value = 'John Doe';
    document.getElementById('email').value = 'john.doe@example.com';
    document.getElementById('phone').value = '+1 (555) 123-4567';
    document.getElementById('summary').value = 'Experienced software developer with 5+ years in web development. Specialized in JavaScript, React, and Node.js with a proven track record of delivering high-quality solutions.';
    document.getElementById('skills').value = 'JavaScript, React, Node.js, Python, SQL, Git, AWS, Docker, Agile Development, Team Leadership';
    
    // Clear existing experience
    document.getElementById('experienceList').innerHTML = '';
    
    // Add sample experience
    addExperienceField();
    const experienceInputs = document.querySelectorAll('.experience-item input, .experience-item textarea');
    experienceInputs[0].value = 'Senior Software Developer';
    experienceInputs[1].value = 'Tech Solutions Inc.';
    experienceInputs[2].value = '2020-2023';
    experienceInputs[3].value = 'Led development of web applications using React and Node.js. Managed a team of 3 developers and improved application performance by 40%.';
    
    updateResumePreview();
}

function downloadResume() {
    const resumeContent = document.getElementById('resumePreview').innerHTML;
    const fullName = document.getElementById('fullName').value || 'Resume';
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${fullName} - Resume</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                h1, h2, h3, h4 { color: #333; }
                @media print { body { margin: 20px; } }
            </style>
        </head>
        <body>
            ${resumeContent}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Markdown Converter Functions
function setupMarkdownConverter() {
    const markdownText = document.getElementById('markdownText');
    const htmlPreview = document.getElementById('htmlPreview');
    
    markdownText.addEventListener('input', () => {
        const markdown = markdownText.value;
        const html = convertMarkdownToHTML(markdown);
        htmlPreview.innerHTML = html;
    });
    
    document.getElementById('clearMarkdown').addEventListener('click', () => {
        markdownText.value = '';
        htmlPreview.innerHTML = '';
    });
    
    document.getElementById('copyHtml').addEventListener('click', () => {
        const html = htmlPreview.innerHTML;
        navigator.clipboard.writeText(html).then(() => {
            showNotification('HTML copied to clipboard!');
        });
    });
    
    // Initialize with example
    const exampleMarkdown = `# Welcome to Markdown Converter

## Features
- **Bold text** and *italic text*
- Lists and links
- Code blocks

### Code Example
\`\`\`javascript
function hello() {
    console.log('Hello, World!');
}
\`\`\`

> This is a blockquote

[Visit GitHub](https://github.com)`;
    
    markdownText.value = exampleMarkdown;
    htmlPreview.innerHTML = convertMarkdownToHTML(exampleMarkdown);
}

function convertMarkdownToHTML(markdown) {
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold and Italic
    html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code>$2</code></pre>');
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>');
    
    // Lists
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Line breaks
    html = html.replace(/\n/gim, '<br>');
    
    return html;
}

// CSV Viewer Functions
function setupCSVViewer() {
    document.getElementById('csvFile').addEventListener('change', handleCSVFile);
    document.getElementById('csvSearch').addEventListener('input', filterCSVData);
    document.getElementById('csvFilter').addEventListener('change', filterCSVData);
    document.getElementById('exportCsv').addEventListener('click', exportCSV);
}

let csvData = [];
let csvHeaders = [];

function handleCSVFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const csv = e.target.result;
        parseCSV(csv);
    };
    reader.readAsText(file);
}

function parseCSV(csv) {
    const lines = csv.split('\n').filter(line => line.trim());
    if (lines.length === 0) return;
    
    csvHeaders = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    csvData = lines.slice(1).map(line => {
        const values = line.split(',').map(value => value.trim().replace(/"/g, ''));
        const row = {};
        csvHeaders.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        return row;
    });
    
    renderCSVTable();
    populateFilterOptions();
}

function renderCSVTable(data = csvData) {
    const table = document.getElementById('csvTable');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    
    // Clear existing content
    thead.innerHTML = '';
    tbody.innerHTML = '';
    
    if (csvHeaders.length === 0) return;
    
    // Create header row
    const headerRow = document.createElement('tr');
    csvHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.addEventListener('click', () => sortCSVData(header));
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    
    // Create data rows
    data.forEach(row => {
        const tr = document.createElement('tr');
        csvHeaders.forEach(header => {
            const td = document.createElement('td');
            td.textContent = row[header] || '';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

function populateFilterOptions() {
    const filterSelect = document.getElementById('csvFilter');
    filterSelect.innerHTML = '<option value="">All Columns</option>';
    
    csvHeaders.forEach(header => {
        const option = document.createElement('option');
        option.value = header;
        option.textContent = header;
        filterSelect.appendChild(option);
    });
}

function filterCSVData() {
    const searchTerm = document.getElementById('csvSearch').value.toLowerCase();
    const filterColumn = document.getElementById('csvFilter').value;
    
    let filteredData = csvData;
    
    if (searchTerm) {
        filteredData = filteredData.filter(row => {
            if (filterColumn) {
                return (row[filterColumn] || '').toLowerCase().includes(searchTerm);
            } else {
                return Object.values(row).some(value => 
                    (value || '').toLowerCase().includes(searchTerm)
                );
            }
        });
    }
    
    renderCSVTable(filteredData);
}

function sortCSVData(column) {
    csvData.sort((a, b) => {
        const valueA = (a[column] || '').toString().toLowerCase();
        const valueB = (b[column] || '').toString().toLowerCase();
        return valueA.localeCompare(valueB);
    });
    renderCSVTable();
}

function exportCSV() {
    if (csvData.length === 0) return;
    
    const csv = [
        csvHeaders.join(','),
        ...csvData.map(row => 
            csvHeaders.map(header => `"${row[header] || ''}"`).join(',')
        )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported_data.csv';
    a.click();
    URL.revokeObjectURL(url);
}

// Mind Map Functions
function setupMindMap() {
    document.getElementById('addNode').addEventListener('click', addMindMapNode);
    document.getElementById('clearMindMap').addEventListener('click', clearMindMap);
    document.getElementById('saveMindMap').addEventListener('click', saveMindMap);
    
    const svg = document.getElementById('mindmapSvg');
    svg.addEventListener('click', handleMindMapClick);
}

function initializeMindMap() {
    const svg = document.getElementById('mindmapSvg');
    svg.innerHTML = '';
    
    // Add a central node
    addMindMapNode(400, 200, 'Central Idea');
}

function addMindMapNode(x = null, y = null, text = 'New Node') {
    const svg = document.getElementById('mindmapSvg');
    const rect = svg.getBoundingClientRect();
    
    if (x === null) x = Math.random() * (rect.width - 100) + 50;
    if (y === null) y = Math.random() * (rect.height - 100) + 50;
    
    const nodeId = `node-${nodeIdCounter++}`;
    const color = document.getElementById('nodeColor').value;
    
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('id', nodeId);
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', 30);
    circle.setAttribute('class', 'mindmap-node');
    circle.setAttribute('fill', color);
    
    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textElement.setAttribute('x', x);
    textElement.setAttribute('y', y);
    textElement.setAttribute('class', 'mindmap-text');
    textElement.textContent = text;
    
    group.appendChild(circle);
    group.appendChild(textElement);
    svg.appendChild(group);
    
    // Make draggable
    let isDragging = false;
    let startX, startY;
    
    group.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - x;
        startY = e.clientY - y;
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const newX = e.clientX - startX;
        const newY = e.clientY - startY;
        
        circle.setAttribute('cx', newX);
        circle.setAttribute('cy', newY);
        textElement.setAttribute('x', newX);
        textElement.setAttribute('y', newY);
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    // Double-click to edit text
    group.addEventListener('dblclick', () => {
        const newText = prompt('Enter node text:', text);
        if (newText !== null) {
            textElement.textContent = newText;
        }
    });
    
    mindMapNodes.push({ id: nodeId, x, y, text, color });
}

function handleMindMapClick(e) {
    if (e.target === e.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        addMindMapNode(x, y);
    }
}

function clearMindMap() {
    const svg = document.getElementById('mindmapSvg');
    svg.innerHTML = '';
    mindMapNodes = [];
    mindMapConnections = [];
    nodeIdCounter = 0;
    initializeMindMap();
}

function saveMindMap() {
    const mindMapData = {
        nodes: mindMapNodes,
        connections: mindMapConnections
    };
    
    const blob = new Blob([JSON.stringify(mindMapData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Code Snippets Functions
function setupCodeSnippets() {
    document.getElementById('addSnippet').addEventListener('click', createNewSnippet);
    document.getElementById('saveSnippet').addEventListener('click', saveSnippet);
    document.getElementById('copySnippet').addEventListener('click', copySnippet);
    document.getElementById('snippetSearch').addEventListener('input', filterSnippets);
    
    renderSnippets();
    renderTags();
}

function renderSnippets() {
    const snippetsList = document.getElementById('snippetsList');
    snippetsList.innerHTML = '';
    
    const searchTerm = document.getElementById('snippetSearch').value.toLowerCase();
    const filteredSnippets = snippets.filter(snippet => 
        snippet.title.toLowerCase().includes(searchTerm) ||
        snippet.code.toLowerCase().includes(searchTerm) ||
        snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    
    filteredSnippets.forEach(snippet => {
        const snippetItem = document.createElement('div');
        snippetItem.className = 'snippet-item';
        snippetItem.innerHTML = `
            <h5>${snippet.title}</h5>
            <p>${snippet.language}</p>
            <p>${snippet.tags.join(', ')}</p>
        `;
        
        snippetItem.addEventListener('click', () => {
            loadSnippet(snippet);
            document.querySelectorAll('.snippet-item').forEach(item => item.classList.remove('active'));
            snippetItem.classList.add('active');
        });
        
        snippetsList.appendChild(snippetItem);
    });
}

function renderTags() {
    const tagsList = document.getElementById('tagsList');
    const allTags = [...new Set(snippets.flatMap(snippet => snippet.tags))];
    
    tagsList.innerHTML = '';
    allTags.forEach(tag => {
        const tagItem = document.createElement('span');
        tagItem.className = 'tag-item';
        tagItem.textContent = tag;
        tagItem.addEventListener('click', () => {
            document.getElementById('snippetSearch').value = tag;
            filterSnippets();
        });
        tagsList.appendChild(tagItem);
    });
}

function createNewSnippet() {
    document.getElementById('snippetTitle').value = '';
    document.getElementById('snippetCode').value = '';
    document.getElementById('snippetLanguage').value = 'javascript';
    document.getElementById('snippetTags').value = '';
    currentSnippet = null;
}

function loadSnippet(snippet) {
    document.getElementById('snippetTitle').value = snippet.title;
    document.getElementById('snippetCode').value = snippet.code;
    document.getElementById('snippetLanguage').value = snippet.language;
    document.getElementById('snippetTags').value = snippet.tags.join(', ');
    currentSnippet = snippet;
}

function saveSnippet() {
    const title = document.getElementById('snippetTitle').value;
    const code = document.getElementById('snippetCode').value;
    const language = document.getElementById('snippetLanguage').value;
    const tags = document.getElementById('snippetTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    if (!title || !code) {
        showNotification('Please fill in title and code');
        return;
    }
    
    const snippet = {
        id: currentSnippet ? currentSnippet.id : Date.now(),
        title,
        code,
        language,
        tags,
        createdAt: currentSnippet ? currentSnippet.createdAt : new Date().toISOString()
    };
    
    if (currentSnippet) {
        const index = snippets.findIndex(s => s.id === currentSnippet.id);
        snippets[index] = snippet;
    } else {
        snippets.push(snippet);
    }
    
    localStorage.setItem('snippets', JSON.stringify(snippets));
    renderSnippets();
    renderTags();
    updateStats();
    showNotification('Snippet saved!');
}

function copySnippet() {
    const code = document.getElementById('snippetCode').value;
    if (code) {
        navigator.clipboard.writeText(code).then(() => {
            showNotification('Code copied to clipboard!');
        });
    }
}

function filterSnippets() {
    renderSnippets();
}

// Secure Notes Functions
function setupSecureNotes() {
    document.getElementById('addNote').addEventListener('click', createNewNote);
    document.getElementById('saveNote').addEventListener('click', saveNote);
    document.getElementById('lockNote').addEventListener('click', lockNote);
    document.getElementById('unlockNote').addEventListener('click', unlockNote);
    
    renderNotes();
}

function renderNotes() {
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = '';
    
    notes.forEach(note => {
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        if (note.locked) noteItem.classList.add('locked');
        
        noteItem.innerHTML = `
            <h5>${note.title}</h5>
            <p>${new Date(note.createdAt).toLocaleDateString()}</p>
        `;
        
        noteItem.addEventListener('click', () => {
            if (note.locked) {
                currentNote = note;
                document.getElementById('passwordModal').classList.add('active');
            } else {
                loadNote(note);
            }
            document.querySelectorAll('.note-item').forEach(item => item.classList.remove('active'));
            noteItem.classList.add('active');
        });
        
        notesList.appendChild(noteItem);
    });
}

function createNewNote() {
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    currentNote = null;
}

function loadNote(note) {
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteContent').value = note.content;
    currentNote = note;
}

function saveNote() {
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;
    
    if (!title) {
        showNotification('Please enter a title');
        return;
    }
    
    const note = {
        id: currentNote ? currentNote.id : Date.now(),
        title,
        content,
        locked: currentNote ? currentNote.locked : false,
        password: currentNote ? currentNote.password : null,
        createdAt: currentNote ? currentNote.createdAt : new Date().toISOString()
    };
    
    if (currentNote) {
        const index = notes.findIndex(n => n.id === currentNote.id);
        notes[index] = note;
    } else {
        notes.push(note);
    }
    
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes();
    showNotification('Note saved!');
}

function lockNote() {
    const password = prompt('Enter a password to lock this note:');
    if (!password) return;
    
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;
    
    if (!title) {
        showNotification('Please save the note first');
        return;
    }
    
    const hashedPassword = btoa(password); // Simple encoding, not secure for production
    
    const note = {
        id: currentNote ? currentNote.id : Date.now(),
        title,
        content,
        locked: true,
        password: hashedPassword,
        createdAt: currentNote ? currentNote.createdAt : new Date().toISOString()
    };
    
    if (currentNote) {
        const index = notes.findIndex(n => n.id === currentNote.id);
        notes[index] = note;
    } else {
        notes.push(note);
    }
    
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes();
    showNotification('Note locked!');
    
    // Clear the editor
    createNewNote();
}

function unlockNote() {
    const password = document.getElementById('passwordInput').value;
    if (!password || !currentNote) return;
    
    const hashedPassword = btoa(password);
    
    if (hashedPassword === currentNote.password) {
        loadNote(currentNote);
        closeModal('passwordModal');
        document.getElementById('passwordInput').value = '';
        showNotification('Note unlocked!');
    } else {
        showNotification('Incorrect password!');
    }
}

// JSON Tools Functions
function setupJSONTools() {
    document.getElementById('formatJson').addEventListener('click', formatJSON);
    document.getElementById('validateJson').addEventListener('click', validateJSON);
    document.getElementById('copyJsonOutput').addEventListener('click', copyJSONOutput);
    document.getElementById('jsonInput').addEventListener('input', validateJSON);
}

function formatJSON() {
    const input = document.getElementById('jsonInput').value;
    const output = document.getElementById('jsonOutput');
    
    try {
        const parsed = JSON.parse(input);
        const formatted = JSON.stringify(parsed, null, 2);
        output.textContent = formatted;
        showJSONStatus('valid', 'Valid JSON');
    } catch (error) {
        showJSONStatus('invalid', `Invalid JSON: ${error.message}`);
    }
}

function validateJSON() {
    const input = document.getElementById('jsonInput').value;
    
    if (!input.trim()) {
        showJSONStatus('', '');
        return;
    }
    
    try {
        JSON.parse(input);
        showJSONStatus('valid', 'Valid JSON');
    } catch (error) {
        showJSONStatus('invalid', `Invalid JSON: ${error.message}`);
    }
}

function showJSONStatus(type, message) {
    const status = document.getElementById('jsonStatus');
    status.className = `status-indicator ${type}`;
    status.textContent = message;
}

function copyJSONOutput() {
    const output = document.getElementById('jsonOutput').textContent;
    if (output) {
        navigator.clipboard.writeText(output).then(() => {
            showNotification('JSON copied to clipboard!');
        });
    }
}

// Kanban Board Functions
function setupKanbanBoard() {
    document.getElementById('addTask').addEventListener('click', addTask);
    
    // Setup drag and drop
    const columns = document.querySelectorAll('.column-content');
    columns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
        column.addEventListener('dragenter', handleDragEnter);
        column.addEventListener('dragleave', handleDragLeave);
    });
}

function renderKanbanBoard() {
    const columns = {
        todo: document.getElementById('todoColumn'),
        inprogress: document.getElementById('inprogressColumn'),
        done: document.getElementById('doneColumn')
    };
    
    // Clear columns
    Object.values(columns).forEach(column => column.innerHTML = '');
    
    // Render tasks
    tasks.forEach(task => {
        const taskCard = createTaskCard(task);
        columns[task.status].appendChild(taskCard);
    });
    
    // Update task counts
    updateTaskCounts();
}

function createTaskCard(task) {
    const taskCard = document.createElement('div');
    taskCard.className = 'task-card';
    taskCard.draggable = true;
    taskCard.dataset.taskId = task.id;
    
    taskCard.innerHTML = `
        <h5>${task.title}</h5>
        <p>${task.description}</p>
        <div class="task-meta">
            <span class="task-priority priority-${task.priority}">${task.priority}</span>
            <span>${new Date(task.createdAt).toLocaleDateString()}</span>
        </div>
    `;
    
    taskCard.addEventListener('dragstart', handleDragStart);
    taskCard.addEventListener('dragend', handleDragEnd);
    taskCard.addEventListener('dblclick', () => editTask(task));
    
    return taskCard;
}

function addTask() {
    const title = prompt('Enter task title:');
    if (!title) return;
    
    const description = prompt('Enter task description:') || '';
    const priority = prompt('Enter priority (low/medium/high):') || 'medium';
    
    const task = {
        id: Date.now(),
        title,
        description,
        priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
        status: 'todo',
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
    renderKanbanBoard();
    updateStats();
}

function editTask(task) {
    const newTitle = prompt('Edit task title:', task.title);
    if (newTitle === null) return;
    
    const newDescription = prompt('Edit task description:', task.description);
    if (newDescription === null) return;
    
    task.title = newTitle;
    task.description = newDescription;
    
    localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
    renderKanbanBoard();
}

function handleDragStart(e) {
    draggedTask = e.target;
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedTask = null;
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDragEnter(e) {
    if (e.target.classList.contains('column-content')) {
        e.target.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    if (e.target.classList.contains('column-content')) {
        e.target.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');
    
    if (!draggedTask) return;
    
    const column = e.target.closest('.column-content');
    const newStatus = column.parentElement.dataset.status;
    const taskId = parseInt(draggedTask.dataset.taskId);
    
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = newStatus;
        localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
        renderKanbanBoard();
    }
}

function updateTaskCounts() {
    const counts = tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
    }, {});
    
    document.querySelector('[data-status="todo"] .task-count').textContent = counts.todo || 0;
    document.querySelector('[data-status="inprogress"] .task-count').textContent = counts.inprogress || 0;
    document.querySelector('[data-status="done"] .task-count').textContent = counts.done || 0;
}

// Image Compressor Functions
function setupImageCompressor() {
    document.getElementById('imageFile').addEventListener('change', handleImageFiles);
    document.getElementById('qualitySlider').addEventListener('input', updateQualityValue);
    document.getElementById('maxWidth').addEventListener('input', updateCompression);
    document.getElementById('outputFormat').addEventListener('change', updateCompression);
}

function updateQualityValue() {
    const slider = document.getElementById('qualitySlider');
    document.getElementById('qualityValue').textContent = slider.value;
    updateCompression();
}

let originalImages = [];

function handleImageFiles(event) {
    const files = Array.from(event.target.files);
    originalImages = [];
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                originalImages.push({
                    file: file,
                    dataUrl: e.target.result,
                    originalSize: file.size
                });
                
                if (originalImages.length === files.length) {
                    compressImages();
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

function compressImages() {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    
    originalImages.forEach((imageData, index) => {
        const img = new Image();
        img.onload = function() {
            const compressedData = compressImage(img, imageData);
            renderImageComparison(imageData, compressedData, index);
        };
        img.src = imageData.dataUrl;
    });
}

function compressImage(img, originalData) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const maxWidth = parseInt(document.getElementById('maxWidth').value);
    const quality = parseInt(document.getElementById('qualitySlider').value) / 100;
    const format = document.getElementById('outputFormat').value;
    
    // Calculate new dimensions
    let { width, height } = img;
    if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // Draw and compress
    ctx.drawImage(img, 0, 0, width, height);
    const compressedDataUrl = canvas.toDataURL(`image/${format}`, quality);
    
    // Calculate compressed size (approximate)
    const compressedSize = Math.round(compressedDataUrl.length * 0.75);
    
    return {
        dataUrl: compressedDataUrl,
        size: compressedSize,
        width: width,
        height: height,
        format: format
    };
}

function renderImageComparison(originalData, compressedData, index) {
    const preview = document.getElementById('imagePreview');
    
    const comparison = document.createElement('div');
    comparison.className = 'image-comparison';
    
    const originalSizeKB = Math.round(originalData.originalSize / 1024);
    const compressedSizeKB = Math.round(compressedData.size / 1024);
    const savings = Math.round((1 - compressedData.size / originalData.originalSize) * 100);
    
    comparison.innerHTML = `
        <h4>Image ${index + 1}</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
            <div>
                <p style="margin-bottom: 5px; font-weight: 600;">Original</p>
                <img src="${originalData.dataUrl}" alt="Original" style="max-width: 100%; max-height: 150px;">
                <div class="image-info">${originalSizeKB} KB</div>
            </div>
            <div>
                <p style="margin-bottom: 5px; font-weight: 600;">Compressed</p>
                <img src="${compressedData.dataUrl}" alt="Compressed" style="max-width: 100%; max-height: 150px;">
                <div class="image-info">${compressedSizeKB} KB</div>
            </div>
        </div>
        <div class="compression-stats">
            <div class="stat-item">
                <span class="stat-value">${savings}%</span>
                <span class="stat-label">Saved</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${compressedData.width}x${compressedData.height}</span>
                <span class="stat-label">Dimensions</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${compressedData.format.toUpperCase()}</span>
                <span class="stat-label">Format</span>
            </div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="downloadCompressedImage('${compressedData.dataUrl}', '${originalData.file.name}', '${compressedData.format}')">
            <i class="fas fa-download"></i> Download
        </button>
    `;
    
    preview.appendChild(comparison);
}

function downloadCompressedImage(dataUrl, originalName, format) {
    const link = document.createElement('a');
    link.download = originalName.replace(/\.[^/.]+$/, '') + '_compressed.' + format;
    link.href = dataUrl;
    link.click();
}

function updateCompression() {
    if (originalImages.length > 0) {
        compressImages();
    }
}

// Dictionary Functions
function setupDictionary() {
    document.getElementById('searchWord').addEventListener('click', searchDictionary);
    document.getElementById('wordSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchDictionary();
        }
    });
    document.getElementById('clearDictionary').addEventListener('click', clearDictionary);
    document.getElementById('speakWord').addEventListener('click', speakWord);
}

async function searchDictionary() {
    const word = document.getElementById('wordSearch').value.trim();
    if (!word) return;
    
    const resultDiv = document.getElementById('dictionaryResult');
    resultDiv.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i><p>Searching...</p></div>';
    
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        
        if (!response.ok) {
            throw new Error('Word not found');
        }
        
        const data = await response.json();
        displayDictionaryResult(data[0]);
    } catch (error) {
        resultDiv.innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Word Not Found</h3>
                <p>Sorry, we couldn't find the definition for "${word}". Please check the spelling and try again.</p>
            </div>
        `;
    }
}

function displayDictionaryResult(data) {
    const resultDiv = document.getElementById('dictionaryResult');
    
    let meaningsHtml = '';
    data.meanings.forEach(meaning => {
        meaningsHtml += `
            <div class="word-meaning">
                <div class="part-of-speech">${meaning.partOfSpeech}</div>
        `;
        
        meaning.definitions.forEach((def, index) => {
            if (index < 3) { // Show only first 3 definitions
                meaningsHtml += `
                    <div class="definition">${index + 1}. ${def.definition}</div>
                `;
                if (def.example) {
                    meaningsHtml += `<div class="example">Example: "${def.example}"</div>`;
                }
            }
        });
        
        meaningsHtml += '</div>';
    });
    
    const phonetic = data.phonetics.find(p => p.text) || {};
    
    resultDiv.innerHTML = `
        <div class="word-result">
            <div class="word-title">${data.word}</div>
            ${phonetic.text ? `<div class="word-phonetic">${phonetic.text}</div>` : ''}
            ${meaningsHtml}
        </div>
    `;
}

function clearDictionary() {
    document.getElementById('wordSearch').value = '';
    document.getElementById('dictionaryResult').innerHTML = `
        <div class="welcome-message">
            <i class="fas fa-book"></i>
            <h3>Welcome to Dictionary</h3>
            <p>Enter a word above to get its definition, pronunciation, and examples.</p>
        </div>
    `;
}

function speakWord() {
    const word = document.getElementById('wordSearch').value.trim();
    if (!word) return;
    
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    } else {
        showNotification('Speech synthesis not supported in this browser');
    }
}

// Countries Functions
function setupCountries() {
    document.getElementById('countrySearch').addEventListener('input', filterCountries);
    document.getElementById('regionFilter').addEventListener('change', filterCountries);
}

async function loadCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        countries = await response.json();
        renderCountries(countries);
    } catch (error) {
        document.getElementById('countriesGrid').innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Countries</h3>
                <p>Unable to load country information. Please check your internet connection.</p>
            </div>
        `;
    }
}

function renderCountries(countriesToRender) {
    const grid = document.getElementById('countriesGrid');
    grid.innerHTML = '';
    
    countriesToRender.forEach(country => {
        const countryCard = document.createElement('div');
        countryCard.className = 'country-card';
        
        const population = country.population ? country.population.toLocaleString() : 'N/A';
        const area = country.area ? country.area.toLocaleString() + ' km²' : 'N/A';
        const capital = country.capital ? country.capital[0] : 'N/A';
        const region = country.region || 'N/A';
        const subregion = country.subregion || 'N/A';
        
        countryCard.innerHTML = `
            <div class="country-flag">${country.flag || '🏳️'}</div>
            <div class="country-name">${country.name.common}</div>
            <div class="country-info">
                <p><strong>Capital:</strong> ${capital}</p>
                <p><strong>Region:</strong> ${region}</p>
                <p><strong>Subregion:</strong> ${subregion}</p>
                <p><strong>Population:</strong> ${population}</p>
                <p><strong>Area:</strong> ${area}</p>
                <p><strong>Languages:</strong> ${country.languages ? Object.values(country.languages).join(', ') : 'N/A'}</p>
                <p><strong>Currencies:</strong> ${country.currencies ? Object.values(country.currencies).map(c => c.name).join(', ') : 'N/A'}</p>
            </div>
        `;
        
        grid.appendChild(countryCard);
    });
}

function filterCountries() {
    const searchTerm = document.getElementById('countrySearch').value.toLowerCase();
    const selectedRegion = document.getElementById('regionFilter').value;
    
    let filteredCountries = countries;
    
    if (selectedRegion) {
        filteredCountries = filteredCountries.filter(country => 
            country.region === selectedRegion
        );
    }
    
    if (searchTerm) {
        filteredCountries = filteredCountries.filter(country =>
            country.name.common.toLowerCase().includes(searchTerm) ||
            (country.capital && country.capital[0].toLowerCase().includes(searchTerm))
        );
    }
    
    renderCountries(filteredCountries);
}

// Calculator Functions
function setupCalculator() {
    document.getElementById('clearCalculator').addEventListener('click', clearCalculator);
    document.getElementById('toggleScientific').addEventListener('click', toggleScientific);
}

function appendToDisplay(value) {
    const display = document.getElementById('calculatorDisplay');
    if (display.value === '0' && value !== '.') {
        display.value = value;
    } else {
        display.value += value;
    }
}

function appendFunction(func) {
    const display = document.getElementById('calculatorDisplay');
    display.value += func;
}

function clearCalculator() {
    document.getElementById('calculatorDisplay').value = '0';
}

function deleteLast() {
    const display = document.getElementById('calculatorDisplay');
    if (display.value.length > 1) {
        display.value = display.value.slice(0, -1);
    } else {
        display.value = '0';
    }
}

function calculateResult() {
    const display = document.getElementById('calculatorDisplay');
    try {
        let expression = display.value;
        
        // Replace mathematical functions
        expression = expression.replace(/sin\(/g, 'Math.sin(');
        expression = expression.replace(/cos\(/g, 'Math.cos(');
        expression = expression.replace(/tan\(/g, 'Math.tan(');
        expression = expression.replace(/log\(/g, 'Math.log10(');
        expression = expression.replace(/ln\(/g, 'Math.log(');
        expression = expression.replace(/sqrt\(/g, 'Math.sqrt(');
        expression = expression.replace(/\*\*/g, '**');
        
        const result = eval(expression);
        display.value = result;
    } catch (error) {
        display.value = 'Error';
        setTimeout(() => {
            display.value = '0';
        }, 1500);
    }
}

function toggleScientific() {
    const scientificButtons = document.getElementById('scientificButtons');
    isScientificMode = !isScientificMode;
    
    if (isScientificMode) {
        scientificButtons.style.display = 'grid';
        document.getElementById('toggleScientific').innerHTML = '<i class="fas fa-cog"></i> Basic';
    } else {
        scientificButtons.style.display = 'none';
        document.getElementById('toggleScientific').innerHTML = '<i class="fas fa-cog"></i> Scientific';
    }
}

// Weather Functions
function setupWeather() {
    document.getElementById('searchWeather').addEventListener('click', searchWeather);
    document.getElementById('citySearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchWeather();
        }
    });
    document.getElementById('getCurrentLocation').addEventListener('click', getCurrentLocationWeather);
}

async function searchWeather() {
    const city = document.getElementById('citySearch').value.trim();
    if (!city) return;
    
    const resultDiv = document.getElementById('weatherResult');
    resultDiv.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i><p>Loading weather...</p></div>';
    
    try {
        // Using OpenWeatherMap API (you would need to get a free API key)
        // For demo purposes, we'll show a mock response
        const mockWeatherData = {
            name: city,
            main: {
                temp: Math.round(Math.random() * 30 + 5),
                feels_like: Math.round(Math.random() * 30 + 5),
                humidity: Math.round(Math.random() * 100),
                pressure: Math.round(Math.random() * 100 + 1000)
            },
            weather: [{
                main: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
                description: 'clear sky'
            }],
            wind: {
                speed: Math.round(Math.random() * 20)
            },
            visibility: Math.round(Math.random() * 10000)
        };
        
        displayWeatherResult(mockWeatherData);
    } catch (error) {
        resultDiv.innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Weather Not Found</h3>
                <p>Unable to get weather information for "${city}". Please check the city name and try again.</p>
            </div>
        `;
    }
}

function displayWeatherResult(data) {
    const resultDiv = document.getElementById('weatherResult');
    
    resultDiv.innerHTML = `
        <div class="weather-info">
            <div class="weather-city">${data.name}</div>
            <div class="weather-temp">${data.main.temp}°C</div>
            <div class="weather-desc">${data.weather[0].description}</div>
            
            <div class="weather-details">
                <div class="weather-detail">
                    <div class="weather-detail-label">Feels like</div>
                    <div class="weather-detail-value">${data.main.feels_like}°C</div>
                </div>
                <div class="weather-detail">
                    <div class="weather-detail-label">Humidity</div>
                    <div class="weather-detail-value">${data.main.humidity}%</div>
                </div>
                <div class="weather-detail">
                    <div class="weather-detail-label">Pressure</div>
                    <div class="weather-detail-value">${data.main.pressure} hPa</div>
                </div>
                <div class="weather-detail">
                    <div class="weather-detail-label">Wind Speed</div>
                    <div class="weather-detail-value">${data.wind.speed} m/s</div>
                </div>
                <div class="weather-detail">
                    <div class="weather-detail-label">Visibility</div>
                    <div class="weather-detail-value">${(data.visibility / 1000).toFixed(1)} km</div>
                </div>
            </div>
        </div>
    `;
}

function getCurrentLocationWeather() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // For demo purposes, we'll just show a mock result
                const mockData = {
                    name: 'Your Location',
                    main: {
                        temp: Math.round(Math.random() * 30 + 5),
                        feels_like: Math.round(Math.random() * 30 + 5),
                        humidity: Math.round(Math.random() * 100),
                        pressure: Math.round(Math.random() * 100 + 1000)
                    },
                    weather: [{
                        main: 'Clear',
                        description: 'clear sky'
                    }],
                    wind: {
                        speed: Math.round(Math.random() * 20)
                    },
                    visibility: Math.round(Math.random() * 10000)
                };
                displayWeatherResult(mockData);
            },
            (error) => {
                showNotification('Unable to get your location');
            }
        );
    } else {
        showNotification('Geolocation is not supported by this browser');
    }
}

// QR Generator Functions
function setupQRGenerator() {
    document.getElementById('generateQR').addEventListener('click', generateQR);
    document.getElementById('clearQR').addEventListener('click', clearQR);
    document.getElementById('downloadQR').addEventListener('click', downloadQR);
}

function generateQR() {
    const text = document.getElementById('qrText').value.trim();
    if (!text) {
        showNotification('Please enter text or URL to generate QR code');
        return;
    }
    
    const size = document.getElementById('qrSize').value;
    const color = document.getElementById('qrColor').value;
    
    // Create QR code using a simple library-free approach
    const qrResult = document.getElementById('qrResult');
    
    // For demo purposes, we'll create a simple placeholder
    // In a real implementation, you would use a QR code library
    const canvas = document.createElement('canvas');
    canvas.width = parseInt(size);
    canvas.height = parseInt(size);
    const ctx = canvas.getContext('2d');
    
    // Create a simple pattern (not a real QR code)
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = color;
    const cellSize = canvas.width / 25;
    
    // Create a simple pattern
    for (let i = 0; i < 25; i++) {
        for (let j = 0; j < 25; j++) {
            if (Math.random() > 0.5) {
                ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }
    
    // Add corner markers
    ctx.fillRect(0, 0, cellSize * 7, cellSize * 7);
    ctx.fillRect(canvas.width - cellSize * 7, 0, cellSize * 7, cellSize * 7);
    ctx.fillRect(0, canvas.height - cellSize * 7, cellSize * 7, cellSize * 7);
    
    ctx.fillStyle = 'white';
    ctx.fillRect(cellSize, cellSize, cellSize * 5, cellSize * 5);
    ctx.fillRect(canvas.width - cellSize * 6, cellSize, cellSize * 5, cellSize * 5);
    ctx.fillRect(cellSize, canvas.height - cellSize * 6, cellSize * 5, cellSize * 5);
    
    qrResult.innerHTML = '';
    qrResult.appendChild(canvas);
    
    // Store for download
    window.currentQRCanvas = canvas;
}

function clearQR() {
    document.getElementById('qrText').value = '';
    document.getElementById('qrResult').innerHTML = `
        <div class="welcome-message">
            <i class="fas fa-qrcode"></i>
            <h3>QR Code Generator</h3>
            <p>Enter text or URL and click generate to create your QR code.</p>
        </div>
    `;
    window.currentQRCanvas = null;
}

function downloadQR() {
    if (!window.currentQRCanvas) {
        showNotification('Please generate a QR code first');
        return;
    }
    
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = window.currentQRCanvas.toDataURL();
    link.click();
}

// Utility Functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showNotification(message) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(66, 133, 244, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS for notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);