document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculateBtn');
    const resultsDiv = document.getElementById('results');
    const typeVehiculeThermiqueSelect = document.getElementById('typeVehiculeThermique');
    const consoThermiqueInput = document.getElementById('consoThermique');
    const prixCarburantInput = document.getElementById('prixCarburant');
    const unitThermiqueSpan = document.getElementById('unitThermique');
    const unitPrixCarburantSpan = document.getElementById('unitPrixCarburant');

    const typeVehiculeCibleSelect = document.getElementById('typeVehiculeCible');
    const consoVEInput = document.getElementById('consoVE');
    const unitVESpan = document.getElementById('unitVE');
    const groupPrixElectricite = document.getElementById('group-prixElectricite');
    const prixElectriciteInput = document.getElementById('prixElectricite');
    const groupPrixCarburantVE = document.getElementById('group-prixCarburantVE');
    const prixCarburantVEInput = document.getElementById('prixCarburantVE');
    const groupConsoCarburantVE = document.getElementById('group-consoCarburantVE');
    const consoCarburantVEInput = document.getElementById('consoCarburantVE');

    let tcoChart = null; // Variable pour stocker l'instance du graphique Chart.js

    // --- Fonctions de validation et d'affichage des erreurs ---
    function showError(elementId, message) {
        const errorElement = document.getElementById(`error-${elementId}`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('visible');
            document.getElementById(elementId).classList.add('input-error'); // Ajoute une classe pour styler le champ en rouge
        }
    }

    function hideError(elementId) {
        const errorElement = document.getElementById(`error-${elementId}`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('visible');
            document.getElementById(elementId).classList.remove('input-error');
        }
    }

    function validateInput(elementId, value, min, customMessage = null) {
        // Valide si c'est un nombre et s'il est supérieur ou égal à 'min'
        if (isNaN(value) || value < min) {
            showError(elementId, customMessage || `Veuillez entrer un nombre valide et positif (min ${min}).`);
            return false;
        }
        hideError(elementId);
        return true;
    }

    function validateAllInputs() {
        let isValid = true;

        // Liste des champs à valider avec leurs IDs, valeurs minimales et messages d'erreur personnalisés
        const inputsToValidate = [
            { id: 'kmAnnuels', min: 0, msg: 'Les kilomètres annuels doivent être un nombre positif.' },
            { id: 'prixAchatThermique', min: 0, msg: 'Le prix d\'achat thermique doit être un nombre positif.' },
            { id: 'entretienThermique', min: 0, msg: 'Le coût d\'entretien thermique doit être un nombre positif.' },
            { id: 'assuranceThermique', min: 0, msg: 'Le coût d\'assurance thermique doit être un nombre positif.' },
            { id: 'reventeThermique', min: 0, msg: 'La valeur de revente thermique doit être un nombre positif.' },
            { id: 'prixAchatVE', min: 0, msg: 'Le prix d\'achat VE/Hybride doit être un nombre positif.' },
            { id: 'entretienVE', min: 0, msg: 'Le coût d\'entretien VE/Hybride doit être un nombre positif.' },
            { id: 'assuranceVE', min: 0, msg: 'Le coût d\'assurance VE/Hybride doit être un nombre positif.' },
            { id: 'aidesVE', min: 0, msg: 'Les aides/subventions doivent être un nombre positif.' },
            { id: 'installationBorne', min: 0, msg: 'Le coût d\'installation de la borne doit être un nombre positif.' },
            { id: 'reventeVE', min: 0, msg: 'La valeur de revente VE/Hybride doit être un nombre positif.' },
            { id: 'dureePossession', min: 1, msg: 'La durée de possession doit être au moins de 1 an.' }
        ];

        // Valider chaque champ dans la liste
        inputsToValidate.forEach(input => {
            const value = parseFloat(document.getElementById(input.id).value);
            if (!validateInput(input.id, value, input.min, input.msg)) {
                isValid = false;
            }
        });

        // Validation spécifique pour les consommations et prix en fonction des types de véhicules sélectionnés
        const currentTypeThermique = typeVehiculeThermiqueSelect.value;
        const currentTypeCible = typeVehiculeCibleSelect.value;

        // Validation pour le véhicule thermique
        if (currentTypeThermique === 'essence' || currentTypeThermique === 'diesel') {
            if (!validateInput('consoThermique', parseFloat(consoThermiqueInput.value), 0.1, 'Consommation thermique invalide (ex: 7.0 L/100km).')) isValid = false;
            if (!validateInput('prixCarburant', parseFloat(prixCarburantInput.value), 0.01, 'Prix carburant invalide (ex: 1.80 €/L).')) isValid = false;
        }

        // Validation pour le véhicule cible (VE, Hybride, Hybride Rechargeable)
        if (currentTypeCible === 'electrique') {
            if (!validateInput('consoVE', parseFloat(consoVEInput.value), 0.1, 'Consommation électrique invalide (ex: 15.0 kWh/100km).')) isValid = false;
            if (!validateInput('prixElectricite', parseFloat(prixElectriciteInput.value), 0.01, 'Prix électricité invalide (ex: 0.25 €/kWh).')) isValid = false;
        } else if (currentTypeCible === 'hybride' || currentTypeCible === 'hybride-rechargeable') {
            // Pour les hybrides, on attend une consommation électrique/mixte et une consommation carburant.
            if (!validateInput('consoVE', parseFloat(consoVEInput.value), 0.1, 'Consommation électrique/mixte invalide (ex: 18.0 kWh/100km).')) isValid = false;
            if (!validateInput('prixElectricite', parseFloat(prixElectriciteInput.value), 0.01, 'Prix électricité invalide (ex: 0.25 €/kWh).')) isValid = false;
            
            // Les champs carburant pour hybrides sont obligatoires
            if (!validateInput('consoCarburantVE', parseFloat(consoCarburantVEInput.value), 0.1, 'Consommation carburant hybride invalide (ex: 5.0 L/100km).')) isValid = false;
            if (!validateInput('prixCarburantVE', parseFloat(prixCarburantVEInput.value), 0.01, 'Prix carburant hybride invalide (ex: 1.80 €/L).')) isValid = false;
        }

        return isValid;
    }

    // --- Logique d'ajustement des champs de consommation et des unités ---
    function adjustThermiqueInputs() {
        const type = typeVehiculeThermiqueSelect.value;
        if (type === 'essence') {
            unitThermiqueSpan.textContent = 'L/100km';
            unitPrixCarburantSpan.textContent = '€/L';
            consoThermiqueInput.value = '7.0'; 
            prixCarburantInput.value = '1.80';
            prixCarburantInput.placeholder = 'Prix du carburant en €/L';
        } else if (type === 'diesel') {
            unitThermiqueSpan.textContent = 'L/100km';
            unitPrixCarburantSpan.textContent = '€/L';
            consoThermiqueInput.value = '6.0';
            prixCarburantInput.value = '1.70';
            prixCarburantInput.placeholder = 'Prix du carburant en €/L';
        }
        // Pour des types futurs (ex: GPL), on ajouterait d'autres conditions ici.
    }

    function adjustCibleInputs() {
        const type = typeVehiculeCibleSelect.value;

        // Cacher tous les champs spécifiques par défaut
        groupPrixElectricite.style.display = 'none';
        groupPrixCarburantVE.style.display = 'none';
        groupConsoCarburantVE.style.display = 'none';
        // Réinitialiser les valeurs pour éviter des calculs avec des anciennes données cachées
        prixElectriciteInput.value = '0';
        prixCarburantVEInput.value = '0';
        consoCarburantVEInput.value = '0';


        if (type === 'electrique') {
            unitVESpan.textContent = 'kWh/100km';
            consoVEInput.value = '15.0'; // Conso électrique pure
            groupPrixElectricite.style.display = 'flex';
            prixElectriciteInput.value = '0.25';
            prixElectriciteInput.placeholder = 'Prix de l\'électricité en €/kWh';
        } else if (type === 'hybride') { // Hybride non rechargeable (HEV)
            // Pour les HEV, la conso principale est souvent exprimée en L/100km, même s'il y a une petite part électrique.
            // On peut aussi considérer une conso "mixte" en L/100km et un coût symbolique de l'électricité
            unitVESpan.textContent = 'L/100km'; 
            consoVEInput.value = '5.0'; // Conso mixte thermique
            groupPrixCarburantVE.style.display = 'flex';
            prixCarburantVEInput.value = '1.80';
            groupConsoCarburantVE.style.display = 'flex'; // On garde le champ conso carburant visible pour plus de clarté
            consoCarburantVEInput.value = '5.0'; 
            groupPrixElectricite.style.display = 'flex'; // La conso électrique est souvent faible mais présente
            prixElectriciteInput.value = '0.25'; // Prix symbolique ou réel si un peu de recharge
        } else if (type === 'hybride-rechargeable') { // Hybride rechargeable (PHEV)
            // Pour les PHEV, on a une conso électrique significative et une conso carburant pour la partie thermique.
            unitVESpan.textContent = 'kWh/100km'; 
            consoVEInput.value = '20.0'; // Conso électrique pure
            groupPrixElectricite.style.display = 'flex';
            prixElectriciteInput.value = '0.25';
            groupPrixCarburantVE.style.display = 'flex';
            prixCarburantVEInput.value = '1.80';
            groupConsoCarburantVE.style.display = 'flex';
            consoCarburantVEInput.value = '4.0'; // Conso carburant quand le moteur thermique tourne
        }
        // Masquer les erreurs des champs qui pourraient être cachés
        hideError('prixElectricite');
        hideError('prixCarburantVE');
        hideError('consoCarburantVE');
    }

    // --- Initialisation et Écouteurs d'événements pour le calculateur TCO ---
    // Ajuster les champs au chargement de la page
    adjustThermiqueInputs();
    adjustCibleInputs();

    // Écouter les changements de sélection pour les types de véhicules
    typeVehiculeThermiqueSelect.addEventListener('change', adjustThermiqueInputs);
    typeVehiculeCibleSelect.addEventListener('change', adjustCibleInputs);

    // Écouteurs pour masquer les erreurs en temps réel dès que l'utilisateur tape
    document.querySelectorAll('.input-group input, .input-group select').forEach(input => {
        input.addEventListener('input', (e) => hideError(e.target.id));
        input.addEventListener('change', (e) => hideError(e.target.id)); // Aussi pour les selects
    });

    calculateBtn.addEventListener('click', () => {
        // Exécuter la validation avant de faire les calculs
        if (!validateAllInputs()) {
            resultsDiv.innerHTML = '<p style="color: var(--error-color);">Veuillez corriger les erreurs dans le formulaire pour effectuer le calcul.</p>';
            if (tcoChart) tcoChart.destroy(); // Détruire le graphique si on ne peut pas calculer
            return;
        }

        // 1. Récupérer les valeurs des champs d'entrée (après validation réussie)
        const kmAnnuels = parseFloat(document.getElementById('kmAnnuels').value);
        const typeVehiculeThermique = typeVehiculeThermiqueSelect.value;
        const consoThermique = parseFloat(document.getElementById('consoThermique').value);
        const prixCarburant = parseFloat(document.getElementById('prixCarburant').value);
        const prixAchatThermique = parseFloat(document.getElementById('prixAchatThermique').value);
        const entretienThermique = parseFloat(document.getElementById('entretienThermique').value);
        const assuranceThermique = parseFloat(document.getElementById('assuranceThermique').value); 
        const reventeThermique = parseFloat(document.getElementById('reventeThermique').value);   

        const typeVehiculeCible = typeVehiculeCibleSelect.value;
        const consoVE = parseFloat(document.getElementById('consoVE').value); // Peut être kWh ou L/100km selon le type
        const prixElectricite = parseFloat(document.getElementById('prixElectricite').value);
        const prixAchatVE = parseFloat(document.getElementById('prixAchatVE').value);
        const entretienVE = parseFloat(document.getElementById('entretienVE').value);
        const assuranceVE = parseFloat(document.getElementById('assuranceVE').value);             
        const aidesVE = parseFloat(document.getElementById('aidesVE').value);
        const installationBorne = parseFloat(document.getElementById('installationBorne').value); 
        const reventeVE = parseFloat(document.getElementById('reventeVE').value);               
        const dureePossession = parseFloat(document.getElementById('dureePossession').value);
        
        // Champs spécifiques aux hybrides (peuvent être 0 si non affichés/pertinents)
        const prixCarburantVE = parseFloat(document.getElementById('prixCarburantVE').value);
        const consoCarburantVE = parseFloat(document.getElementById('consoCarburantVE').value);


        // --- Calcul des coûts ---
        // Coût carburant/énergie annuel pour véhicule thermique
        const coutCarburantAnnuelThermique = (kmAnnuels / 100) * consoThermique * prixCarburant;

        // Coût carburant/énergie annuel pour VE/Hybride (plus complexe car dépend du type)
        let coutEnergieAnnuelVE = 0; // Coût lié à l'électricité pour le véhicule cible
        let coutCarburantAnnuelCible = 0; // Coût lié au carburant pour le véhicule cible (pour hybrides)
        
        if (typeVehiculeCible === 'electrique') {
            coutEnergieAnnuelVE = (kmAnnuels / 100) * consoVE * prixElectricite;
        } else if (typeVehiculeCible === 'hybride') { // Hybride non rechargeable
            // Pour les HEV, on va utiliser la consoVE comme la conso mixte en L/100km (comme si c'était un thermique)
            // et une petite part pour l'électricité si le champ est rempli et pertinent.
            // Simplification : le champ consoVE représente la conso principale (carburant) pour cet hybride.
            // On peut affiner en introduisant un % d'utilisation électrique.
            coutCarburantAnnuelCible = (kmAnnuels / 100) * consoVE * prixCarburantVE; 
            coutEnergieAnnuelVE = (kmAnnuels / 100) * 0.5 * prixElectricite; // Petite part électrique, ajustable
        } else if (typeVehiculeCible === 'hybride-rechargeable') { // PHEV
            // Ici on va assumer un mix : une partie en électrique (consoVE kWh/100km) et une partie en thermique (consoCarburantVE L/100km)
            // Pour une approche plus réaliste, on peut demander l'autonomie électrique et le % d'utilisation quotidien.
            // Simplification : les deux consommations s'appliquent sur le kilométrage total.
            coutEnergieAnnuelVE = (kmAnnuels / 100) * consoVE * prixElectricite; // Coût partie électrique
            coutCarburantAnnuelCible = (kmAnnuels / 100) * consoCarburantVE * prixCarburantVE; // Coût partie thermique
        }


        // Coût total sur la durée de possession (formule mise à jour)
        const coutTotalThermique = prixAchatThermique +
                                   (coutCarburantAnnuelThermique * dureePossession) +
                                   (entretienThermique * dureePossession) +
                                   (assuranceThermique * dureePossession) -
                                   reventeThermique;

        const coutTotalVE = (prixAchatVE - aidesVE) +
                            ((coutEnergieAnnuelVE + coutCarburantAnnuelCible) * dureePossession) + // Somme des coûts énergie/carburant annuels
                            (entretienVE * dureePossession) +
                            (assuranceVE * dureePossession) +
                            installationBorne -
                            reventeVE;

        // Économies réalisées
        const economiesPotentielles = coutTotalThermique - coutTotalVE;
        const economiesAnnuelleEnergie = (coutCarburantAnnuelThermique) - (coutEnergieAnnuelVE + coutCarburantAnnuelCible);

        // 4. Afficher les résultats
        resultsDiv.innerHTML = `
            <h3>Coûts annuels estimés :</h3>
            <p>Coût carburant annuel pour le <strong>véhicule thermique (${typeVehiculeThermique.toUpperCase()})</strong> : <strong>${coutCarburantAnnuelThermique.toFixed(2)} €</strong></p>
            <p>Coût énergie annuel pour le <strong>véhicule cible (${typeVehiculeCible.toUpperCase()})</strong> : <strong>${coutEnergieAnnuelVE.toFixed(2)} €</strong> (électricité)</p>
            ${typeVehiculeCible === 'hybride' || typeVehiculeCible === 'hybride-rechargeable' ? 
                `<p>Coût carburant annuel (partie thermique) pour le <strong>${typeVehiculeCible === 'hybride' ? 'Hybride' : 'Hybride Rechargeable'}</strong> : <strong>${coutCarburantAnnuelCible.toFixed(2)} €</strong></p>` : ''
            }
            <p>Économies annuelles sur l'énergie combinée : <strong>${economiesAnnuelleEnergie.toFixed(2)} €</strong></p>
            <p>Coût assurance annuel pour le <strong>véhicule thermique</strong> : <strong>${assuranceThermique.toFixed(2)} €</strong></p>
            <p>Coût assurance annuel pour le <strong>VE/Hybride</strong> : <strong>${assuranceVE.toFixed(2)} €</strong></p>


            <h3>Coût Total de Possession (TCO) sur ${dureePossession} ans :</h3>
            <p>TCO du <strong>véhicule thermique</strong> : <strong>${coutTotalThermique.toFixed(2)} €</strong></p>
            <p>TCO du <strong>VE/Hybride</strong> (après aides et coûts borne) : <strong>${coutTotalVE.toFixed(2)} €</strong></p>
            <p>Économies potentielles sur ${dureePossession} ans : <strong style="color: ${economiesPotentielles >= 0 ? 'var(--primary-color)' : 'var(--error-color)'};">${economiesPotentielles.toFixed(2)} €</strong></p>
            
            ${economiesPotentielles >= 0 ? 
                `<p>Félicitations ! Vous pourriez économiser <strong>${economiesPotentielles.toFixed(2)} €</strong> sur ${dureePossession} ans en optant pour le VE/Hybride !</p>` :
                `<p style="color: var(--error-color);">Dans cette configuration, le véhicule thermique pourrait être plus économique de <strong>${Math.abs(economiesPotentielles).toFixed(2)} €</strong> sur ${dureePossession} ans.</p>`
            }
        `;

        // --- Mise à jour du graphique Chart.js ---
        const ctx = document.getElementById('tcoChart').getContext('2d');

        if (tcoChart) {
            tcoChart.destroy(); // Détruire l'instance précédente du graphique si elle existe
        }

        tcoChart = new Chart(ctx, {
            type: 'bar', 
            data: {
                labels: [`Véhicule Thermique (${typeVehiculeThermique.toUpperCase()})`, `Véhicule Cible (${typeVehiculeCible.toUpperCase()})`],
                datasets: [{
                    label: 'Coût Total de Possession sur ' + dureePossession + ' ans (€)',
                    data: [coutTotalThermique, coutTotalVE],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)', // Rouge pour thermique
                        'rgba(75, 192, 192, 0.7)'  // Vert pour VE/Hybride
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
                maintainAspectRatio: true, 
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Coût Total (€)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Comparaison des Coûts Totaux de Possession'
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
    });

// ... (votre code JavaScript existant pour le calculateur TCO et les fonctions de validation) ...

    // --- NOUVEAU CODE POUR LES FICHES TECHNIQUES ---
    const carSelector = document.getElementById('carSelector');
    // const carDetailsDiv = document.getElementById('carDetails'); // Cette div ne sera plus utilisée pour afficher les détails

    let carsData = []; // Pour stocker les données des voitures

    // Fonction pour charger les données des voitures
    async function loadCarsData() {
        try {
            const response = await fetch('data/cars.json'); 
            if (!response.ok) {
                throw new Error(`Erreur de chargement des données : ${response.statusText}`);
            }
            carsData = await response.json();
            populateCarSelector();
        } catch (error) {
            console.error('Erreur lors du chargement des données des voitures :', error);
            // carDetailsDiv.innerHTML = '<p style="color: red;">Impossible de charger les fiches techniques pour le moment.</p>'; // Plus nécessaire
        }
    }

    // Fonction pour populer le sélecteur déroulant
    function populateCarSelector() {
        carSelector.innerHTML = '<option value="">-- Choisissez un modèle --</option>'; 
        carsData.forEach(car => {
            const option = document.createElement('option');
            option.value = `pages/cars/${car.id}.html`; // Lien direct vers la page générée
            option.textContent = `${car.marque} ${car.modele} (${car.annee}) - ${car.type}`;
            carSelector.appendChild(option);
        });
    }

    // Fonction pour rediriger vers la page de la voiture sélectionnée
    // Cette fonction remplace l'ancienne 'displayCarDetails'
    function redirectToCarPage(url) {
        if (url) {
            window.location.href = url; // Redirige le navigateur
        }
    }

    // Écouteur pour le sélecteur de voiture
    carSelector.addEventListener('change', (event) => {
        redirectToCarPage(event.target.value);
    });

    // Charger les données des voitures au démarrage
    loadCarsData();

// ... (le reste de votre code JavaScript existant pour le calculateur TCO) ...
});