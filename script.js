document.addEventListener('DOMContentLoaded', () => {
    // --- Variables Globales pour les éléments du DOM ---
    const calculatorSection = document.getElementById('calculatorSection');
    const carSpecsSection = document.getElementById('carSpecsSection');
    const navLinks = document.querySelectorAll('.main-nav a');

    // Section Calculateur TCO - Champs d'input
    const selectThermicCar = document.getElementById('selectThermicCar'); // NOUVEAU
    const selectTargetCar = document.getElementById('selectTargetCar');   // NOUVEAU

    const typeVehiculeThermique = document.getElementById('typeVehiculeThermique');
    const consoThermique = document.getElementById('consoThermique');
    const prixCarburant = document.getElementById('prixCarburant');
    const prixAchatThermique = document.getElementById('prixAchatThermique');
    const entretienThermique = document.getElementById('entretienThermique');
    const assuranceThermique = document.getElementById('assuranceThermique');
    const reventeThermique = document.getElementById('reventeThermique');

    const typeVehiculeCible = document.getElementById('typeVehiculeCible');
    const consoVE = document.getElementById('consoVE');
    const prixElectricite = document.getElementById('prixElectricite');
    const consoCarburantVE = document.getElementById('consoCarburantVE');
    const prixCarburantVE = document.getElementById('prixCarburantVE');
    const prixAchatVE = document.getElementById('prixAchatVE');
    const aidesVE = document.getElementById('aidesVE');
    const installationBorne = document.getElementById('installationBorne');
    const entretienVE = document.getElementById('entretienVE');
    const assuranceVE = document.getElementById('assuranceVE');
    const reventeVE = document.getElementById('reventeVE');

    const kmAnnuels = document.getElementById('kmAnnuels');
    const dureePossession = document.getElementById('dureePossession');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultsDiv = document.getElementById('results');
    const tcoChartCanvas = document.getElementById('tcoChart');
    let tcoChart; // Pour stocker l'instance du graphique

    // Groupes d'inputs pour affichage conditionnel
    const groupPrixElectricite = document.getElementById('group-prixElectricite');
    const groupConsoCarburantVE = document.getElementById('group-consoCarburantVE');
    const groupPrixCarburantVE = document.getElementById('group-prixCarburantVE');
    const unitThermique = document.getElementById('unitThermique');
    const unitPrixCarburant = document.getElementById('unitPrixCarburant');
    const unitVE = document.getElementById('unitVE');

    // Section Fiches Techniques
    const carSelector = document.getElementById('carSelector');
    const carDetailsDisplay = document.getElementById('carDetailsDisplay');
    let allCarsData = []; // Pour stocker les données de cars.json

    // --- Fonctions de Validation ---
    function validateInput(inputElement, min, isPositive = false) {
        const value = parseFloat(inputElement.value);
        const errorElement = document.getElementById(`error-${inputElement.id}`);
        if (isNaN(value) || value < min || (isPositive && value <= 0)) {
            errorElement.textContent = `Veuillez entrer un nombre valide et supérieur à ${min}.`;
            inputElement.classList.add('input-error');
            return false;
        } else {
            errorElement.textContent = '';
            inputElement.classList.remove('input-error');
            return true;
        }
    }

    // --- Fonction de Calcul du TCO ---
    function calculateTCO() {
        // Valider toutes les entrées
        const isValid = [
            validateInput(consoThermique, 0.1, true),
            validateInput(prixCarburant, 0.01, true),
            validateInput(prixAchatThermique, 0),
            validateInput(entretienThermique, 0),
            validateInput(assuranceThermique, 0),
            validateInput(reventeThermique, 0),

            // Valider les champs VE/Hybride seulement s'ils sont visibles
            (typeVehiculeCible.value === 'electrique' || typeVehiculeCible.value === 'hybride' || typeVehiculeCible.value === 'hybride-rechargeable') ? validateInput(consoVE, 0.1, true) : true,
            (typeVehiculeCible.value === 'electrique' || typeVehiculeCible.value === 'hybride' || typeVehiculeCible.value === 'hybride-rechargeable') ? validateInput(prixElectricite, 0.01, true) : true,
            (typeVehiculeCible.value === 'hybride-rechargeable') ? validateInput(consoCarburantVE, 0.1, true) : true,
            (typeVehiculeCible.value === 'hybride-rechargeable') ? validateInput(prixCarburantVE, 0.01, true) : true,

            validateInput(prixAchatVE, 0),
            validateInput(aidesVE, 0),
            validateInput(installationBorne, 0),
            validateInput(entretienVE, 0),
            validateInput(assuranceVE, 0),
            validateInput(reventeVE, 0),

            validateInput(kmAnnuels, 1, true),
            validateInput(dureePossession, 1, true)
        ].every(Boolean); // Vérifie que toutes les validations sont true

        if (!isValid) {
            resultsDiv.innerHTML = `<p class="result-message error-message-text"><i class="fas fa-exclamation-triangle"></i> Veuillez corriger les erreurs dans le formulaire.</p>`;
            return;
        }

        const km = parseFloat(kmAnnuels.value);
        const years = parseFloat(dureePossession.value);
        const totalKm = km * years;

        // Coûts du véhicule thermique
        const prixTh = parseFloat(prixAchatThermique.value);
        const consoTh = parseFloat(consoThermique.value);
        const prixCarb = parseFloat(prixCarburant.value);
        const entretienTh = parseFloat(entretienThermique.value) * years;
        const assuranceTh = parseFloat(assuranceThermique.value) * years;
        const reventeTh = parseFloat(reventeThermique.value);
        const coutCarburantTh = (totalKm / 100) * consoTh * prixCarb;
        const tcoThermique = prixTh + coutCarburantTh + entretienTh + assuranceTh - reventeTh;

        // Coûts du véhicule cible (VE/Hybride)
        const prixVE = parseFloat(prixAchatVE.value);
        const aides = parseFloat(aidesVE.value);
        const borne = parseFloat(installationBorne.value);
        const entretienVEVal = parseFloat(entretienVE.value) * years;
        const assuranceVEVal = parseFloat(assuranceVE.value) * years;
        const reventeVEVal = parseFloat(reventeVE.value);

        let coutEnergieVE = 0;
        const typeCible = typeVehiculeCible.value;

        if (typeCible === 'electrique') {
            const consoElec = parseFloat(consoVE.value);
            const prixElec = parseFloat(prixElectricite.value);
            coutEnergieVE = (totalKm / 100) * consoElec * prixElec;
        } else if (typeCible === 'hybride') { // Hybride non rechargeable (HEV)
            // Pour les hybrides non rechargeables, consoVE et prixElectricite sont utilisés pour l'essence
            const consoEssenceHybride = parseFloat(consoVE.value);
            const prixEssenceHybride = parseFloat(prixElectricite.value);
            coutEnergieVE = (totalKm / 100) * consoEssenceHybride * prixEssenceHybride;
        } else if (typeCible === 'hybride-rechargeable') { // Hybride rechargeable (PHEV)
            const consoElecPHEV = parseFloat(consoVE.value);
            const prixElecPHEV = parseFloat(prixElectricite.value);
            const consoCarbPHEV = parseFloat(consoCarburantVE.value);
            const prixCarbPHEV = parseFloat(prixCarburantVE.value);

            // Pour un PHEV, on estime une répartition. Utilisation d'un ratio 50/50 par défaut,
            // ou vous pouvez ajouter des champs dans le JSON pour la part électrique/thermique.
            const partElectrique = 0.5;
            const partThermique = 0.5;

            coutEnergieVE = (totalKm * partElectrique / 100) * consoElecPHEV * prixElecPHEV +
                            (totalKm * partThermique / 100) * consoCarbPHEV * prixCarbPHEV;
        }

        const tcoCible = prixVE - aides + borne + coutEnergieVE + entretienVEVal + assuranceVEVal - reventeVEVal;

        const differenceTCO = tcoThermique - tcoCible;

        resultsDiv.innerHTML = `
            <p class="result-message success-message"><i class="fas fa-check-circle"></i> Calcul effectué avec succès !</p>
            <h3>Synthèse du Coût Total de Possession (sur ${years} ans)</h3>
            <p><strong>Coût Total Véhicule Thermique :</strong> <span class="result-value">${tcoThermique.toFixed(2)} €</span></p>
            <p><strong>Coût Total Véhicule Cible (${typeCible === 'electrique' ? 'Électrique' : (typeCible === 'hybride' ? 'Hybride' : 'Hybride Rechargeable')}):</strong> <span class="result-value">${tcoCible.toFixed(2)} €</span></p>
            ${differenceTCO > 0 ?
                `<p class="result-message success-message"><i class="fas fa-hand-holding-usd"></i> En passant au véhicule cible, vous économiseriez environ <span class="result-value">${differenceTCO.toFixed(2)} €</span> sur ${years} ans !</p>` :
                `<p class="result-message error-message-text"><i class="fas fa-exclamation-triangle"></i> Le véhicule cible coûte environ <span class="result-value">${Math.abs(differenceTCO).toFixed(2)} €</span> de plus sur ${years} ans.</p>`
            }
        `;

        updateChart(tcoThermique, tcoCible);
    }

    // --- Fonction de mise à jour du graphique ---
    function updateChart(tcoThermique, tcoCible) {
        if (tcoChart) {
            tcoChart.destroy(); // Détruire l'ancienne instance si elle existe
        }

        const ctx = tcoChartCanvas.getContext('2d');
        tcoChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Véhicule Thermique', 'Véhicule Cible'],
                datasets: [{
                    label: 'Coût Total de Possession (€)',
                    data: [tcoThermique, tcoCible],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)', // Rouge pour thermique
                        'rgba(75, 192, 192, 0.7)'  // Vert/Bleu pour cible
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Coût (€)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false // Cache la légende car les labels sont clairs
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    // --- Gestion de l'affichage conditionnel des champs pour le véhicule cible ---
    function updateTargetVehicleInputs() {
        const type = typeVehiculeCible.value;

        // Réinitialiser les affichages
        groupPrixElectricite.style.display = 'none';
        groupConsoCarburantVE.style.display = 'none';
        groupPrixCarburantVE.style.display = 'none';
        unitVE.textContent = ''; // Réinitialiser l'unité

        // Cacher les messages d'erreur des champs concernés
        document.getElementById('error-consoVE').textContent = '';
        document.getElementById('error-prixElectricite').textContent = '';
        document.getElementById('error-consoCarburantVE').textContent = '';
        document.getElementById('error-prixCarburantVE').textContent = '';

        if (type === 'electrique') {
            groupPrixElectricite.style.display = 'flex';
            unitVE.textContent = 'kWh/100km';
            // Pas de valeurs par défaut si pré-remplies par le JSON, sinon conserver des valeurs par défaut intelligentes
            // consoVE.value = 15.0; // Ces lignes peuvent être commentées/ajustées
            // prixElectricite.value = 0.25;
        } else if (type === 'hybride') { // Hybride non rechargeable
            groupPrixElectricite.style.display = 'flex'; // Utilise le même champ que prixElectricite pour le prix du carburant
            unitVE.textContent = 'L/100km'; // La conso est en L/100km pour les hybrides non rechargeables
            // consoVE.value = 5.0;
            // prixElectricite.value = 1.80; // Prix de l'essence
        } else if (type === 'hybride-rechargeable') {
            groupPrixElectricite.style.display = 'flex'; // Prix Electricité pour la partie électrique
            groupConsoCarburantVE.style.display = 'flex'; // Conso Carburant pour la partie thermique
            groupPrixCarburantVE.style.display = 'flex'; // Prix Carburant pour la partie thermique
            unitVE.textContent = 'kWh/100km'; // La conso principale reste kWh/100km
            // consoVE.value = 20.0; // Conso électrique
            // prixElectricite.value = 0.25;
            // consoCarburantVE.value = 3.0; // Conso carburant
            // prixCarburantVE.value = 1.80;
        }
    }

    // --- Gestion de l'unité de consommation thermique ---
    function updateThermiqueUnit() {
        const type = typeVehiculeThermique.value;
        if (type === 'essence' || type === 'diesel') {
            unitThermique.textContent = 'L/100km';
            unitPrixCarburant.textContent = '€/L';
        }
    }

    // --- Logique de navigation entre sections ---
    function showSection(sectionId) {
        navLinks.forEach(link => {
            const section = document.getElementById(link.dataset.section);
            if (link.dataset.section === sectionId) {
                link.classList.add('active-link');
                section.style.display = 'block';
            } else {
                link.classList.remove('active-link');
                section.classList.remove('active');
                section.style.display = 'none';
            }
        });
    }

    // --- Chargement des données des voitures et remplissage des sélecteurs ---
    async function loadCarData() {
        try {
            const response = await fetch('data/cars.json'); // Le chemin vers cars.json est relatif à index.html
            if (!response.ok) {
                throw new Error(`Erreur HTTP ! Statut: ${response.status}`);
            }
            allCarsData = await response.json();

            if (Array.isArray(allCarsData) && allCarsData.length > 0) {
                populateCarSelector(); // Pour la section fiches techniques
                populateCalculatorCarSelects(); // Pour le calculateur TCO
            } else {
                carDetailsDisplay.innerHTML = `<p class="result-message error-message-text"><i class="fas fa-exclamation-triangle"></i> Aucune donnée de véhicule trouvée dans data/cars.json ou le format est incorrect.</p>`;
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données des voitures :', error);
            carDetailsDisplay.innerHTML = `<p class="result-message error-message-text"><i class="fas fa-exclamation-triangle"></i> Impossible de charger la liste des véhicules. Vérifiez le fichier data/cars.json et les droits d'accès.</p>`;
        }
    }

    // NOUVELLE FONCTION : Remplir les listes déroulantes du calculateur TCO
    function populateCalculatorCarSelects() {
        // Nettoyer les sélecteurs avant de les remplir
        selectThermicCar.innerHTML = '<option value="">-- Sélectionner un véhicule --</option>';
        selectTargetCar.innerHTML = '<option value="">-- Sélectionner un véhicule --</option>';

        allCarsData.forEach(car => {
            const option = document.createElement('option');
            option.value = car.id;
            option.textContent = `${car.marque} ${car.modele} (${car.annee})`;

            // Filtrer pour le sélecteur thermique
            if (car.type.includes('Thermique') || car.type.includes('Hybride léger')) {
                selectThermicCar.appendChild(option.cloneNode(true)); // Cloner l'option
            }
            // Filtrer pour le sélecteur cible (VE / Hybride / Hybride Rechargeable)
            if (car.type.includes('Électrique') || car.type.includes('Hybride')) { // Inclut Hybride léger si vous voulez
                selectTargetCar.appendChild(option.cloneNode(true));
            }
        });
    }

    // NOUVELLE FONCTION : Pré-remplir les champs du formulaire du calculateur
    function fillCalculatorFormWithCarData(carId, formType) {
        const car = allCarsData.find(c => c.id === carId);
        if (!car) return;

        if (formType === 'thermic') {
            // Déduire le type de carburant pour le sélecteur
            let fuelType = '';
            if (car.type && car.type.toLowerCase().includes('essence')) {
                fuelType = 'essence';
            } else if (car.type && car.type.toLowerCase().includes('diesel')) {
                fuelType = 'diesel';
            }
            typeVehiculeThermique.value = fuelType || 'essence'; // Valeur par défaut si non trouvé

            // Utilise parseFloat et replace pour extraire les nombres des chaînes (ex: "5.4 L/100km")
            consoThermique.value = parseFloat(car.conso_mixte_wlpt?.replace(/[^0-9.,]/g, '').replace(',', '.')) || '';
            prixCarburant.value = car.prix_carburant || ''; // Ex: "prix_carburant": 1.80
            prixAchatThermique.value = parseFloat(car.prix_a_partir?.replace(' €', '').replace(',', '.')) || '';
            entretienThermique.value = car.entretien_annuel || '';
            assuranceThermique.value = car.assurance_annuelle || '';
            reventeThermique.value = car.valeur_revente || '';

            // Mettre à jour l'unité pour la consommation thermique
            updateThermiqueUnit();

        } else if (formType === 'target') {
            // Mappe le type du JSON aux valeurs du sélecteur
            let targetType = '';
            if (car.type.includes('Électrique')) {
                targetType = 'electrique';
            } else if (car.type.includes('Hybride (non rechargeable)')) {
                targetType = 'hybride';
            } else if (car.type.includes('Hybride Rechargeable')) {
                targetType = 'hybride-rechargeable';
            } else if (car.type.includes('Hybride léger')) { // Si un mild-hybrid peut être une cible
                targetType = 'hybride'; // Ou une autre catégorie si vous les traitez différemment
            }
            typeVehiculeCible.value = targetType || 'electrique';

            // Consommation principale (kWh/100km pour VE, L/100km pour Hybride)
            consoVE.value = parseFloat(car.conso_mixte_wlpt?.replace(/[^0-9.,]/g, '').replace(',', '.')) || '';
            prixElectricite.value = car.prix_electricite || ''; // Ex: "prix_electricite": 0.25
            prixAchatVE.value = parseFloat(car.prix_a_partir?.replace(' €', '').replace(',', '.')) || '';
            aidesVE.value = car.aides_gouvernementales || 0;
            installationBorne.value = car.cout_installation_borne || 0;
            entretienVE.value = car.entretien_annuel || '';
            assuranceVE.value = car.assurance_annuelle || '';
            reventeVE.value = car.valeur_revente || '';

            // Champs spécifiques pour les hybrides/PHEV
            consoCarburantVE.value = car.conso_carburant_hybride || ''; // Ex: "conso_carburant_hybride": 5.5
            prixCarburantVE.value = car.prix_carburant_hybride || ''; // Ex: "prix_carburant_hybride": 1.80

            // Mettre à jour l'affichage des champs (électricité/carburant)
            updateTargetVehicleInputs();
        }

        // Pré-remplir les champs communs s'ils existent dans le JSON (optionnel)
        kmAnnuels.value = car.km_annuels || kmAnnuels.value;
        dureePossession.value = car.duree_possession || dureePossession.value;
    }


    function populateCarSelector() {
        if (!carSelector) {
            console.error('Erreur: carSelector est null. Impossible de populer la liste déroulante.');
            return;
        }
        carSelector.innerHTML = '<option value="">-- Choisissez un modèle --</option>';
        if (allCarsData && Array.isArray(allCarsData) && allCarsData.length > 0) {
            allCarsData.forEach(car => {
                if (car.id && car.marque && car.modele && car.annee) {
                    const option = document.createElement('option');
                    option.value = car.id;
                    option.textContent = `${car.marque} ${car.modele} (${car.annee})`;
                    carSelector.appendChild(option);
                } else {
                    console.warn('Objet voiture mal formé dans cars.json (manque id, marque, modele ou annee) :', car);
                }
            });
        }
    }

    // --- Écouteurs d'événements ---

    // Navigation principale
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetSectionId = link.dataset.section;

            showSection(targetSectionId);

            // Si on va sur la section des fiches techniques, charger les données
            if (targetSectionId === 'carSpecsSection') {
                // Les données sont chargées au DOMContentLoaded, donc juste s'assurer que le sélecteur est peuplé
                populateCarSelector();
                carSelector.value = '';
                carDetailsDisplay.innerHTML = '';
            }
            // Quand on revient sur le calculateur, on peut aussi réinitialiser
            if (targetSectionId === 'calculatorSection') {
                // selectThermicCar.value = ''; // Optionnel: réinitialiser les sélecteurs du calculateur
                // selectTargetCar.value = '';
                // fillCalculatorFormWithCarData('', 'thermic'); // Vider les champs
                // fillCalculatorFormWithCarData('', 'target'); // Vider les champs
                resultsDiv.innerHTML = '';
                if (tcoChart) {
                    tcoChart.destroy();
                }
            }
        });
    });

    // Calculateur TCO
    calculateBtn.addEventListener('click', calculateTCO);
    typeVehiculeCible.addEventListener('change', updateTargetVehicleInputs);
    typeVehiculeThermique.addEventListener('change', updateThermiqueUnit);

    // NOUVEAU: Écouteurs pour les sélecteurs de voiture du calculateur
    selectThermicCar.addEventListener('change', (event) => {
        fillCalculatorFormWithCarData(event.target.value, 'thermic');
    });

    selectTargetCar.addEventListener('change', (event) => {
        fillCalculatorFormWithCarData(event.target.value, 'target');
    });


    // Fiches Techniques : Gérer la sélection et la redirection
    carSelector.addEventListener('change', (event) => {
        const selectedCarId = event.target.value;
        if (selectedCarId) {
            window.location.href = `pages/cars/${selectedCarId}.html`;
        } else {
            carDetailsDisplay.innerHTML = '';
        }
    });

    // --- Initialisation au chargement de la page ---
    loadCarData(); // Charge les données pour toutes les sections
    updateTargetVehicleInputs(); // Initialiser les champs du véhicule cible
    updateThermiqueUnit(); // Initialiser l'unité thermique

    // Initialiser l'affichage des sections.
    calculatorSection.style.display = 'block';
    carSpecsSection.style.display = 'none';
    showSection('calculatorSection'); // Afficher la section "Calculateur TCO" par défaut
});