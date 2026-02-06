/**
 * Application Logic for QII Meadow Assessment
 * Style: Technical, Precise (University Level)
 */

// State Management
const state = {
    step: 0,
    data: null,
    answers: {
        exposure: "",
        humidity: "",
        forestInfluence: "",
        growth: "",
        seedsNearby: "",
        q2Selected: new Set(),
        leanSelected: new Set(),
        fatLimit35: false, // >35% yield of specific nutrient indicators
        fatLimit40: false, // >40% yield of general nutrient indicators
        problematic: false // Blacken/Disteln present
    }
};

// Configuration of Steps
const steps = [
    {
        id: 'abiotic',
        title: 'Standortcharakterisierung',
        description: 'Erfassen Sie die abiotischen Faktoren und das Umfeld der Fläche.',
        render: renderAbioticStep,
        validate: () => state.answers.exposure && state.answers.humidity && state.answers.growth
    },
    {
        id: 'q2_plants',
        title: 'Floristische Bestandsaufnahme (QII-Zeiger)',
        description: 'Markieren Sie alle auf der Testfläche (r=6m) gefundenen Zeigerpflanzen. Mindestanforderung für QII sind in der Regel 6 Arten/Gruppen.',
        render: renderQ2Step,
        validate: () => true // No minimum selection required to proceed, logically valid to have 0
    },
    {
        id: 'lean_plants',
        title: 'Magerkeitszeiger (Ergänzend)',
        description: 'Erfassen Sie weitere Pflanzen, die auf Magerkeit und Potenzial hinweisen, auch wenn sie keine offiziellen QII-Zeiger sind.',
        render: renderLeanStep,
        validate: () => true
    },
    {
        id: 'negative',
        title: 'Unerwünschte Arten & Ertragsanteile',
        description: 'Beurteilen Sie den Anteil von Fettwiesen- und Problempflanzen.',
        render: renderNegativeStep,
        validate: () => true
    },
    {
        id: 'result',
        title: 'Potenzialeinschätzung',
        description: 'Zusammenfassung der Analyse basierend auf den Eingaben.',
        render: renderResultStep
    }
];

// --- Initialization ---

async function init() {
    const app = document.getElementById('app');
    try {
        const response = await fetch('plants.json');
        if (!response.ok) throw new Error("JSON loading failed");
        state.data = await response.json();
        render();
    } catch (err) {
        app.innerHTML = `<div class="error">Fehler beim Laden der botanischen Datenbank: ${err.message}</div>`;
    }
}

// --- Rendering Engine ---

function render() {
    const app = document.getElementById('app');
    const currentStep = steps[state.step];

    // Main Container
    let html = `
        <div class="step-container">
            <div class="step-header">
                <div class="step-title">Schritt ${state.step + 1}/${steps.length}: ${currentStep.title}</div>
                <div class="step-desc">${currentStep.description}</div>
            </div>
            <div id="step-content"></div>
            <div class="actions">
                ${state.step > 0 ? `<button id="btn-back" class="btn btn-secondary">Zurück</button>` : '<div></div>'}
                ${state.step < steps.length - 1 ? `<button id="btn-next" class="btn btn-primary">Weiter</button>` : ''}
            </div>
        </div>
    `;

    app.innerHTML = html;

    // Execute specific renderer for the content
    currentStep.render(document.getElementById('step-content'));

    // Event Listeners
    if (document.getElementById('btn-next')) {
        document.getElementById('btn-next').addEventListener('click', () => {
            if (currentStep.validate && !currentStep.validate()) {
                alert("Bitte füllen Sie alle Pflichtfelder aus.");
                return;
            }
            state.step++;
            render();
        });
    }

    if (document.getElementById('btn-back')) {
        document.getElementById('btn-back').addEventListener('click', () => {
            state.step--;
            render();
        });
    }
}

// --- Specific Step Renderers ---

function renderAbioticStep(container) {
    container.innerHTML = `
        <div class="form-group">
            <label>Exposition (Hangausrichtung)</label>
            <select id="inp-exposure">
                <option value="">Bitte wählen...</option>
                <option value="S">Südhang (sonnig, trocken)</option>
                <option value="W_E">West-/Osthang</option>
                <option value="N">Nordhang (schattig, feucht)</option>
                <option value="EBEN">Ebene</option>
            </select>
        </div>
        <div class="form-group">
            <label>Feuchtigkeitshaushalt</label>
            <select id="inp-humidity">
                <option value="">Bitte wählen...</option>
                <option value="trocken">Trocken</option>
                <option value="frisch">Frisch / Mittlere Feuchte</option>
                <option value="feucht">Feucht / Nass</option>
            </select>
        </div>
        <div class="form-group">
            <label>Wüchsigkeit des Bestandes</label>
            <select id="inp-growth">
                <option value="">Bitte wählen...</option>
                <option value="mager">Mager / Lückig</option>
                <option value="mittel">Mittel</option>
                <option value="ueppig">Üppig / Dicht</option>
            </select>
        </div>
        <div class="form-group">
            <label>Sameneintrag aus der Umgebung</label>
            <select id="inp-seeds">
                <option value="ja">Ja, artenreiche Flächen in direkter Nähe</option>
                <option value="nein">Nein, Fläche isoliert</option>
            </select>
        </div>
    `;

    // Bind values
    const fields = [
        { id: 'inp-exposure', key: 'exposure' },
        { id: 'inp-humidity', key: 'humidity' },
        { id: 'inp-growth', key: 'growth' },
        { id: 'inp-seeds', key: 'seedsNearby' }
    ];

    fields.forEach(f => {
        const el = document.getElementById(f.id);
        el.value = state.answers[f.key];
        el.addEventListener('change', (e) => state.answers[f.key] = e.target.value);
    });
}

function renderPlantSelector(container, plantList, stateKey) {
    const grid = document.createElement('div');
    grid.className = 'plant-grid';

    plantList.forEach(plant => {
        const card = document.createElement('div');
        card.className = `plant-card ${state.answers[stateKey].has(plant.id) ? 'selected' : ''}`;
        
        card.innerHTML = `
            <span class="plant-name">${plant.labels[0]}</span>
            <span class="plant-botanical">${plant.botanical_name}</span>
            <div class="plant-desc">${plant.description || ''}</div>
        `;

        card.addEventListener('click', () => {
            if (state.answers[stateKey].has(plant.id)) {
                state.answers[stateKey].delete(plant.id);
                card.classList.remove('selected');
            } else {
                state.answers[stateKey].add(plant.id);
                card.classList.add('selected');
            }
        });

        grid.appendChild(card);
    });

    container.appendChild(grid);
}

function renderQ2Step(container) {
    renderPlantSelector(container, state.data.q2_indicators, 'q2Selected');
}

function renderLeanStep(container) {
    // Filter out plants that are already in Q2 list to avoid duplicates visually if logic separates them
    // Though in JSON they are distinct lists.
    renderPlantSelector(container, state.data.lean_indicators, 'leanSelected');
}

function renderNegativeStep(container) {
    const list35 = state.data.nutrient_rich_indicators.limit_35_percent.map(p => p.labels[0]).join(', ');
    const list40 = state.data.nutrient_rich_indicators.limit_40_percent.map(p => p.labels[0]).join(', ');
    
    container.innerHTML = `
        <div class="checkbox-group">
            <div class="check-item">
                <input type="checkbox" id="chk-35" ${state.answers.fatLimit35 ? 'checked' : ''}>
                <label for="chk-35">
                    <strong>Ertragsanteil > 35%</strong><br>
                    Dominanz von: ${list35}
                </label>
            </div>
            
            <div class="check-item">
                <input type="checkbox" id="chk-40" ${state.answers.fatLimit40 ? 'checked' : ''}>
                <label for="chk-40">
                    <strong>Ertragsanteil > 40%</strong><br>
                    Dominanz von: ${list40}
                </label>
            </div>

            <div class="check-item">
                <input type="checkbox" id="chk-prob" ${state.answers.problematic ? 'checked' : ''}>
                <label for="chk-prob">
                    <strong>Problempflanzen vorhanden</strong><br>
                    Signifikantes Vorkommen von Blacken (Ampfer) oder Ackerkratzdisteln.
                </label>
            </div>
        </div>
    `;

    document.getElementById('chk-35').addEventListener('change', (e) => state.answers.fatLimit35 = e.target.checked);
    document.getElementById('chk-40').addEventListener('change', (e) => state.answers.fatLimit40 = e.target.checked);
    document.getElementById('chk-prob').addEventListener('change', (e) => state.answers.problematic = e.target.checked);
}

// --- Analysis Logic ---

function calculatePotential() {
    const { q2Selected, leanSelected, fatLimit35, fatLimit40, problematic, exposure, growth } = state.answers;
    
    const q2Count = q2Selected.size;
    const leanCount = leanSelected.size;
    
    // Ausschlusskriterien (Knock-out criteria)
    if (fatLimit35 || fatLimit40 || problematic) {
        return {
            status: "Kein unmittelbares QII-Potenzial",
            cssClass: "result-fail",
            message: "Der Nährstoffgehalt ist zu hoch oder es liegen Probleme mit unerwünschten Arten vor. Eine direkte Anmeldung als QII ist nicht möglich. Es sind Sanierungsmassnahmen (z.B. Umbruch oder aggressive Ausmagerung) notwendig.",
            details: ["Hoher Anteil Fettwiesen-Arten oder Problempflanzen."]
        };
    }

    // Szenario 1: Bereits QII
    if (q2Count >= 6) {
        return {
            status: "Hohes Potenzial / QII Erfüllt",
            cssClass: "result-success",
            message: "Die Fläche weist bereits die notwendige Anzahl an Zeigerpflanzen auf. Bei Beibehaltung der extensiven Bewirtschaftung ist die QII-Stufe gegeben.",
            details: [`Anzahl gefundener QII-Zeiger: ${q2Count} (Min. 6)`]
        };
    }

    // Szenario 2: Aufwertungspotenzial (Target Group)
    // Wenig Q2 Zeiger, aber viele Magerkeitszeiger ODER guter Standort
    if (q2Count < 6) {
        let isSunny = (exposure === 'S' || exposure === 'W_E');
        let isLean = (growth === 'mager');
        let totalIndicators = q2Count + leanCount;

        if (totalIndicators >= 6 && isLean) {
            return {
                status: "Gutes Aufwertungspotenzial",
                cssClass: "result-warning",
                message: "Die Fläche erfüllt die QII-Kriterien noch nicht vollständig (zu wenige offizielle Zeiger), zeigt aber durch Magerkeitszeiger ein sehr gutes Potenzial. Mit gezielten Massnahmen (Samenanflug zulassen, Schnittzeitpunkt optimieren) kann QII in 1-3 Jahren erreicht werden.",
                details: [
                    `Offizielle QII-Zeiger: ${q2Count}`,
                    `Zusätzliche Magerkeitszeiger: ${leanCount}`,
                    `Gesamte Indikatoren: ${totalIndicators}`
                ]
            };
        }
        
        if (isSunny && !fatLimit35) {
             return {
                status: "Mittleres Potenzial (Geduld erforderlich)",
                cssClass: "result-warning",
                message: "Der Standort (Exposition) ist günstig, aber die botanische Zusammensetzung noch nicht ausreichend. Eine Aufwertung ist möglich, dauert aber länger.",
                details: ["Standortfaktoren sind positiv, aber Artenvielfalt fehlt noch."]
            };
        }
    }

    // Default Fall
    return {
        status: "Geringes Potenzial",
        cssClass: "result-fail",
        message: "Die botanische Vielfalt ist aktuell zu gering und der Standort zeigt keine eindeutigen Magerkeitsmerkmale, auch wenn keine direkten Ausschlusskriterien vorliegen. Eine Aufwertung ist ohne grössere Eingriffe (z.B. Ansaat) schwierig.",
        details: [`Nur ${q2Count} Zeigerarten vorhanden.`]
    };
}

function renderResultStep(container) {
    const result = calculatePotential();
    
    container.innerHTML = `
        <div class="result-box ${result.cssClass}">
            <h2>${result.status}</h2>
            <p>${result.message}</p>
            <div class="result-details">
                <strong>Analyse-Details:</strong>
                <ul>
                    ${result.details.map(d => `<li>${d}</li>`).join('')}
                    <li>Exposition: ${state.answers.exposure || 'Nicht angegeben'}</li>
                    <li>Wüchsigkeit: ${state.answers.growth || 'Nicht angegeben'}</li>
                </ul>
            </div>
        </div>
        <div style="margin-top: 2rem; color: #666; font-size: 0.9rem;">
            <em>Hinweis: Diese Einschätzung basiert auf den eingegebenen Daten und ersetzt keine Feldbeurteilung durch akkreditierte Experten.</em>
        </div>
    `;
    
    // Hide Next button in parent, maybe add Restart button?
    const actions = document.querySelector('.actions');
    if(actions) {
        // remove "Next" button logic visual hack or just let CSS hide it if step index is max
    }
}

// Start
init();