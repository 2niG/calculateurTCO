const fs = require('fs');
const path = require('path');

const carsDataPath = path.join(__dirname, 'data', 'cars.json');
// CORRECTION 1: Assurez-vous que le chemin du template est correct
// Si votre car-template.html est dans un dossier 'templates' :
const templatePath = path.join(__dirname, 'car-template.html');
// Si votre car-template.html est à la racine de votre projet :
// const templatePath = path.join(__dirname, 'car-template.html'); // Votre ligne actuelle est correcte si c'est le cas

const outputDirPath = path.join(__dirname, 'pages', 'cars');

async function generateCarPages() {
    console.log('Début de la génération des pages de fiches techniques...');

    // 1. Lire les données des voitures
    let carsData;
    try {
        const data = await fs.promises.readFile(carsDataPath, 'utf8');
        carsData = JSON.parse(data);
        console.log(`Chargement de ${carsData.length} fiches techniques.`);
    } catch (error) {
        console.error('Erreur lors de la lecture ou du parsing de cars.json :', error);
        return;
    }

    // 2. Lire le template HTML
    let templateHtml;
    try {
        templateHtml = await fs.promises.readFile(templatePath, 'utf8');
        console.log('Template HTML chargé.');
    } catch (error) {
        console.error('Erreur lors de la lecture de car-template.html. Vérifiez le chemin du template !', error);
        return;
    }

    // 3. Créer le dossier de sortie si il n'existe pas
    try {
        await fs.promises.mkdir(outputDirPath, { recursive: true });
        console.log(`Dossier de sortie créé ou existant : ${outputDirPath}`);
    } catch (error) {
        console.error('Erreur lors de la création du dossier de sortie :', error);
        return;
    }

    // 4. Générer une page pour chaque voiture
    for (const car of carsData) {
        let pageHtml = templateHtml;

        // Fonction utilitaire pour vérifier si une donnée doit être affichée (non null, non vide, non "N/A")
        const isValidData = (dataValue) => dataValue && dataValue !== 'N/A';

        // Remplacer les placeholders génériques
        pageHtml = pageHtml.replace(/{{car_id}}/g, car.id || '');
        pageHtml = pageHtml.replace(/{{car_marque}}/g, car.marque || '');
        pageHtml = pageHtml.replace(/{{car_modele}}/g, car.modele || '');
        pageHtml = pageHtml.replace(/{{car_annee}}/g, car.annee || '');
        pageHtml = pageHtml.replace(/{{car_type}}/g, car.type || '');
        pageHtml = pageHtml.replace(/{{car_image}}/g, car.image || 'images/default-car.jpg'); // Image par défaut si absente
        pageHtml = pageHtml.replace(/{{car_description_courte}}/g, car.description_courte || 'Pas de description disponible.');
        pageHtml = pageHtml.replace(/{{car_conso_mixte_wlpt}}/g, isValidData(car.conso_mixte_wlpt) ? car.conso_mixte_wlpt : 'N/A');
        pageHtml = pageHtml.replace(/{{car_prix_a_partir}}/g, isValidData(car.prix_a_partir) ? car.prix_a_partir : 'Prix non communiqué');
        
        // CORRECTION 3: Gérer car_puissance_max et car_puissance_totale
        // Si puissance_max n'est pas défini dans le JSON, il sera vide
        pageHtml = pageHtml.replace(/{{car_puissance_max}}/g, car.puissance_max || '');
        pageHtml = pageHtml.replace(/{{car_puissance_totale}}/g, isValidData(car.puissance_totale) ? car.puissance_totale : 'N/A');
        
        // Remplacer les placeholders conditionnels (HTML complet si la donnée existe et est valide)
        pageHtml = pageHtml.replace(/{{car_motorisation}}/g, 
            isValidData(car.motorisation) ? `<li><i class="fas fa-cogs"></i> Motorisation : <strong>${car.motorisation}</strong></li>` : ''
        );

        // CORRECTION 2: Gérer autonomie_wlpt_html et autonomie_electrique_wlpt_html
        // Assumons que les deux peuvent se référer à autonomie_electrique_wlpt du JSON si pas d'autre clé explicite.
        // Si vous avez une clé 'autonomie_wlpt' distincte dans votre JSON, ajustez ici.
        if (isValidData(car.autonomie_electrique_wlpt)) {
            pageHtml = pageHtml.replace(/{{car_autonomie_wlpt_html}}/g, 
                `<li><i class="fas fa-road"></i> Autonomie WLTP : <strong>${car.autonomie_electrique_wlpt}</strong></li>`
            );
            pageHtml = pageHtml.replace(/{{car_autonomie_electrique_wlpt_html}}/g, 
                `<li><i class="fas fa-bolt"></i> Autonomie électrique WLTP : <strong>${car.autonomie_electrique_wlpt}</strong></li>`
            );
        } else {
            pageHtml = pageHtml.replace(/{{car_autonomie_wlpt_html}}/g, '');
            pageHtml = pageHtml.replace(/{{car_autonomie_electrique_wlpt_html}}/g, '');
        }

        pageHtml = pageHtml.replace(/{{car_batterie_utile_html}}/g, 
            isValidData(car.batterie_utile) ? `<li><i class="fas fa-battery-full"></i> Batterie utile : <strong>${car.batterie_utile}</strong></li>` : ''
        );
        pageHtml = pageHtml.replace(/{{car_0_100kmh_html}}/g, 
            isValidData(car['0_100kmh']) ? `<li><i class="fas fa-gauge-high"></i> 0-100 km/h : <strong>${car['0_100kmh']}</strong></li>` : ''
        );
        pageHtml = pageHtml.replace(/{{car_emissions_co2_html}}/g, 
            isValidData(car.emissions_co2) ? `<li><i class="fas fa-smog"></i> Émissions CO2 : <strong>${car.emissions_co2}</strong></li>` : ''
        );
        pageHtml = pageHtml.replace(/{{car_charge_ac_max_html}}/g, 
            isValidData(car.charge_ac_max) ? `<li><i class="fas fa-plug"></i> Charge AC Max : <strong>${car.charge_ac_max}</strong></li>` : ''
        );
        pageHtml = pageHtml.replace(/{{car_charge_dc_max_html}}/g, 
            isValidData(car.charge_dc_max) ? `<li><i class="fas fa-charging-station"></i> Charge DC Max : <strong>${car.charge_dc_max}</strong></li>` : ''
        );

        // Avantages et inconvénients
        const advantagesHtml = car.avantages && car.avantages.length > 0
            ? car.avantages.map(adv => `<li><i class="fas fa-check-circle"></i> ${adv}</li>`).join('')
            : '<li>Aucun avantage listé.</li>'; // Ou vide si vous préférez ne rien afficher
        pageHtml = pageHtml.replace(/{{car_advantages_html}}/g, advantagesHtml);

        const disadvantagesHtml = car.inconvenients && car.inconvenients.length > 0
            ? car.inconvenients.map(disadv => `<li><i class="fas fa-times-circle"></i> ${disadv}</li>`).join('')
            : '<li>Aucun inconvénient listé.</li>'; // Ou vide si vous préférez ne rien afficher
        pageHtml = pageHtml.replace(/{{car_disadvantages_html}}/g, disadvantagesHtml);

        // Nom du fichier de sortie (slugifié pour des URL propres)
        const filename = `${car.id}.html`; // Utilise l'ID comme nom de fichier
        const outputPath = path.join(outputDirPath, filename);

        // 5. Écrire le nouveau fichier HTML
        try {
            await fs.promises.writeFile(outputPath, pageHtml, 'utf8');
            console.log(`Page générée pour ${car.marque} ${car.modele} : ${outputPath}`);
        } catch (error) {
            console.error(`Erreur lors de l'écriture de la page pour ${car.id} :`, error);
        }
    }

    console.log('Génération des pages terminée.');
}

// Exécuter la fonction de génération
generateCarPages();