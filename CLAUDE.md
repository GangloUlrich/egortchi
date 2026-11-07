# CLAUDE.md — Courant (nom de travail)

PWA communautaire de signalement des coupures d'électricité en temps réel, entre Cotonou et Abomey-Calavi (Bénin).

## Le concept

- L'utilisateur signale en **un tap** : « Coupure » ou « Le courant est là ».
- Sa position est récupérée automatiquement (Geolocation API) et rattachée à une **zone** (quartier / hexagone).
- Une **carte interactive** montre en temps réel l'état de chaque zone : 💡 allumé ou 💡 cassé.
- Les utilisateurs abonnés à une zone reçoivent une **notification push** quand son état change.

**Principe directeur : la spontanéité.** Chaque interaction doit tenir en un geste. Pas de formulaire, pas de compte obligatoire pour signaler, pas d'étape inutile.

## Stack

| Couche | Choix |
|---|---|
| Frontend | Nuxt 4 (SPA, `ssr: false`) + TypeScript |
| PWA | `@vite-pwa/nuxt` (manifest, service worker, installable) |
| Carte | Leaflet via `@vue-leaflet/vue-leaflet`, tuiles OpenStreetMap |
| Icônes | Lucide (`lightbulb`, `lightbulb-off`) |
| Backend | Supabase : Postgres + PostGIS, Realtime, Edge Functions |
| Zones | Grille H3 (résolution 8 ou 9) ou polygones de quartiers |
| Push | Web Push (VAPID), envoyé depuis une Edge Function |
| Auth | Anonyme par défaut (Supabase anonymous sign-in), compte optionnel |
| Style | Tailwind CSS |

## UI / CTA

Deux boutons principaux, toujours visibles, en bas de l'écran (zone du pouce) :

- **« Coupure »** : rouge (`bg-red-600`, hover `bg-red-700`), icône `lightbulb-off`
- **« Le courant est là »** : vert (`bg-green-600`, hover `bg-green-700`), icône `lightbulb`

Règles :
- Boutons larges (min. 56px de haut), lisibles en plein soleil, contraste AA minimum.
- Feedback immédiat après tap : vibration (`navigator.vibrate`), toast de confirmation, mise à jour optimiste de la carte.
- Anti-double tap : un signalement par utilisateur, par quartier (secteur si géolocalisé) et par statut toutes les 10 minutes — un utilisateur peut signaler une coupure et un retour de courant dans plusieurs quartiers différents, et changer de statut dans un même quartier sans attendre le cooldown de l'autre statut.
- Si la géolocalisation est refusée, proposer de choisir le quartier dans une liste (fallback).

### Carte

- Centrée par défaut sur l'axe Cotonou ↔ Abomey-Calavi (≈ `6.40, 2.36`, zoom 12).
- **Une icône par zone, pas par signalement.** Les signalements sont agrégés.
- Zone **avec courant** : icône jaune/vert, hexagone teinté vert léger.
- Zone **en coupure** : icône grise/rouge, hexagone teinté rouge léger.
- Zone **inconnue / données périmées** : gris neutre, pas d'icône.
- Popup au clic : nom de la zone, état, nombre de signalements récents, « depuis X min ».

## Logique métier

### Calcul de l'état d'une zone
- Ne compter que les signalements des **60 dernières minutes**.
- Pondérer par fraîcheur (un signalement de 5 min pèse plus qu'un de 50 min).
- Un état n'est affiché que si le **seuil de confiance** est atteint (ex. ≥ 3 signalements concordants, ou majorité nette).
- Sans signalement récent, la zone repasse en « inconnue ».
- Calcul côté Postgres (vue ou fonction SQL), pas côté client.

### Anti-abus
- Rate limiting par utilisateur (RLS + contrainte temporelle).
- Rejeter les positions hors de la bbox Cotonou / Calavi (pour le MVP).
- Ignorer une précision GPS trop faible (`accuracy > 1000m`).

### Notifications
- L'utilisateur **choisit ses zones** (maison, bureau, campus). Jamais de notification globale.
- Notifier uniquement sur **changement d'état confirmé**, pas à chaque signalement.
- Cooldown par zone (pas plus d'une notif / 15 min par zone et par utilisateur).
- Exemples de messages : « ⚡ Le courant est revenu à Fidjrossè », « 🔌 Coupure signalée à Godomey ».

## Modèle de données (indicatif)

```sql
-- zones
id text primary key        -- index H3 ou slug du quartier
name text
geom geography(Polygon)

-- reports
id uuid primary key default gen_random_uuid()
user_id uuid references auth.users
zone_id text references zones          -- secteur/arrondissement affiché sur la carte
quartier_id text                       -- quartier précis si connu (sélection manuelle), nul si géolocalisé
status text check (status in ('outage','power'))
location geography(Point)
accuracy real
created_at timestamptz default now()

-- zone_status (vue ou table matérialisée mise à jour par trigger)
zone_id, status ('outage'|'power'|'unknown'), confidence real, reports_count int, updated_at

-- subscriptions
user_id uuid, zone_id text, push_endpoint jsonb, created_at
```

Toutes les tables ont la **RLS activée**. Lecture publique de `zone_status`, écriture de `reports` réservée à l'utilisateur authentifié (anonyme compris).

## Structure du projet

```
app/
  components/
    map/PowerMap.vue
    map/ZoneMarker.vue
    report/ReportButtons.vue
  composables/
    useGeolocation.ts
    useReports.ts
    useZoneStatus.ts      # abonnement Supabase Realtime
    usePushSubscription.ts
  pages/
    index.vue             # carte + CTA
    zones.vue             # gestion des abonnements
supabase/
  migrations/
  functions/
    notify-zone-change/
```

## Conventions

- Composition API + `<script setup lang="ts">` uniquement.
- Composables pour toute logique réutilisable ; les composants restent fins.
- Textes de l'interface **en français**, ton simple et direct.
- Mobile-first : tester d'abord à 360px de large, connexion 3G lente.
- Leaflet chargé côté client uniquement (`<ClientOnly>`).
- Pas de secret dans le code : variables via `.env` / `runtimeConfig`.
- Toute modification de schéma passe par une migration dans `supabase/migrations/`.

## Contraintes terrain

- Pendant une coupure, les gens sont sur **données mobiles** : bundle léger, tuiles mises en cache, pas d'assets lourds.
- Batterie souvent faible : pas de géolocalisation en continu, uniquement au moment du signalement.
- La carte doit rester consultable hors ligne (dernier état connu + horodatage visible).

## Hors scope MVP

- Prévisions de coupure, historique détaillé, statistiques.
- Couverture hors Cotonou / Calavi.
- Application native (envisager Capacitor plus tard, notamment pour un widget « signaler » sur l'écran d'accueil).
