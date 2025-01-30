document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('apprenants-container');
  const searchName = document.getElementById('search-name');
  const searchPromo = document.getElementById('search-promo');
  const filterSkillsContainer = document.getElementById('filter-skills'); // Conteneur des cases à cocher

  let allApprenants = [];

  // Récupérer les données des promotions
  fetch('http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/promotions')
    .then(res => res.json())
    .then(promotions => {
      // Création d'un dictionnaire pour les promotions
      const promotionsDict = {};
      promotions.forEach(promo => {
        promotionsDict[promo.id] = promo.slug;
      });

      // Récupérer les données des compétences
      fetch('http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/competences')
        .then(res => res.json())
        .then(competences => {
          // Création d'un dictionnaire pour les compétences
          const competencesDict = {};
          competences.forEach(skill => {
            competencesDict[skill.id] = skill.name;

            // Créer une case à cocher pour chaque compétence
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `skill-${skill.id}`;
            checkbox.value = skill.id;

            const label = document.createElement('label');
            label.setAttribute('for', `skill-${skill.id}`);
            label.textContent = skill.name;

            const checkboxContainer = document.createElement('div');
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(label);
            filterSkillsContainer.appendChild(checkboxContainer);
          });

          // Ajouter l'événement de filtrage pour chaque checkbox
          filterSkillsContainer.addEventListener('change', () => filterApprenants(promotionsDict, competencesDict));
        })
        .catch(err => console.error('Erreur:', err)); // Gestion des erreurs pour les compétences

      // Récupérer les données des apprenants
      fetch('http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/apprenants?per_page=100')
        .then(res => res.json())
        .then(apprenants => {
          allApprenants = apprenants;

          // Affichage initial des apprenants
          displayApprenants(apprenants, promotionsDict, competencesDict);

          // Filtrage en fonction des recherches
          searchName.addEventListener('input', () => filterApprenants(promotionsDict, competencesDict));
          searchPromo.addEventListener('input', () => filterApprenants(promotionsDict, competencesDict));
        })
        .catch(err => console.error('Erreur:', err)); // Gestion des erreurs pour les apprenants
    })
    .catch(err => console.error('Erreur:', err)); // Gestion des erreurs pour les promotions

  // Fonction pour afficher les apprenants
  function displayApprenants(apprenants, promotionsDict, competencesDict) {
    container.innerHTML = ''; // Vider le conteneur avant d'ajouter les nouveaux éléments

    apprenants.forEach(apprenant => {
      // Récupérer le nom de la promotion
      const promoId = apprenant.promotions[0];
      const promoName = promotionsDict[promoId] || 'Inconnu';

      // Récupérer les compétences
      const skillElements = apprenant.competences.map(skillId => {
        const skillName = competencesDict[skillId] || 'Inconnu';
        let colorClass = 'skill-default'; // Vous pouvez ajouter de la logique ici pour changer les couleurs
        return `<span class="skill ${colorClass}">${skillName}</span>`;
      });

      // Créer la carte de l'apprenant
      const card = document.createElement('div');
      card.className = 'card';

      // Remplir la carte avec les données de l'apprenant
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

      // Ajouter la carte au conteneur
      container.appendChild(card);
    });
  }

  // Fonction de filtrage des apprenants
  function filterApprenants(promotionsDict, competencesDict) {
    const nameQuery = searchName.value.toLowerCase();
    const promoQuery = searchPromo.value.toLowerCase();

    // Récupérer les compétences sélectionnées (cases à cocher)
    const selectedSkills = Array.from(document.querySelectorAll('#filter-skills input[type="checkbox"]:checked'))
      .map(checkbox => checkbox.value);

    const filteredApprenants = allApprenants.filter(apprenant => {
      const promoId = apprenant.promotions[0];
      const promoName = promotionsDict[promoId] || '';
      const skills = apprenant.competences.map(skillId => competencesDict[skillId] || '').join(' ').toLowerCase();
      const name = `${apprenant.nom} ${apprenant.prenom}`.toLowerCase();

      // Vérifier si l'apprenant a toutes les compétences sélectionnées
      const matchesSkills = selectedSkills.every(skillId => apprenant.competences.includes(parseInt(skillId)));

      return (
        name.includes(nameQuery) &&
        promoName.toLowerCase().includes(promoQuery) &&
        matchesSkills
      );
    });

    // Afficher les apprenants filtrés
    displayApprenants(filteredApprenants, promotionsDict, competencesDict);
  }
});
