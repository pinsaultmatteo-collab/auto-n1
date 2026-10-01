# AUTO N°1 — Refonte du site vitrine (maquette haute fidélité)

Maquette fonctionnelle du nouveau site auton1.net, réalisée par PMC Marketing pour convaincre le prospect AUTO N°1 (Wimereux). Site statique, sans dépendance réseau : polices, Three.js et GSAP sont embarqués.

## Ouvrir la démo

- **Le plus simple** : double-cliquer sur `Ouvrir-le-site.command` (lance un petit serveur local et ouvre le navigateur).
- Ou : `cd site && python3 -m http.server 8790` puis http://localhost:8790
- Ouvrir directement `site/index.html` fonctionne aussi (tout est en fichiers locaux).

## Structure

```
site/                      ← livrable (à ouvrir / à héberger)
  index.html               Accueil (hero 3D, transformation 3D scrollée, 4 aménagements, promesse, processus, véhicules, avis, stock, manifeste, CTA)
  amenagements/            4 pages « usage » (cabine approfondie, toit relevable, 4x4, sur mesure) avec SVG interactifs
  vehicules/               Ford Transit Custom, VW Transporter, page véhicule × aménagement avec configurateur 3D
  entreprise.html          Chiffres, historique, dirigeant, valeurs, showroom, références
  stock.html               Stock & arrivages avec filtres
  contact.html             Formulaire devis 24h, coordonnées, plan d'accès
  mentions-legales.html · politique-confidentialite.html
  sitemap.xml · robots.txt
  assets/css/main.css      Design system complet (tokens, composants, responsive)
  assets/js/van3d.js       Fourgon 3D procédural (Three.js) : sièges 2/5/7, toit relevable, rayons X, 4x4, couleur
  assets/js/main.js        Navigation, animations au scroll, compteurs, configurateur, filtres, formulaires (démo)
  assets/img/              64 photos réelles issues du site actuel (renommées, optimisées) + logos
  assets/fonts/            Barlow Condensed + Manrope (woff2 locaux)
  assets/vendor/           three.min.js r158, gsap 3.12.5, ScrollTrigger

src/                       ← sources : partials (head, nav, footer) + pages ; `python3 build.py` régénère site/ (empreinte ?v= ajoutée aux CSS/JS pour invalider le cache)
contexte/                  ← fiche de référence, cahier des charges, pré-maquette
```

## Points à valider avec le client avant publication

- Témoignages clients : textes illustratifs, à remplacer par le widget Google Business Profile (265 avis réels).
- Portrait du dirigeant intégré (accueil et page L'entreprise). Photos d'équipe et d'atelier : shooting à planifier.
- Horaires exacts (ouverture 8h45 confirmée, fermeture et samedi à confirmer) et numéro unique (03 21 33 63 96 retenu).
- Mentions fiscales (TVA récupérable, exonération de la taxe sur les véhicules de société) : à valider par écrit par le client.
- Prix : seul le Transit Custom Sport SPECIPRO à 55 900 € HT et les 4 options proviennent du site actuel ; les autres configurations sont « sur devis ».
- Stock : 4 véhicules réels du site actuel + 3 « arrivages » illustratifs ; brancher le flux réel (saisie CMS ou Leboncoin) en phase de développement.
- Mentions légales : hébergeur et n° de TVA intracommunautaire à compléter.
- Dimensions indicatives (L2H1 5 450 mm, 1 990 mm, longueurs de chargement) : à vérifier sur fiche constructeur.
