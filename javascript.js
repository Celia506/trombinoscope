document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé, début du script');

    const container = document.getElementById('apprenants-container');
    const searchName = document.getElementById('search-name');
    const searchPromo = document.getElementById('search-promo');
    const competencesContainer = document.getElementById('competences-filters');

    let allApprenants = [];

    // Récupérer les données des promotions
    fetch('http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/promotions')
        .then(res => res.json())
        .then(promotions => {
            console.log('Données des promotions récupérées:', promotions);
            const promotionsDict = {};
            promotions.forEach(promo => promotionsDict[promo.id] = promo.slug);

            // Récupérer les données des compétences
            fetch('http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/competences')
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
                    fetch('http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/apprenants?per_page=100')
                        .then(res => res.json())
                        .then(apprenants => {
                            console.log('Données des apprenants récupérées:', apprenants);
                            allApprenants = apprenants;
                            displayApprenants(apprenants, promotionsDict, competencesDict);

                            // Filtrage en fonction des recherches
                            searchName.addEventListener('input', () => filterApprenants(promotionsDict, competencesDict));
                            searchPromo.addEventListener('input', () => filterApprenants(promotionsDict, competencesDict));
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
        `;
            container.appendChild(card);
        });
    }

    function filterApprenants(promotionsDict, competencesDict) {
        console.log('Filtrage des apprenants en cours...');
        const nameQuery = searchName.value.toLowerCase();
        const promoQuery = searchPromo.value.toLowerCase();
        const selectedSkills = Array.from(document.querySelectorAll('.competence-checkbox:checked'))
            .map(cb => parseInt(cb.value));

        const filteredApprenants = allApprenants.filter(apprenant => {
            const promoId = apprenant.promotions[0];
            const promoName = promotionsDict[promoId] || '';
            const name = `${apprenant.nom} ${apprenant.prenom}`.toLowerCase();
            const hasSelectedSkills = selectedSkills.every(skillId => apprenant.competences.includes(skillId));

            return (
                name.includes(nameQuery) &&
                promoName.toLowerCase().includes(promoQuery) &&
                (selectedSkills.length === 0 || hasSelectedSkills)
            );
        });

        console.log(`Nombre d'apprenants après filtrage: ${filteredApprenants.length}`);
        displayApprenants(filteredApprenants, promotionsDict, competencesDict);
    }
});
