const input = document.getElementById('search-field');
const dropdown = document.getElementById('dropdown');
const items = document.querySelectorAll('.dropdown-item');
const container = document.getElementById('selected-container');
const hiddenInputs = document.getElementById('hidden-inputs');
const selectedSet = new Set();

// 1. Dropdown anzeigen wenn ins Feld geklickt wird
input.addEventListener('focus', () => {
    dropdown.style.display = 'block';
});

// 2. Filtern während der Eingabe
input.addEventListener('input', () => {
    const filter = input.value.toLowerCase();
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(filter) ? 'block' : 'none';
    });
    dropdown.style.display = 'block';
});

// 3. Auswahl treffen
items.forEach(item => {
    item.addEventListener('mousedown', (e) => {
        const val = item.getAttribute('data-value');
        if(!selectedSet.has(val)) {
            addTag(val);
        }
        input.value = '';
        dropdown.style.display = 'none';
        // Reset filter
        items.forEach(i => i.style.display = 'block');
    });
});

// 4. Dropdown schließen wenn man außerhalb klickt
document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete-wrapper')) {
        dropdown.style.display = 'none';
    }
});

function addTag(name) {
    selectedSet.add(name);
    
    // UI Tag
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerHTML = `${name} <span onclick="removeTag('${name}', this.parentElement)">×</span>`;
    container.appendChild(tag);
    
    // Backend Input
    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = 'vorhandene_arten';
    hidden.value = name;
    hidden.id = `input-${name}`;
    hiddenInputs.appendChild(hidden);
}

function removeTag(name, el) {
    selectedSet.delete(name);
    el.remove();
    document.getElementById(`input-${name}`).remove();
}
