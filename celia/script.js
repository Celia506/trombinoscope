fetch('http://portfolios.ruki5964.odns.fr/wp-json/wp/v2/apprenants?per_page=100')

    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données');
        }
        return response.json();
    })
    .then(data => {
        console.log(data)
        const trombinoscope = document.getElementById('trombinoscope');
        const searchInput = document.getElementById('search');
        const competenceFilter = document.getElementById('competenceFilter');
        const promotionFilter = document.getElementById('promotionFilter');

        // Fonction pour afficher les apprenants
        function afficherApprenants(filteredData) {
            trombinoscope.innerHTML = ''; // Clear existing content
            filteredData.forEach(apprenant => {
                const card = document.createElement('div');
                card.className = 'card';

                card.innerHTML = `
                    <img src="${apprenant.image}" alt="Photo de l'apprenant">
                    <h3>${apprenant.nom} ${apprenant.prenom}</h3>
                    <ul><li>${apprenant.competences}</li></ul>
                    <p>Promotion n° ${apprenant.promotions}</p>
                    <a href="${apprenant.portfolio}" target="_blank">lien portfolio</a>
                    <a href="${apprenant.urlgit}" target="_blank">lien Github</a>
                `;
                trombinoscope.appendChild(card);
            });
        }

        // Fonction pour filtrer les apprenants en fonction des critères
        function filtrerApprenants() {
            const searchTerm = searchInput.value.toLowerCase();
            const competenceTerm = competenceFilter.value;
            const promotionTerm = promotionFilter.value;

            const filteredData = data.filter(apprenant => {
                const matchName = apprenant.nom.toLowerCase().includes(searchTerm) || apprenant.prenom.toLowerCase().includes(searchTerm);
                const matchCompetence = competenceTerm ? apprenant.competences.toLowerCase().includes(competenceTerm.toLowerCase()) : true;
                const matchPromotion = promotionTerm ? apprenant.promotions == promotionTerm : true;
                return matchName && matchCompetence && matchPromotion;
            });

            afficherApprenants(filteredData);
        }

        // Affichage initial de tous les apprenants
        afficherApprenants(data);

        // Ajout des écouteurs d'événements pour les filtres
        searchInput.addEventListener('input', filtrerApprenants);
        competenceFilter.addEventListener('change', filtrerApprenants);
        promotionFilter.addEventListener('change', filtrerApprenants);
    })
    .catch(error => {
        console.error('Il y a eu un problème avec la requête :', error);
    });


let debounceTimer;
searchInput.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(filtrerApprenants, 300); // Attend 300ms après la dernière saisie
});