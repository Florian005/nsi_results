import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Copiez les mêmes URL/KEY que dans `script.js` (attention à la sécurité des clés)
const supabaseUrl = 'https://hzrmxqqdkeyhfwxtcfwf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cm14cXFka2V5aGZ3eHRjZndmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTEyNjEsImV4cCI6MjA4MDYyNzI2MX0.OgSkI27XXexWxNUpxq33klPFSNOY7Gf1SPKnpeYs9WQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Sélecteurs
const totalCountEl = document.getElementById('totalCount');
const c1CountEl = document.getElementById('c1Count');
const c2CountEl = document.getElementById('c2Count');
const c3CountEl = document.getElementById('c3Count');
const c4CountEl = document.getElementById('c4Count');

const bar1 = document.getElementById('bar1');
const bar2 = document.getElementById('bar2');
const bar3 = document.getElementById('bar3');
const bar4 = document.getElementById('bar4');

const responsesBody = document.getElementById('responsesBody');
const resultsMessage = document.getElementById('resultsMessage');
const refreshBtn = document.getElementById('refreshResults');

async function fetchResults() {
    resultsMessage.textContent = 'Chargement...';
    try {
        // Premier essai : trier par `created_at` si la colonne existe
        let data, error;
        let res = await supabase
            .from('NSI_formulaire')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200);

        // Si la table n'a pas la colonne `created_at`, retenter sans tri
        if (res.error && /created_at.*does not exist/i.test(res.error.message || '')) {
            console.warn('created_at absent : retente la requête sans tri.', res.error.message);
            res = await supabase
                .from('NSI_formulaire')
                .select('*')
                .limit(200);
        }

        if (res.error) throw res.error;
        const rows = res.data || [];
        const total = rows.length;

        if (total === 0) {
            totalCountEl.textContent = '0';
            c1CountEl.textContent = '0';
            c2CountEl.textContent = '0';
            c3CountEl.textContent = '0';
            c4CountEl.textContent = '0';
            setBar(bar1, 0);
            setBar(bar2, 0);
            setBar(bar3, 0);
            setBar(bar4, 0);
            resultsMessage.textContent = 'Aucune réponse pour le moment.';
            return;
        }

        const c1 = rows.filter(r => r.choice_1).length;
        const c2 = rows.filter(r => r.choice_2).length;
        const c3 = rows.filter(r => r.choice_3).length;
        const c4 = rows.filter(r => r.choice_4).length;

        totalCountEl.textContent = total;
        c1CountEl.textContent = c1;
        c2CountEl.textContent = c2;
        c3CountEl.textContent = c3;
        c4CountEl.textContent = c4;

        setBar(bar1, (c1/total)*100);
        setBar(bar2, (c2/total)*100);
        setBar(bar3, (c3/total)*100);
        setBar(bar4, (c4/total)*100);

        resultsMessage.textContent = `${total} réponse${total > 1 ? 's' : ''}.`;

    } catch (err) {
        console.error('Erreur en récupérant les résultats :', err);
        // Affiche plus d'informations d'erreur dans l'interface pour aider au débogage
        const message = err && (err.message || err.error || JSON.stringify(err)) || 'Erreur inconnue';
        resultsMessage.textContent = 'Erreur lors du chargement des résultats : ' + message;
    }
}

function setBar(el, percent) {
    const p = isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
    el.style.width = p + '%';
}

function escapeHTML(s) {
    return String(s)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

refreshBtn.addEventListener('click', () => fetchResults());

// Chargement initial
fetchResults();


