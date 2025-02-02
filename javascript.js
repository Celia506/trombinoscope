document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé, début du script');

    const container = document.getElementById('apprenants-container');
    const searchName = document.getElementById('search-name');
    const searchPromo = document.getElementById('search-promo');  // Sélecteur pour le menu déroulant
    const competencesContainer = document.getElementById('competences-filters');

    let allApprenants = [];
    let promotionsDict = {};

    // Récupérer les données des promotions
    fetch('https://api-trombi.webedy.fr/wp-json/wp/v2/promotions')
        .then(res => res.json())
        .then(promotions => {
            console.log('Données des promotions récupérées:', promotions);
            promotions.forEach(promo => {
                promotionsDict[promo.id] = promo.slug;
                // Créer une option dans le select pour chaque promotion
                const option = document.createElement('option');
                option.value = promo.id;
                option.textContent = promo.slug;  // Afficher le nom de la promotion
                searchPromo.appendChild(option);
            });

            // Récupérer les données des compétences
            fetch('https://api-trombi.webedy.fr/wp-json/wp/v2/competences')
                .then(res => res.json())
                .then(competences => {
                    console.log('Données des compétences récupérées:', competences);
                    const competencesDict = {};

                    competences.forEach(skill => {
                        competencesDict[skill.id] = skill.name;

                        // Créer un élément checkbox
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.id = `skill-${skill.id}`;
                        checkbox.value = skill.id;
                        checkbox.className = 'competence-checkbox';

                        // Créer un label pour la checkbox
                        const label = document.createElement('label');
                        label.htmlFor = `skill-${skill.id}`;
                        label.textContent = skill.name;

                        // Ajouter checkbox et label au container
                        competencesContainer.appendChild(checkbox);
                        competencesContainer.appendChild(label);
                        competencesContainer.appendChild(document.createElement('br'));

                        // Ajouter un événement de filtrage au changement d'état de la checkbox
                        checkbox.addEventListener('change', () => filterApprenants(promotionsDict, competencesDict));
                    });

                    // Récupérer les données des apprenants
                    fetch('https://api-trombi.webedy.fr/wp-json/wp/v2/apprenants/?per_page=100')
                        .then(res => res.json())
                        .then(apprenants => {
                            console.log('Données des apprenants récupérées:', apprenants);
                            allApprenants = apprenants;
                            displayApprenants(apprenants, promotionsDict, competencesDict);

                            // Filtrage en fonction des recherches
                            searchName.addEventListener('input', () => filterApprenants(promotionsDict, competencesDict));
                            searchPromo.addEventListener('change', () => filterApprenants(promotionsDict, competencesDict));  // Filtrage sur le changement de la promo
                        })
                        .catch(err => console.error('Erreur lors de la récupération des apprenants:', err));
                })
                .catch(err => console.error('Erreur lors de la récupération des compétences:', err));
        })
        .catch(err => console.error('Erreur lors de la récupération des promotions:', err));

    function displayApprenants(apprenants, promotionsDict, competencesDict) {
        console.log('Affichage de', apprenants.length, 'apprenants');
        container.innerHTML = '';
        apprenants.forEach(apprenant => {
            const promoId = apprenant.promotions[0];
            const promoName = promotionsDict[promoId] || 'Inconnu';
            const skillElements = apprenant.competences.map(skillId => {
                const skillName = competencesDict[skillId] || 'Inconnu';
                return `<span class="skill skill-default">${skillName}</span>`;
            });

            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">
                        <h2 class="name">${apprenant.nom} ${apprenant.prenom}</h2>
                        <img class="profile-pic" src="${apprenant.image}" alt="Image de ${apprenant.nom}" />
                        <p class="promo">Promo: ${promoName}</p>
                        <div class="skills">${skillElements.join('')}</div>
                    </div>
                </div>
                <br>
                <div class="links">
                    <a href="${apprenant.urlgit}" target="_blank"><img src="./logo/Github.png"></a>
                    <a href="${apprenant.linkedin}" target="_blank"><img src="./logo/linkedin.png"></a>
                    <a href="${apprenant.cv}" target="_blank"><img src="./logo/cv.png"></a>
                    <a href="${apprenant.portfolio}" target="_blank"><img src="./logo/portfolio.png"></a>
                </div>
                <div>
                    <p class="excerpt">${apprenant.excerpt.rendered}</p>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function filterApprenants(promotionsDict, competencesDict) {
        console.log('Filtrage des apprenants en cours...');
        const nameQuery = searchName.value.toLowerCase();
        const promoQuery = searchPromo.value;  // Récupérer la valeur du select
        const selectedSkills = Array.from(document.querySelectorAll('.competence-checkbox:checked'))
            .map(cb => parseInt(cb.value));

        const filteredApprenants = allApprenants.filter(apprenant => {
            const promoId = apprenant.promotions[0];
            const promoName = promotionsDict[promoId] || '';
            const name = `${apprenant.nom} ${apprenant.prenom}`.toLowerCase();
            const hasSelectedSkills = selectedSkills.every(skillId => apprenant.competences.includes(skillId));

            return (
                name.includes(nameQuery) &&
                (promoQuery === '' || promoId == promoQuery) &&  // Vérification de la promo sélectionnée
                (selectedSkills.length === 0 || hasSelectedSkills)
            );
        });

        console.log(`Nombre d'apprenants après filtrage: ${filteredApprenants.length}`);
        displayApprenants(filteredApprenants, promotionsDict, competencesDict);
    }
});