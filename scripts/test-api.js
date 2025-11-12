// Script de test pour l'API Football
// Usage : node scripts/test-api.js

const API_KEY = process.env.FOOTBALL_API_KEY || 'ea7cf698d95a9b99c3f9ea9d5b16fb05';
const BAYERN_TEAM_ID = 157;

async function testAPI() {
  console.log('🔍 Test de connexion API Football...\n');

  try {
    // Test 1 : Récupération des matchs de la saison en cours
    const currentYear = new Date().getFullYear();
    const season = new Date().getMonth() >= 7 ? currentYear : currentYear - 1;

    console.log(`📊 Test 1 : Récupération des matchs saison ${season}-${season+1}...`);
    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?team=${BAYERN_TEAM_ID}&season=${season}`,
      {
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': 'v3.football.api-sports.io',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error('❌ Erreur API:', data.errors);
      console.log('\n⚠️  Vérifiez que :');
      console.log('   1. Votre clé API est valide');
      console.log('   2. Votre abonnement est actif');
      console.log('   3. Vous n\'avez pas dépassé votre quota');
      return;
    }

    console.log(`✅ API connectée avec succès!`);
    console.log(`📈 Matchs récupérés: ${data.response.length}`);
    console.log(`🔢 Requêtes API restantes aujourd'hui: ${response.headers.get('x-ratelimit-requests-remaining') || 'N/A'}\n`);

    if (data.response.length > 0) {
      // Trouver le dernier match terminé
      const finishedMatches = data.response
        .filter(m => ['FT', 'AET', 'PEN'].includes(m.fixture.status.short))
        .sort((a, b) => new Date(b.fixture.date) - new Date(a.fixture.date));

      if (finishedMatches.length > 0) {
        console.log('🎯 Dernier match terminé:');
        const lastMatch = finishedMatches[0];
        console.log(`   ${lastMatch.teams.home.name} ${lastMatch.goals.home} - ${lastMatch.goals.away} ${lastMatch.teams.away.name}`);
        console.log(`   ${lastMatch.league.name}`);
        console.log(`   ${new Date(lastMatch.fixture.date).toLocaleDateString('fr-FR')}\n`);
      }
    }

    // Test 2 : Matchs à venir
    console.log('📊 Test 2 : Récupération des prochains matchs...');
    const upcomingResponse = await fetch(
      `https://v3.football.api-sports.io/fixtures?team=${BAYERN_TEAM_ID}&next=3`,
      {
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': 'v3.football.api-sports.io',
        },
      }
    );

    const upcomingData = await upcomingResponse.json();
    console.log(`✅ Prochains matchs: ${upcomingData.response.length}\n`);

    if (upcomingData.response.length > 0) {
      console.log('📅 Prochain match:');
      const nextMatch = upcomingData.response[0];
      console.log(`   ${nextMatch.teams.home.name} vs ${nextMatch.teams.away.name}`);
      console.log(`   ${nextMatch.league.name}`);
      console.log(`   ${new Date(nextMatch.fixture.date).toLocaleDateString('fr-FR')} à ${new Date(nextMatch.fixture.date).toLocaleTimeString('fr-FR')}\n`);
    }

    console.log('✨ Tous les tests sont passés avec succès!');
    console.log('🚀 Vous pouvez maintenant utiliser l\'API dans votre application.\n');

    console.log('⚠️  IMPORTANT : N\'oubliez pas de régénérer votre clé API !');
    console.log('   👉 https://dashboard.api-football.com/\n');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.log('\n🔧 Solutions possibles:');
    console.log('   1. Vérifiez votre connexion internet');
    console.log('   2. Vérifiez que la clé API est correcte dans .env.local');
    console.log('   3. Redémarrez le serveur après modification de .env.local');
    console.log('   4. Consultez https://www.api-football.com/documentation-v3\n');
  }
}

testAPI();
