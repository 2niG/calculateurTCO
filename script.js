document.addEventListener('DOMContentLoaded', () => {
    // --- Variables Globales pour les éléments du DOM ---
    const calculatorSection = document.getElementById('calculatorSection');
    const carSpecsSection = document.getElementById('carSpecsSection');
    const navLinks = document.querySelectorAll('.main-nav a');

    // Section Calculateur TCO
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

            validateInput(consoVE, 0.1, true),
            validateInput(prixElectricite, 0.01, true),
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
            const consoEssenceHybride = parseFloat(consoVE.value); // Reutilise consoVE pour l'essence de l'hybride
            const prixEssenceHybride = parseFloat(prixElectricite.value); // Reutilise prixElectricite pour le prix de l'essence de l'hybride
            coutEnergieVE = (totalKm / 100) * consoEssenceHybride * prixEssenceHybride;
        } else if (typeCible === 'hybride-rechargeable') { // Hybride rechargeable (PHEV)
            const consoElecPHEV = parseFloat(consoVE.value);
            const prixElecPHEV = parseFloat(prixElectricite.value);
            const consoCarbPHEV = parseFloat(consoCarburantVE.value);
            const prixCarbPHEV = parseFloat(prixCarburantVE.value);

            // Pour un PHEV, on estime une répartition. Simplifié ici à 50/50 ou selon les données disponibles
            // Une approche plus précise nécessiterait l'autonomie électrique réelle et la fréquence de charge
            const partElectrique = 0.5; // Exemple: 50% des km parcourus en électrique
            const partThermique = 0.5; // Exemple: 50% des km parcourus en thermique

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
            consoVE.value = 15.0;
            prixElectricite.value = 0.25;
        } else if (type === 'hybride') { // Hybride non rechargeable
            groupPrixElectricite.style.display = 'flex'; // Utilise le même champ que prixElectricite pour le prix du carburant
            unitVE.textContent = 'L/100km'; // La conso est en L/100km pour les hybrides non rechargeables
            consoVE.value = 5.0;
            prixElectricite.value = 1.80; // Prix de l'essence
        } else if (type === 'hybride-rechargeable') {
            groupPrixElectricite.style.display = 'flex'; // Prix Electricité pour la partie électrique
            groupConsoCarburantVE.style.display = 'flex'; // Conso Carburant pour la partie thermique
            groupPrixCarburantVE.style.display = 'flex'; // Prix Carburant pour la partie thermique
            unitVE.textContent = 'kWh/100km'; // La conso principale reste kWh/100km
            consoVE.value = 20.0; // Conso électrique
            prixElectricite.value = 0.25;
            consoCarburantVE.value = 3.0; // Conso carburant
            prixCarburantVE.value = 1.80;
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
                // S'assurer que la section est visible
                section.style.display = 'block';
            } else {
                link.classList.remove('active-link');
                section.classList.remove('active'); // Retirer la classe active
                section.style.display = 'none'; // Cacher les autres sections
            }
        });
    }

    // --- Chargement des données des voitures et remplissage du sélecteur ---
    async function loadCarData() {
        try {
            // Le chemin vers cars.json est relatif à index.html
            const response = await fetch('data/cars.json');
            if (!response.ok) {
                throw new Error(`Erreur HTTP ! Statut: ${response.status}`);
            }
            allCarsData = await response.json();

            // Vérifier que allCarsData est un tableau et contient des éléments
            if (Array.isArray(allCarsData) && allCarsData.length > 0) {
                populateCarSelector(); // Appel crucial
            } else {
                carDetailsDisplay.innerHTML = `<p class="result-message error-message-text"><i class="fas fa-exclamation-triangle"></i> Aucune donnée de véhicule trouvée dans data/cars.json ou le format est incorrect.</p>`;
            }

        } catch (error) {
            console.error('Erreur lors du chargement des données des voitures :', error);
            carDetailsDisplay.innerHTML = `<p class="result-message error-message-text"><i class="fas fa-exclamation-triangle"></i> Impossible de charger la liste des véhicules. Vérifiez le fichier data/cars.json et les droits d'accès.</p>`;
        }
    }

    function populateCarSelector() {
        if (!carSelector) {
            console.error('Erreur: carSelector est null. Impossible de populer la liste déroulante.');
            return; // Arrêter la fonction si l'élément n'est pas trouvé
        }

        carSelector.innerHTML = '<option value="">-- Choisissez un modèle --</option>'; // Réinitialise et ajoute l'option par défaut

        if (allCarsData && Array.isArray(allCarsData) && allCarsData.length > 0) {
            allCarsData.forEach(car => {
                // Vérifier la structure de chaque objet voiture
                if (car.id && car.marque && car.modele && car.annee) {
                    const option = document.createElement('option');
                    option.value = car.id; // L'ID du véhicule
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
            event.preventDefault(); // Empêche le rechargement de la page
            const targetSectionId = link.dataset.section;
            
            showSection(targetSectionId); // Affiche la section correspondante

            // Si on va sur la section des fiches techniques, charger les données
            if (targetSectionId === 'carSpecsSection') {
                // Ne charger les données que si elles ne l'ont pas déjà été
                if (allCarsData.length === 0) {
                    loadCarData();
                } else {
                    // Si les données sont déjà là, s'assurer que le sélecteur est bien peuplé
                    populateCarSelector(); 
                }
                // Réinitialiser la sélection et l'affichage des détails quand on arrive sur cette section
                carSelector.value = '';
                carDetailsDisplay.innerHTML = '';
            }
            // Quand on revient sur le calculateur, on peut aussi réinitialiser
            if (targetSectionId === 'calculatorSection') {
                carSelector.value = '';
                carDetailsDisplay.innerHTML = '';
                resultsDiv.innerHTML = ''; // Nettoyer les résultats du calculateur
                if (tcoChart) {
                    tcoChart.destroy(); // Détruire le graphique si on quitte la section
                }
            }
        });
    });

    // Calculateur TCO
    calculateBtn.addEventListener('click', calculateTCO);
    typeVehiculeCible.addEventListener('change', updateTargetVehicleInputs);
    typeVehiculeThermique.addEventListener('change', updateThermiqueUnit);

    // Fiches Techniques : Gérer la sélection et la redirection
    carSelector.addEventListener('change', (event) => {
        const selectedCarId = event.target.value;
        if (selectedCarId) {
            // Redirige l'utilisateur vers la page HTML générée pour cette voiture
            // Le chemin est relatif à index.html
            window.location.href = `pages/cars/${selectedCarId}.html`;
        } else {
            // Si l'option "-- Choisissez un modèle --" est sélectionnée, vider l'affichage
            carDetailsDisplay.innerHTML = '';
        }
    });

    // --- Initialisation au chargement de la page ---
    updateTargetVehicleInputs(); // Initialiser les champs du véhicule cible
    updateThermiqueUnit(); // Initialiser l'unité thermique

    // Initialiser l'affichage des sections.
    // S'assurer que le calculateur est visible au démarrage et les fiches techniques masquées.
    calculatorSection.style.display = 'block';
    carSpecsSection.style.display = 'none';
    showSection('calculatorSection'); // Afficher la section "Calculateur TCO" par défaut
});