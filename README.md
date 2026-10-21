# AUTO N°1 — Refonte du site vitrine (maquette haute fidélité)

Maquette fonctionnelle du nouveau site auton1.net, réalisée par PMC Marketing pour convaincre le prospect AUTO N°1 (Wimereux). Site statique, sans dépendance réseau : polices et GSAP sont embarqués.

## Ouvrir la démo

- **Le plus simple** : double-cliquer sur `Ouvrir-le-site.command` (lance un petit serveur local et ouvre le navigateur).
- Ou : `cd site && python3 -m http.server 8790` puis http://localhost:8790
- Ouvrir directement `site/index.html` fonctionne aussi (tout est en fichiers locaux).

## Charte graphique (v1.0, octobre 2026)

Le site applique la nouvelle charte livrée au client (`charte-graphique/nouvelle-charte/`, hors dépôt) :

- **Couleurs** : anthracite `#17191C` (55 %), craie `#F5F3EF` et blanc (35 %), rouge N°1 `#C8102E` (10 %, boutons, chiffres clés, losange). Neutres : graphite `#3B4048`, acier `#5B5F66`, béton `#CFCBC3`. Le rouge n'est jamais du texte sur anthracite.
- **Typographie** : Archivo uniquement (variable, embarquée dans `assets/fonts/`). Titres ExtraBold chasse 85 %, chiffres clés ExtraBold chasse 75 %, étiquettes SemiBold capitales 13 px espacées. Pas de capitales criées, pas de point d'exclamation.
- **Éléments** : coupe à 45° en haut à droite (boutons, photos, panneaux), joints clairs de 3 px entre les tuiles, trame isométrique ton sur ton sur anthracite, losange rouge « la marche » en puce et repère.
- **Logo** : fichiers maîtres SVG dans `assets/brand/` (horizontal couleur en navigation, horizontal avec baseline négatif en pied de page, bloc pour les cartouches, bloc réduit pour favicon et préchargeur). Le nom n'est jamais retapé dans une police.
- **Pictogrammes** : sprite SVG dans la navigation (grille 48, trait 2,5, un détail rouge) : sourcing, aménagement, homologation, financement, livraison, garantie, cabine, toit, 4x4, sur mesure.

## Structure

```
site/                      ← livrable (à ouvrir / à héberger)
  index.html               Accueil (hero plan isométrique, accompagnement, transformation Lundi→Dimanche en plan, 4 aménagements, promesse, processus, véhicules, avis, stock, manifeste, CTA)
  amenagements/            4 pages « usage » (cabine approfondie, toit relevable, 4x4, sur mesure) avec SVG interactifs
  vehicules/               Ford Transit Custom, VW Transporter, page véhicule × aménagement avec configurateur (plan coloré)
  entreprise.html          Chiffres, historique, dirigeant, valeurs, showroom, références
  stock.html               Stock & arrivages avec filtres
  contact.html             Formulaire devis 24h, coordonnées, plan d'accès
  mentions-legales.html · politique-confidentialite.html
  sitemap.xml · robots.txt
  assets/css/main.css      Design system complet (tokens, composants, responsive)
  src/tools/hero_plan.py   Générateur des plans isométriques (hero, Lundi→Dimanche, configurateur) : relancer puis build.py après modification
  assets/js/main.js        Navigation, animations au scroll, compteurs, configurateur, filtres, formulaires (démo)
  assets/img/              64 photos réelles issues du site actuel (renommées, optimisées)
  assets/brand/            logos SVG de la nouvelle charte + kit favicon
  assets/fonts/            Archivo variable (woff2 locaux)
  assets/vendor/           gsap 3.12.5, ScrollTrigger

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
- Dimensions : bloc « Dimensions & volumes » en place sur la page Ford Transit Custom (plan isométrique à trois configurations + deux tableaux). Les cellules « à confirmer » attendent le tableau Excel des cotes (équipements pliés / dépliés, L1 / L2, toit relevable) que le client prépare ; les cotes extérieures affichées sont des données constructeur à vérifier.
- Carte « Partout en France » (accueil) : 327 points clients relevés sur la carte Leboncoin fournie par le client (positions approximatives, 85 départements). Point de vente Paris : adresse et modalités exactes à préciser par le client (affiché « sur rendez-vous »).
- Showroom : les véhicules sont visibles uniquement sur rendez-vous (le dirigeant n'est pas toujours à l'agence). Mention reprise dans le hero, l'encart des réalisations, la page Stock, le pied de page et la page Contact.
- Galeries « Nos réalisations » : 11 véhicules avec slider photo, montés avec les photos du Drive du client (`site/assets/img/drive/`, exportées depuis `contexte/photos-drive/`). Le Transit Custom MS-RT (vitrine atelier, hors stock) ouvre la grille en carte double largeur. Intitulés et équipements déduits des photos : à faire relire par le client.
- Blog : page `blog.html` + 4 articles dans `blog/` (TVA / carte grise CTTE, toit relevable, Transit Custom vs Transporter T7, fourgon 7 places pour artisan), avec données structurées BlogPosting / FAQPage / BreadcrumbList. Les affirmations fiscales et techniques sont à faire relire par le client (et son expert-comptable pour l'article TVA) avant publication.
- Carte d'accès (page Contact) : Leaflet chargé depuis unpkg + tuiles OpenStreetMap assombries en CSS. Pour un site en production à fort trafic, prévoir un fournisseur de tuiles avec clé (MapTiler, Stadia) et le mentionner dans la politique de confidentialité.
- Page « Accessoires » : demandée par le client pour plus tard, non construite. Prévoir une entrée de menu et une page `accessoires.html` (grille produits + demande de devis).
