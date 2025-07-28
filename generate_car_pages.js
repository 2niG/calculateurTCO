const fs = require('fs');
const path = require('path');

const carsDataPath = path.join(__dirname, 'data', 'cars.json');
const templatePath = path.join(__dirname, 'car-template.html');
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
        console.error('Erreur lors de la lecture de car-template.html :', error);
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

        // Remplacer les placeholders génériques
        pageHtml = pageHtml.replace(/{{car_id}}/g, car.id || '');
        pageHtml = pageHtml.replace(/{{car_marque}}/g, car.marque || '');
        pageHtml = pageHtml.replace(/{{car_modele}}/g, car.modele || '');
        pageHtml = pageHtml.replace(/{{car_annee}}/g, car.annee || '');
        pageHtml = pageHtml.replace(/{{car_type}}/g, car.type || '');
        pageHtml = pageHtml.replace(/{{car_image}}/g, car.image || 'images/default-car.jpg'); // Image par défaut si absente
        pageHtml = pageHtml.replace(/{{car_description_courte}}/g, car.description_courte || 'Pas de description disponible.');
        pageHtml = pageHtml.replace(/{{car_conso_mixte_wlpt}}/g, car.conso_mixte_wlpt || 'N/A');
        pageHtml = pageHtml.replace(/{{car_prix_a_partir}}/g, car.prix_a_partir || 'Prix non communiqué');
        pageHtml = pageHtml.replace(/{{car_puissance_max}}/g, car.puissance_max || '');
        pageHtml = pageHtml.replace(/{{car_puissance_totale}}/g, car.puissance_totale || '');
        pageHtml = pageHtml.replace(/{{car_motorisation}}/g, car.motorisation ? `<li><i class="fas fa-cogs"></i> Motorisation : <strong>${car.motorisation}</strong></li>` : '');

        // Remplacer les placeholders conditionnels (HTML complet si la donnée existe)
        pageHtml = pageHtml.replace(/{{car_autonomie_wlpt_html}}/g, 
            car.autonomie_wlpt ? `<li><i class="fas fa-road"></i> Autonomie WLTP : <strong>${car.autonomie_wlpt}</strong></li>` : ''
        );
        pageHtml = pageHtml.replace(/{{car_batterie_utile_html}}/g, 
            car.batterie_utile ? `<li><i class="fas fa-battery-full"></i> Batterie utile : <strong>${car.batterie_utile}</strong></li>` : ''
        );
        pageHtml = pageHtml.replace(/{{car_autonomie_electrique_wlpt_html}}/g, 
            car.autonomie_electrique_wlpt ? `<li><i class="fas fa-bolt"></i> Autonomie électrique WLTP : <strong>${car.autonomie_electrique_wlpt}</strong></li>` : ''
        );
        pageHtml = pageHtml.replace(/{{car_0_100kmh_html}}/g, 
            car['0_100kmh'] ? `<li><i class="fas fa-gauge-high"></i> 0-100 km/h : <strong>${car['0_100kmh']}</strong></li>` : ''
        );
        pageHtml = pageHtml.replace(/{{car_emissions_co2_html}}/g, 
            car.emissions_co2 ? `<li><i class="fas fa-smog"></i> Émissions CO2 : <strong>${car.emissions_co2}</strong></li>` : ''
        );
        pageHtml = pageHtml.replace(/{{car_charge_ac_max_html}}/g, 
            car.charge_ac_max ? `<li><i class="fas fa-plug"></i> Charge AC Max : <strong>${car.charge_ac_max}</strong></li>` : ''
        );
        pageHtml = pageHtml.replace(/{{car_charge_dc_max_html}}/g, 
            car.charge_dc_max ? `<li><i class="fas fa-charging-station"></i> Charge DC Max : <strong>${car.charge_dc_max}</strong></li>` : ''
        );

        // Avantages et inconvénients
        const advantagesHtml = car.avantages && car.avantages.length > 0
            ? car.avantages.map(adv => `<li><i class="fas fa-check-circle"></i> ${adv}</li>`).join('')
            : '<li>Aucun avantage listé.</li>';
        pageHtml = pageHtml.replace(/{{car_advantages_html}}/g, advantagesHtml);

        const disadvantagesHtml = car.inconvenients && car.inconvenients.length > 0
            ? car.inconvenients.map(disadv => `<li><i class="fas fa-times-circle"></i> ${disadv}</li>`).join('')
            : '<li>Aucun inconvénient listé.</li>';
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