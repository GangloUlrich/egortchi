export interface Zone {
  id: string
  name: string
  lat: number
  lng: number
  /** Rayon approximatif de la zone, en mètres (pour le rendu sur la carte) */
  radius: number
}

/** `mixed` : le secteur a à la fois des quartiers en coupure et des quartiers où le courant est revenu. */
export type ZoneState = 'power' | 'outage' | 'unknown' | 'mixed'

export interface ZoneStatusEntry {
  zoneId: string
  status: ZoneState
  confidence: number
  reportsCount: number
  updatedAt: string | null
  /** Quartiers confirmés en coupure (vide si aucun, ou signalements géolocalisés sans quartier connu). */
  outageQuartierIds: string[]
  /** Quartiers confirmés avec le courant (vide si aucun, ou signalements géolocalisés sans quartier connu). */
  powerQuartierIds: string[]
}

interface DemoReport {
  zoneId: string
  status: 'power' | 'outage'
  quartierId: string | null
  createdAt: number
}

/**
 * Secteurs de signalement (une icône par secteur sur la carte, cf. CLAUDE.md).
 * Ce sont les arrondissements officiels de Cotonou et les sections
 * communales d'Abomey-Calavi, géocodés via OpenStreetMap/Nominatim.
 */
export const ZONES: Zone[] = [
  { id: '1er-arrondissement', name: '1er Arrondissement', lat: 6.3679365, lng: 2.4776425, radius: 1300 },
  { id: '2e-arrondissement', name: '2e Arrondissement', lat: 6.3837586, lng: 2.4668064, radius: 1300 },
  { id: '3e-arrondissement', name: '3e Arrondissement', lat: 6.381515, lng: 2.4440437, radius: 1300 },
  { id: '4e-arrondissement', name: '4e Arrondissement', lat: 6.3629545, lng: 2.4512569, radius: 1300 },
  { id: '5e-arrondissement', name: '5e Arrondissement', lat: 6.3539705, lng: 2.4303984, radius: 1300 },
  { id: '6e-arrondissement', name: '6e Arrondissement', lat: 6.3809254, lng: 2.4238074, radius: 1300 },
  { id: '7e-arrondissement', name: '7e Arrondissement', lat: 6.3701637, lng: 2.4193839, radius: 1300 },
  { id: '8e-arrondissement', name: '8e Arrondissement', lat: 6.3781607, lng: 2.4079647, radius: 1300 },
  { id: '9e-arrondissement', name: '9e Arrondissement', lat: 6.3912755, lng: 2.3859534, radius: 1300 },
  { id: '10e-arrondissement', name: '10e Arrondissement', lat: 6.3840079, lng: 2.3924921, radius: 1300 },
  { id: '11e-arrondissement', name: '11e Arrondissement', lat: 6.3671755, lng: 2.4095618, radius: 1300 },
  { id: '12e-arrondissement', name: '12e Arrondissement', lat: 6.3614375, lng: 2.3994, radius: 1300 },
  { id: '13e-arrondissement', name: '13e Arrondissement', lat: 6.375472, lng: 2.3692293, radius: 1300 },
  { id: 'abomey-calavi-centre', name: 'Abomey-Calavi Centre', lat: 6.4538637, lng: 2.354245, radius: 1600 },
  { id: 'godomey', name: 'Godomey', lat: 6.3854438, lng: 2.3432407, radius: 1600 },
  { id: 'akassato', name: 'Akassato', lat: 6.5073708, lng: 2.365643, radius: 1600 },
  { id: 'glo-djigbe', name: 'Glo-Djigbé', lat: 6.5592571, lng: 2.3032531, radius: 1800 },
  { id: 'hevie', name: 'Hévié', lat: 6.4138647, lng: 2.2571111, radius: 1600 },
  { id: 'kpanroun', name: 'Kpanroun', lat: 6.6739449, lng: 2.3667316, radius: 1800 },
  { id: 'ouedo', name: 'Ouèdo', lat: 6.4524367, lng: 2.2670915, radius: 1600 },
  { id: 'togba', name: 'Togba', lat: 6.4651364, lng: 2.3048643, radius: 1600 },
  { id: 'zinvie', name: 'Zinvié', lat: 6.6133818, lng: 2.3567957, radius: 1800 },
]

export interface Quartier {
  id: string
  name: string
  /** Secteur (zone de signalement) auquel rattacher ce quartier. */
  secteurId: string
}

/**
 * Quartiers / sous-quartiers officiels, rattachés à leur secteur. Utilisés
 * uniquement côté filtre/sélecteur (pas de marqueur ni de géocodage
 * individuel) : un signalement sur un quartier compte pour son secteur.
 */
export const QUARTIERS: Quartier[] = [
  { id: '1er-arrondissement--avotrou-aimonlonfide', name: 'Avotrou Aimonlonfide', secteurId: '1er-arrondissement' },
  { id: '1er-arrondissement--avotrou-gbego', name: 'Avotrou Gbego', secteurId: '1er-arrondissement' },
  { id: '1er-arrondissement--avotrou-houezekome', name: 'Avotrou Houezekome', secteurId: '1er-arrondissement' },
  { id: '1er-arrondissement--dandji', name: 'Dandji', secteurId: '1er-arrondissement' },
  { id: '1er-arrondissement--dandji-hokanme', name: 'Dandji Hokanme', secteurId: '1er-arrondissement' },
  { id: '1er-arrondissement--donaten', name: 'Donaten', secteurId: '1er-arrondissement' },
  { id: '1er-arrondissement--finagnon', name: 'Finagnon', secteurId: '1er-arrondissement' },
  { id: '1er-arrondissement--nvenamede', name: 'N\'Venamede', secteurId: '1er-arrondissement' },
  { id: '1er-arrondissement--suru-lere', name: 'Suru Lere', secteurId: '1er-arrondissement' },
  { id: '1er-arrondissement--tanto', name: 'Tanto', secteurId: '1er-arrondissement' },
  { id: '1er-arrondissement--tchanhounkpame', name: 'Tchanhounkpame', secteurId: '1er-arrondissement' },
  { id: '1er-arrondissement--tokplegbe', name: 'Tokplegbe', secteurId: '1er-arrondissement' },
  { id: '1er-arrondissement--yagbe', name: 'Yagbe', secteurId: '1er-arrondissement' },
  { id: '2e-arrondissement--ahouassa', name: 'Ahouassa', secteurId: '2e-arrondissement' },
  { id: '2e-arrondissement--djedje-laye', name: 'Djedje-Laye', secteurId: '2e-arrondissement' },
  { id: '2e-arrondissement--gankpodo', name: 'Gankpodo', secteurId: '2e-arrondissement' },
  { id: '2e-arrondissement--irede', name: 'Irede', secteurId: '2e-arrondissement' },
  { id: '2e-arrondissement--kowegbo', name: 'Kowegbo', secteurId: '2e-arrondissement' },
  { id: '2e-arrondissement--kpondehou', name: 'Kpondehou', secteurId: '2e-arrondissement' },
  { id: '2e-arrondissement--kpondehou-tchemei', name: 'Kpondehou Tchemei', secteurId: '2e-arrondissement' },
  { id: '2e-arrondissement--lom-nava', name: 'Lom-Nava', secteurId: '2e-arrondissement' },
  { id: '2e-arrondissement--minontchou', name: 'Minontchou', secteurId: '2e-arrondissement' },
  { id: '2e-arrondissement--senade-sekou', name: 'Senade Sekou', secteurId: '2e-arrondissement' },
  { id: '2e-arrondissement--senande', name: 'Senande', secteurId: '2e-arrondissement' },
  { id: '2e-arrondissement--yenawa', name: 'Yenawa', secteurId: '2e-arrondissement' },
  { id: '2e-arrondissement--yenawa-daho', name: 'Yenawa Daho', secteurId: '2e-arrondissement' },
  { id: '3e-arrondissement--adjegounle', name: 'Adjegounle', secteurId: '3e-arrondissement' },
  { id: '3e-arrondissement--adogleta', name: 'Adogleta', secteurId: '3e-arrondissement' },
  { id: '3e-arrondissement--agbato', name: 'Agbato', secteurId: '3e-arrondissement' },
  { id: '3e-arrondissement--agbodjedo', name: 'Agbodjedo', secteurId: '3e-arrondissement' },
  { id: '3e-arrondissement--ayelawadje', name: 'Ayelawadje', secteurId: '3e-arrondissement' },
  { id: '3e-arrondissement--ayelawadje-agongome', name: 'Ayelawadje Agongome', secteurId: '3e-arrondissement' },
  { id: '3e-arrondissement--fifatin', name: 'Fifatin', secteurId: '3e-arrondissement' },
  { id: '3e-arrondissement--gbenonkpo', name: 'Gbenonkpo', secteurId: '3e-arrondissement' },
  { id: '3e-arrondissement--hlacomey', name: 'Hlacomey', secteurId: '3e-arrondissement' },
  { id: '3e-arrondissement--kpankpan', name: 'Kpankpan', secteurId: '3e-arrondissement' },
  { id: '3e-arrondissement--midombo', name: 'Midombo', secteurId: '3e-arrondissement' },
  { id: '3e-arrondissement--segbeya-nord', name: 'Segbeya Nord', secteurId: '3e-arrondissement' },
  { id: '3e-arrondissement--segbeya-sud', name: 'Segbeya Sud', secteurId: '3e-arrondissement' },
  { id: '4e-arrondissement--abokicodji-centre', name: 'Abokicodji Centre', secteurId: '4e-arrondissement' },
  { id: '4e-arrondissement--abokicodji-lagune', name: 'Abokicodji Lagune', secteurId: '4e-arrondissement' },
  { id: '4e-arrondissement--akpakpa-dodome', name: 'Akpakpa Dodome', secteurId: '4e-arrondissement' },
  { id: '4e-arrondissement--dedokpo', name: 'Dedokpo', secteurId: '4e-arrondissement' },
  { id: '4e-arrondissement--enagnon', name: 'Enagnon', secteurId: '4e-arrondissement' },
  { id: '4e-arrondissement--fifadji-houto', name: 'Fifadji Houto', secteurId: '4e-arrondissement' },
  { id: '4e-arrondissement--gbedjewin', name: 'Gbedjewin', secteurId: '4e-arrondissement' },
  { id: '4e-arrondissement--missessin', name: 'Missessin', secteurId: '4e-arrondissement' },
  { id: '4e-arrondissement--ohe', name: 'Ohe', secteurId: '4e-arrondissement' },
  { id: '4e-arrondissement--sodjeatinme-centre', name: 'Sodjeatinme Centre', secteurId: '4e-arrondissement' },
  { id: '4e-arrondissement--sodjeatinme-est', name: 'Sodjeatinme Est', secteurId: '4e-arrondissement' },
  { id: '4e-arrondissement--sodjeatinme-ouest', name: 'Sodjeatinme Ouest', secteurId: '4e-arrondissement' },
  { id: '5e-arrondissement--avlekete-jonquet', name: 'Avlekete Jonquet', secteurId: '5e-arrondissement' },
  { id: '5e-arrondissement--bocossi-tokpa', name: 'Bocossi Tokpa', secteurId: '5e-arrondissement' },
  { id: '5e-arrondissement--dota', name: 'Dota', secteurId: '5e-arrondissement' },
  { id: '5e-arrondissement--gbedokpo', name: 'Gbedokpo', secteurId: '5e-arrondissement' },
  { id: '5e-arrondissement--gbeto', name: 'Gbeto', secteurId: '5e-arrondissement' },
  { id: '5e-arrondissement--guinkomey', name: 'Guinkomey', secteurId: '5e-arrondissement' },
  { id: '5e-arrondissement--mifongou', name: 'Mifongou', secteurId: '5e-arrondissement' },
  { id: '5e-arrondissement--missebo', name: 'Missebo', secteurId: '5e-arrondissement' },
  { id: '5e-arrondissement--missite', name: 'Missite', secteurId: '5e-arrondissement' },
  { id: '5e-arrondissement--nouveau-pont', name: 'Nouveau Pont', secteurId: '5e-arrondissement' },
  { id: '5e-arrondissement--tokpa-hoho', name: 'Tokpa Hoho', secteurId: '5e-arrondissement' },
  { id: '5e-arrondissement--xwlacodji-kpodji', name: 'Xwlacodji Kpodji', secteurId: '5e-arrondissement' },
  { id: '5e-arrondissement--xwlacodji-plage', name: 'Xwlacodji Plage', secteurId: '5e-arrondissement' },
  { id: '5e-arrondissement--zongo-ehuzu', name: 'Zongo Ehuzu', secteurId: '5e-arrondissement' },
  { id: '5e-arrondissement--zongo-nima', name: 'Zongo Nima', secteurId: '5e-arrondissement' },
  { id: '6e-arrondissement--ahouansori-agata', name: 'Ahouansori Agata', secteurId: '6e-arrondissement' },
  { id: '6e-arrondissement--ahouansori-ague', name: 'Ahouansori Ague', secteurId: '6e-arrondissement' },
  { id: '6e-arrondissement--ahouansori-ladji', name: 'Ahouansori Ladji', secteurId: '6e-arrondissement' },
  { id: '6e-arrondissement--ahouansori-toweta', name: 'Ahouansori Toweta', secteurId: '6e-arrondissement' },
  { id: '6e-arrondissement--ahouansori-toweta-kpotai', name: 'Ahouansori Toweta Kpotai', secteurId: '6e-arrondissement' },
  { id: '6e-arrondissement--aidjedo', name: 'Aidjedo', secteurId: '6e-arrondissement' },
  { id: '6e-arrondissement--aidjedo-ahito', name: 'Aidjedo Ahito', secteurId: '6e-arrondissement' },
  { id: '6e-arrondissement--aidjedo-gbego', name: 'Aidjedo Gbego', secteurId: '6e-arrondissement' },
  { id: '6e-arrondissement--aidjedo-vignon', name: 'Aidjedo Vignon', secteurId: '6e-arrondissement' },
  { id: '6e-arrondissement--dantokpa', name: 'Dantokpa', secteurId: '6e-arrondissement' },
  { id: '6e-arrondissement--djidje', name: 'Djidje', secteurId: '6e-arrondissement' },
  { id: '6e-arrondissement--djidje-aichedji', name: 'Djidje Aichedji', secteurId: '6e-arrondissement' },
  { id: '6e-arrondissement--gbedjromede', name: 'Gbedjromede', secteurId: '6e-arrondissement' },
  { id: '6e-arrondissement--gbedjromede-sud', name: 'Gbedjromede Sud', secteurId: '6e-arrondissement' },
  { id: '6e-arrondissement--hinde-nord', name: 'Hinde Nord', secteurId: '6e-arrondissement' },
  { id: '6e-arrondissement--hinde-sud', name: 'Hinde Sud', secteurId: '6e-arrondissement' },
  { id: '6e-arrondissement--jericho-nord', name: 'Jericho Nord', secteurId: '6e-arrondissement' },
  { id: '6e-arrondissement--jericho-sud', name: 'Jericho Sud', secteurId: '6e-arrondissement' },
  { id: '6e-arrondissement--vossa', name: 'Vossa', secteurId: '6e-arrondissement' },
  { id: '7e-arrondissement--dagbedji-sike', name: 'Dagbedji Sike', secteurId: '7e-arrondissement' },
  { id: '7e-arrondissement--enagnon-sike', name: 'Enagnon-Sike', secteurId: '7e-arrondissement' },
  { id: '7e-arrondissement--fignon-sike', name: 'Fignon Sike', secteurId: '7e-arrondissement' },
  { id: '7e-arrondissement--gbedomidji', name: 'Gbedomidji', secteurId: '7e-arrondissement' },
  { id: '7e-arrondissement--gbenan', name: 'Gbenan', secteurId: '7e-arrondissement' },
  { id: '7e-arrondissement--gbewa', name: 'Gbewa', secteurId: '7e-arrondissement' },
  { id: '7e-arrondissement--missite-sike', name: 'Missite-Sike', secteurId: '7e-arrondissement' },
  { id: '7e-arrondissement--sedami', name: 'Sedami', secteurId: '7e-arrondissement' },
  { id: '7e-arrondissement--sedjro-saint-michel', name: 'Sedjro Saint Michel', secteurId: '7e-arrondissement' },
  { id: '7e-arrondissement--sehogan-sike', name: 'Sehogan Sike', secteurId: '7e-arrondissement' },
  { id: '7e-arrondissement--todote', name: 'Todote', secteurId: '7e-arrondissement' },
  { id: '7e-arrondissement--yevedo', name: 'Yevedo', secteurId: '7e-arrondissement' },
  { id: '8e-arrondissement--agbodjedo-ste-rita', name: 'Agbodjedo Ste Rita', secteurId: '8e-arrondissement' },
  { id: '8e-arrondissement--agontinkon', name: 'Agontinkon', secteurId: '8e-arrondissement' },
  { id: '8e-arrondissement--gbedagba', name: 'Gbedagba', secteurId: '8e-arrondissement' },
  { id: '8e-arrondissement--houehoun', name: 'Houehoun', secteurId: '8e-arrondissement' },
  { id: '8e-arrondissement--houenoussou-ste-rita', name: 'Houenoussou Ste Rita', secteurId: '8e-arrondissement' },
  { id: '8e-arrondissement--mededjro', name: 'Mededjro', secteurId: '8e-arrondissement' },
  { id: '8e-arrondissement--minonkpo-wologuede', name: 'Minonkpo Wologuede', secteurId: '8e-arrondissement' },
  { id: '8e-arrondissement--tonato', name: 'Tonato', secteurId: '8e-arrondissement' },
  { id: '9e-arrondissement--fifadji', name: 'Fifadji', secteurId: '9e-arrondissement' },
  { id: '9e-arrondissement--kindonou', name: 'Kindonou', secteurId: '9e-arrondissement' },
  { id: '9e-arrondissement--menontin', name: 'Menontin', secteurId: '9e-arrondissement' },
  { id: '9e-arrondissement--vossa-kpodji', name: 'Vossa-Kpodji', secteurId: '9e-arrondissement' },
  { id: '9e-arrondissement--zogbo', name: 'Zogbo', secteurId: '9e-arrondissement' },
  { id: '9e-arrondissement--zogbohoue', name: 'Zogbohoue', secteurId: '9e-arrondissement' },
  { id: '10e-arrondissement--agounvocodji', name: 'Agounvocodji', secteurId: '10e-arrondissement' },
  { id: '10e-arrondissement--gbenonkpo', name: 'Gbenonkpo', secteurId: '10e-arrondissement' },
  { id: '10e-arrondissement--kouhounou', name: 'Kouhounou', secteurId: '10e-arrondissement' },
  { id: '10e-arrondissement--midedji', name: 'Midedji', secteurId: '10e-arrondissement' },
  { id: '10e-arrondissement--missekple', name: 'Missekple', secteurId: '10e-arrondissement' },
  { id: '10e-arrondissement--missogbe', name: 'Missogbe', secteurId: '10e-arrondissement' },
  { id: '10e-arrondissement--setovi', name: 'Setovi', secteurId: '10e-arrondissement' },
  { id: '10e-arrondissement--vedoko', name: 'Vedoko', secteurId: '10e-arrondissement' },
  { id: '10e-arrondissement--yenawa-fifadji', name: 'Yenawa-Fifadji', secteurId: '10e-arrondissement' },
  { id: '11e-arrondissement--gbediga-guedehoungue', name: 'Gbediga Guedehoungue', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--gbegamey-ahito', name: 'Gbegamey Ahito', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--gbegamey-centre', name: 'Gbegamey Centre', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--gbegamey-dodo-ayidje', name: 'Gbegamey Dodo Ayidje', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--gbegamey-gbagoudo', name: 'Gbegamey Gbagoudo', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--gbegamey-mifongou', name: 'Gbegamey Mifongou', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--houeyiho', name: 'Houeyiho', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--houeyiho-tanou', name: 'Houeyiho Tanou', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--saint-jean-gbediga', name: 'Saint Jean Gbediga', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--vodje-allobatin', name: 'Vodje Allobatin', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--vodje-ayidote', name: 'Vodje Ayidote', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--vodje-centre', name: 'Vodje Centre', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--vodje-finagnon', name: 'Vodje Finagnon', secteurId: '11e-arrondissement' },
  { id: '12e-arrondissement--ahouanleko', name: 'Ahouanleko', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--aibatin-dodo', name: 'Aibatin Dodo', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--akogbato', name: 'Akogbato', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--cadjehoun-agonga', name: 'Cadjehoun Agonga', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--cadjehoun-aupiais', name: 'Cadjehoun Aupiais', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--cadjehoun-azalokogon', name: 'Cadjehoun Azalokogon', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--cadjehoun-detinsa', name: 'Cadjehoun Detinsa', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--cadjehoun-gare', name: 'Cadjehoun Gare', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--cadjehoun-kpota', name: 'Cadjehoun Kpota', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--fidjrosse-centre', name: 'Fidjrosse Centre', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--fidjrosse-kpota', name: 'Fidjrosse Kpota', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--fiyegnon-houta', name: 'Fiyegnon Houta', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--fiyegnon-jacquot', name: 'Fiyegnon Jacquot', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--gbodjetin', name: 'Gbodjetin', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--haie-vive', name: 'Haie Vive', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--hlazounto', name: 'Hlazounto', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--les-cocotiers', name: 'Les Cocotiers', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--vodje-kpota', name: 'Vodje Kpota', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--yemicodji', name: 'Yemicodji', secteurId: '12e-arrondissement' },
  { id: '13e-arrondissement--agla-agongbomey', name: 'Agla Agongbomey', secteurId: '13e-arrondissement' },
  { id: '13e-arrondissement--agla-akplomey', name: 'Agla Akplomey', secteurId: '13e-arrondissement' },
  { id: '13e-arrondissement--agla-figaro', name: 'Agla Figaro', secteurId: '13e-arrondissement' },
  { id: '13e-arrondissement--agla-les-pylones', name: 'Agla Les Pylones', secteurId: '13e-arrondissement' },
  { id: '13e-arrondissement--agla-petit-chateau', name: 'Agla Petit Chateau', secteurId: '13e-arrondissement' },
  { id: '13e-arrondissement--agla-sud', name: 'Agla Sud', secteurId: '13e-arrondissement' },
  { id: '13e-arrondissement--aglafinafa', name: 'Aglafinafa', secteurId: '13e-arrondissement' },
  { id: '13e-arrondissement--ahogbohoue-cite-de-lexperience', name: 'Ahogbohoue Cite De L\'Experience', secteurId: '13e-arrondissement' },
  { id: '13e-arrondissement--ahogbohoue-cite-eucaristie', name: 'Ahogbohoue Cite Eucaristie', secteurId: '13e-arrondissement' },
  { id: '13e-arrondissement--aibatin-kpota', name: 'Aibatin Kpota', secteurId: '13e-arrondissement' },
  { id: '13e-arrondissement--cite-adjaha', name: 'Cite Adjaha', secteurId: '13e-arrondissement' },
  { id: '13e-arrondissement--gbedegbe', name: 'Gbedegbe', secteurId: '13e-arrondissement' },
  { id: '13e-arrondissement--houenoussou', name: 'Houenoussou', secteurId: '13e-arrondissement' },
  { id: '13e-arrondissement--missite', name: 'Missite', secteurId: '13e-arrondissement' },
  { id: 'akassato--adjagbo', name: 'Adjagbo', secteurId: 'akassato' },
  { id: 'akassato--agassa-godomey', name: 'Agassa-Godomey', secteurId: 'akassato' },
  { id: 'akassato--agonme', name: 'Agonme', secteurId: 'akassato' },
  { id: 'akassato--agonsoundja', name: 'Agonsoundja', secteurId: 'akassato' },
  { id: 'akassato--akassato-centre', name: 'Akassato Centre', secteurId: 'akassato' },
  { id: 'akassato--gbetagbo', name: 'Gbetagbo', secteurId: 'akassato' },
  { id: 'akassato--glo-tokpa', name: 'Glo-Tokpa', secteurId: 'akassato' },
  { id: 'akassato--houeke-gbo', name: 'Houeke-Gbo', secteurId: 'akassato' },
  { id: 'akassato--houeke-honou', name: 'Houeke-Honou', secteurId: 'akassato' },
  { id: 'akassato--koletin', name: 'Koletin', secteurId: 'akassato' },
  { id: 'akassato--kpodji-les-monts', name: 'Kpodji-Les-Monts', secteurId: 'akassato' },
  { id: 'akassato--missessinto', name: 'Missessinto', secteurId: 'akassato' },
  { id: 'akassato--zekanmey-dome', name: 'Zekanmey-Dome', secteurId: 'akassato' },
  { id: 'akassato--zopah-palmeraie', name: 'Zopah Palmeraie', secteurId: 'akassato' },
  { id: 'godomey--abikouholi', name: 'Abikouholi', secteurId: 'godomey' },
  { id: 'godomey--agbo-codji-sedegbe', name: 'Agbo-Codji-Sedegbe', secteurId: 'godomey' },
  { id: 'godomey--agonkanmey', name: 'Agonkanmey', secteurId: 'godomey' },
  { id: 'godomey--aimevo', name: 'Aimevo', secteurId: 'godomey' },
  { id: 'godomey--alegleta', name: 'Alegleta', secteurId: 'godomey' },
  { id: 'godomey--amanhoun', name: 'Amanhoun', secteurId: 'godomey' },
  { id: 'godomey--assrossa', name: 'Assrossa', secteurId: 'godomey' },
  { id: 'godomey--atrokpo-codji', name: 'Atrokpo-Codji', secteurId: 'godomey' },
  { id: 'godomey--cococodji', name: 'Cococodji', secteurId: 'godomey' },
  { id: 'godomey--cocotomey', name: 'Cocotomey', secteurId: 'godomey' },
  { id: 'godomey--dekoungbe-eglise', name: 'Dekoungbe-Eglise', secteurId: 'godomey' },
  { id: 'godomey--dekoungbe-usine', name: 'Dekoungbe-Usine', secteurId: 'godomey' },
  { id: 'godomey--denou', name: 'Denou', secteurId: 'godomey' },
  { id: 'godomey--djekpota', name: 'Djekpota', secteurId: 'godomey' },
  { id: 'godomey--djoukpa-togoudo', name: 'Djoukpa-Togoudo', secteurId: 'godomey' },
  { id: 'godomey--fandji', name: 'Fandji', secteurId: 'godomey' },
  { id: 'godomey--fignonhou', name: 'Fignonhou', secteurId: 'godomey' },
  { id: 'godomey--finafa', name: 'Finafa', secteurId: 'godomey' },
  { id: 'godomey--ganganzounme', name: 'Ganganzounme', secteurId: 'godomey' },
  { id: 'godomey--gbegnigan-midokpo', name: 'Gbegnigan-Midokpo', secteurId: 'godomey' },
  { id: 'godomey--gbodje-womey', name: 'Gbodje-Womey', secteurId: 'godomey' },
  { id: 'godomey--gninkindji', name: 'Gninkindji', secteurId: 'godomey' },
  { id: 'godomey--godomey-ngbeho', name: 'Godomey-N\'Gbeho', secteurId: 'godomey' },
  { id: 'godomey--godomey-togoudo', name: 'Godomey-Togoudo', secteurId: 'godomey' },
  { id: 'godomey--hedome', name: 'Hedome', secteurId: 'godomey' },
  { id: 'godomey--helouto', name: 'Helouto', secteurId: 'godomey' },
  { id: 'godomey--houakomey', name: 'Houakomey', secteurId: 'godomey' },
  { id: 'godomey--hounsa-agbodokpa', name: 'Hounsa-Agbodokpa', secteurId: 'godomey' },
  { id: 'godomey--la-paix', name: 'La Paix', secteurId: 'godomey' },
  { id: 'godomey--lobozounkpa', name: 'Lobozounkpa', secteurId: 'godomey' },
  { id: 'godomey--maria-gleta', name: 'Maria-Gleta', secteurId: 'godomey' },
  { id: 'godomey--ningboto', name: 'Ningboto', secteurId: 'godomey' },
  { id: 'godomey--nonhouenou', name: 'Nonhouenou', secteurId: 'godomey' },
  { id: 'godomey--ounvenoumede', name: 'Ounvenoumede', secteurId: 'godomey' },
  { id: 'godomey--plateau', name: 'Plateau', secteurId: 'godomey' },
  { id: 'godomey--salamey', name: 'Salamey', secteurId: 'godomey' },
  { id: 'godomey--sedjannanko', name: 'Sedjannanko', secteurId: 'godomey' },
  { id: 'godomey--sedomey', name: 'Sedomey', secteurId: 'godomey' },
  { id: 'godomey--seloli-fandji', name: 'Seloli-Fandji', secteurId: 'godomey' },
  { id: 'godomey--sodo', name: 'Sodo', secteurId: 'godomey' },
  { id: 'godomey--tankpe', name: 'Tankpe', secteurId: 'godomey' },
  { id: 'godomey--togbin-daho', name: 'Togbin-Daho', secteurId: 'godomey' },
  { id: 'godomey--togbin-kpevi', name: 'Togbin-Kpevi', secteurId: 'godomey' },
  { id: 'godomey--tognin-fandji', name: 'Tognin-Fandji', secteurId: 'godomey' },
  { id: 'godomey--tokpa', name: 'Tokpa', secteurId: 'godomey' },
  { id: 'godomey--womey-centre', name: 'Womey Centre', secteurId: 'godomey' },
  { id: 'godomey--yenandjro', name: 'Yenandjro', secteurId: 'godomey' },
  { id: 'godomey--yolomahouto', name: 'Yolomahouto', secteurId: 'godomey' },
  { id: 'godomey--zounga', name: 'Zounga', secteurId: 'godomey' },
  { id: 'glo-djigbe--adjame', name: 'Adjame', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--agongbe', name: 'Agongbe', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--agonkessa', name: 'Agonkessa', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--alladacome', name: 'Alladacome', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--azonsa', name: 'Azonsa', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--djissoukpa', name: 'Djissoukpa', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--domey-gbo', name: 'Domey-Gbo', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--golo-djigbe', name: 'Golo-Djigbe', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--golo-fanto', name: 'Golo-Fanto', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--lohoussa', name: 'Lohoussa', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--missebo-espace-saint', name: 'Missebo-Espace Saint', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--yekon-aga', name: 'Yekon-Aga', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--yekon-do', name: 'Yekon-Do', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--zekanmey', name: 'Zekanmey', secteurId: 'glo-djigbe' },
  { id: 'hevie--adovie', name: 'Adovie', secteurId: 'hevie' },
  { id: 'hevie--akossavie', name: 'Akossavie', secteurId: 'hevie' },
  { id: 'hevie--dossounou', name: 'Dossounou', secteurId: 'hevie' },
  { id: 'hevie--hevie-centre', name: 'Hevie Centre', secteurId: 'hevie' },
  { id: 'hevie--houinme', name: 'Houinme', secteurId: 'hevie' },
  { id: 'hevie--hounyeva', name: 'Hounyeva', secteurId: 'hevie' },
  { id: 'hevie--hounzevie', name: 'Hounzevie', secteurId: 'hevie' },
  { id: 'hevie--sogan', name: 'Sogan', secteurId: 'hevie' },
  { id: 'hevie--zoungo', name: 'Zoungo', secteurId: 'hevie' },
  { id: 'kpanroun--anagbo', name: 'Anagbo', secteurId: 'kpanroun' },
  { id: 'kpanroun--avagbe', name: 'Avagbe', secteurId: 'kpanroun' },
  { id: 'kpanroun--bozoun', name: 'Bozoun', secteurId: 'kpanroun' },
  { id: 'kpanroun--djigbo', name: 'Djigbo', secteurId: 'kpanroun' },
  { id: 'kpanroun--hadjanaho', name: 'Hadjanaho', secteurId: 'kpanroun' },
  { id: 'kpanroun--kpanroun', name: 'Kpanroun', secteurId: 'kpanroun' },
  { id: 'kpanroun--kpanroun-dodomey', name: 'Kpanroun-Dodomey', secteurId: 'kpanroun' },
  { id: 'kpanroun--kpaviedja', name: 'Kpaviedja', secteurId: 'kpanroun' },
  { id: 'kpanroun--kpe', name: 'Kpe', secteurId: 'kpanroun' },
  { id: 'ouedo--adjagbo', name: 'Adjagbo', secteurId: 'ouedo' },
  { id: 'ouedo--adjagbo-aidjedo', name: 'Adjagbo-Aidjedo', secteurId: 'ouedo' },
  { id: 'ouedo--adjaglo-aidjedo', name: 'Adjaglo-Aidjedo', secteurId: 'ouedo' },
  { id: 'ouedo--ahouato', name: 'Ahouato', secteurId: 'ouedo' },
  { id: 'ouedo--alansankome', name: 'Alansankome', secteurId: 'ouedo' },
  { id: 'ouedo--dassekomey', name: 'Dassekomey', secteurId: 'ouedo' },
  { id: 'ouedo--dessato', name: 'Dessato', secteurId: 'ouedo' },
  { id: 'ouedo--kpossidja', name: 'Kpossidja', secteurId: 'ouedo' },
  { id: 'ouedo--ouedo-centre', name: 'Ouedo Centre', secteurId: 'ouedo' },
  { id: 'togba--ahossougbeta', name: 'Ahossougbeta', secteurId: 'togba' },
  { id: 'togba--drabo', name: 'Drabo', secteurId: 'togba' },
  { id: 'togba--fifonsi', name: 'Fifonsi', secteurId: 'togba' },
  { id: 'togba--houeto', name: 'Houeto', secteurId: 'togba' },
  { id: 'togba--ouega-ague', name: 'Ouega-Ague', secteurId: 'togba' },
  { id: 'togba--ouega-tokpa', name: 'Ouega-Tokpa', secteurId: 'togba' },
  { id: 'togba--some', name: 'Some', secteurId: 'togba' },
  { id: 'togba--tankpe', name: 'Tankpe', secteurId: 'togba' },
  { id: 'togba--togba-maria-gleta', name: 'Togba Maria-Gleta', secteurId: 'togba' },
  { id: 'togba--tokan', name: 'Tokan', secteurId: 'togba' },
  { id: 'togba--tokan-aidegnon', name: 'Tokan Aidegnon', secteurId: 'togba' },
  { id: 'zinvie--adjogansa', name: 'Adjogansa', secteurId: 'zinvie' },
  { id: 'zinvie--dangbodji', name: 'Dangbodji', secteurId: 'zinvie' },
  { id: 'zinvie--dokomey', name: 'Dokomey', secteurId: 'zinvie' },
  { id: 'zinvie--gbodje', name: 'Gbodje', secteurId: 'zinvie' },
  { id: 'zinvie--gbodjoko', name: 'Gbodjoko', secteurId: 'zinvie' },
  { id: 'zinvie--houegoudo', name: 'Houegoudo', secteurId: 'zinvie' },
  { id: 'zinvie--kpotomey', name: 'Kpotomey', secteurId: 'zinvie' },
  { id: 'zinvie--sokan', name: 'Sokan', secteurId: 'zinvie' },
  { id: 'zinvie--wawata', name: 'Wawata', secteurId: 'zinvie' },
  { id: 'zinvie--wawata-todja', name: 'Wawata-Todja', secteurId: 'zinvie' },
  { id: 'zinvie--yevie', name: 'Yevie', secteurId: 'zinvie' },
  { id: 'zinvie--yevie-nougo', name: 'Yevie-Nougo', secteurId: 'zinvie' },
  { id: 'zinvie--zinvie-agoledji', name: 'Zinvie-Agoledji', secteurId: 'zinvie' },
  { id: 'zinvie--zinvie-fandji', name: 'Zinvie-Fandji', secteurId: 'zinvie' },
  { id: 'zinvie--zinvie-zounme', name: 'Zinvie-Zounme', secteurId: 'zinvie' },
  { id: 'abomey-calavi-centre--agamandin', name: 'Agamandin', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--agori', name: 'Agori', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--aifa', name: 'Aifa', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--aitchedji', name: 'Aitchedji', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--aledjo', name: 'Aledjo', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--cite-la-victoire', name: 'Cite La Victoire', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--cite-les-palmiers', name: 'Cite Les Palmiers', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--fandji', name: 'Fandji', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--finafa', name: 'Finafa', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--gbodjo', name: 'Gbodjo', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--kansounkpa', name: 'Kansounkpa', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--seme', name: 'Seme', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--tankpe', name: 'Tankpe', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--tchinangbegbo', name: 'Tchinangbegbo', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--tokpa-zoungo', name: 'Tokpa-Zoungo', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--tokpa-zoungo-nord', name: 'Tokpa-Zoungo Nord', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--tokpa-zoungo-sud', name: 'Tokpa-Zoungo Sud', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--zogbadje', name: 'Zogbadje', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--zopah', name: 'Zopah', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--zoundja', name: 'Zoundja', secteurId: 'abomey-calavi-centre' },
]

/**
 * Bbox Cotonou / Abomey-Calavi (jusqu'à Kpanroun/Zinvié au nord, et au 1er
 * Arrondissement à l'est), pour l'anti-abus (MVP). Doit rester synchronisée
 * avec `enforce_report_location_bounds` côté Postgres.
 */
export const SERVICE_BBOX = { minLat: 6.3, maxLat: 6.7, minLng: 2.24, maxLng: 2.5 }

export function isWithinServiceArea(lat: number, lng: number): boolean {
  return lat >= SERVICE_BBOX.minLat && lat <= SERVICE_BBOX.maxLat && lng >= SERVICE_BBOX.minLng && lng <= SERVICE_BBOX.maxLng
}

function haversineMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h = sinLat * sinLat + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * sinLng * sinLng
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function findNearestZone(lat: number, lng: number): Zone {
  let nearest: Zone = ZONES[0]!
  let best = Infinity
  for (const zone of ZONES) {
    const d = haversineMeters(lat, lng, zone.lat, zone.lng)
    if (d < best) {
      best = d
      nearest = zone
    }
  }
  return nearest
}

const REPORT_WINDOW_MS = 60 * 60 * 1000 // 60 min
const CONFIRM_MIN_REPORTS = 3
const CONFIRM_MAJORITY_SHARE = 0.75

/**
 * Recalcule l'état d'une zone à partir des signalements des 60 dernières
 * minutes, pondérés par fraîcheur. Réplique en JS, pour le mode démo sans
 * backend, la logique qui tourne normalement côté Postgres (cf. CLAUDE.md).
 */
function computeZoneStatus(zoneId: string, reports: DemoReport[], now: number): ZoneStatusEntry {
  const recent = reports.filter((r) => r.zoneId === zoneId && now - r.createdAt <= REPORT_WINDOW_MS)

  if (recent.length === 0) {
    return { zoneId, status: 'unknown', confidence: 0, reportsCount: 0, updatedAt: null, outageQuartierIds: [], powerQuartierIds: [] }
  }

  let powerWeight = 0
  let outageWeight = 0
  let powerCount = 0
  let outageCount = 0
  let latest = 0

  for (const r of recent) {
    const ageMs = now - r.createdAt
    const freshness = Math.max(0, 1 - ageMs / REPORT_WINDOW_MS)
    if (r.status === 'power') {
      powerWeight += freshness
      powerCount++
    } else {
      outageWeight += freshness
      outageCount++
    }
    if (r.createdAt > latest) latest = r.createdAt
  }

  // Les deux statuts sont confirmés indépendamment (et non l'un contre
  // l'autre) : un secteur peut avoir à la fois des quartiers confirmés en
  // coupure ET des quartiers confirmés avec le courant ('mixed').
  const totalWeight = powerWeight + outageWeight
  const powerShare = totalWeight > 0 ? powerWeight / totalWeight : 0
  const outageShare = totalWeight > 0 ? outageWeight / totalWeight : 0
  const powerConfirmed = powerCount >= CONFIRM_MIN_REPORTS || powerShare >= CONFIRM_MAJORITY_SHARE
  const outageConfirmed = outageCount >= CONFIRM_MIN_REPORTS || outageShare >= CONFIRM_MAJORITY_SHARE

  let status: ZoneState = 'unknown'
  if (powerConfirmed && outageConfirmed) status = 'mixed'
  else if (outageConfirmed) status = 'outage'
  else if (powerConfirmed) status = 'power'

  const outageQuartierIds = outageConfirmed
    ? [...new Set(recent.filter((r) => r.status === 'outage' && r.quartierId).map((r) => r.quartierId as string))].sort()
    : []
  const powerQuartierIds = powerConfirmed
    ? [...new Set(recent.filter((r) => r.status === 'power' && r.quartierId).map((r) => r.quartierId as string))].sort()
    : []

  return {
    zoneId,
    status,
    confidence: Math.max(powerShare, outageShare),
    reportsCount: recent.length,
    updatedAt: new Date(latest).toISOString(),
    outageQuartierIds,
    powerQuartierIds,
  }
}

let realtimeSubscribed = false

export function useZoneStatus() {
  const supabase = useSupabaseClient()

  const statusByZone = useState<Record<string, ZoneStatusEntry>>('zone-status-map', () => {
    const initial: Record<string, ZoneStatusEntry> = {}
    for (const zone of ZONES) {
      initial[zone.id] = { zoneId: zone.id, status: 'unknown', confidence: 0, reportsCount: 0, updatedAt: null, outageQuartierIds: [], powerQuartierIds: [] }
    }
    return initial
  })

  // Journal des signalements en mémoire, utilisé uniquement en mode démo
  // (pas de Supabase configuré). Persisté en localStorage pour survivre au reload.
  const demoReports = useState<DemoReport[]>('demo-reports-log', () => {
    if (import.meta.client) {
      try {
        const raw = localStorage.getItem('courant_demo_reports')
        if (raw) return JSON.parse(raw) as DemoReport[]
      } catch {
        // localStorage indisponible ou corrompu : on repart d'un journal vide
      }
    }
    return []
  })

  function persistDemoReports() {
    if (import.meta.client) {
      localStorage.setItem('courant_demo_reports', JSON.stringify(demoReports.value))
    }
  }

  function recomputeAll() {
    const now = Date.now()
    const next: Record<string, ZoneStatusEntry> = {}
    for (const zone of ZONES) {
      next[zone.id] = computeZoneStatus(zone.id, demoReports.value, now)
    }
    statusByZone.value = next
  }

  /** Ajoute un signalement local (mode démo) et recalcule l'état des zones. */
  function recordDemoReport(zoneId: string, status: 'power' | 'outage', quartierId: string | null = null) {
    demoReports.value = [...demoReports.value, { zoneId, status, quartierId, createdAt: Date.now() }]
    persistDemoReports()
    recomputeAll()
  }

  async function fetchInitialStatus() {
    if (!supabase) {
      recomputeAll()
      return
    }
    const { data, error } = await supabase.from('zone_status').select('*')
    if (error) {
      console.error('[useZoneStatus] fetchInitialStatus', error)
      return
    }
    const next = { ...statusByZone.value }
    for (const row of data ?? []) {
      next[row.zone_id] = {
        zoneId: row.zone_id,
        status: row.status,
        confidence: row.confidence ?? 0,
        reportsCount: row.reports_count ?? 0,
        updatedAt: row.updated_at,
        outageQuartierIds: row.outage_quartier_ids ?? [],
        powerQuartierIds: row.power_quartier_ids ?? [],
      }
    }
    statusByZone.value = next
  }

  function subscribeRealtime() {
    if (!supabase || realtimeSubscribed) return
    realtimeSubscribed = true

    supabase
      .channel('zone_status_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'zone_status' },
        (payload) => {
          const row = payload.new as Record<string, unknown>
          if (!row) return
          statusByZone.value = {
            ...statusByZone.value,
            [row.zone_id as string]: {
              zoneId: row.zone_id as string,
              status: row.status as ZoneState,
              confidence: (row.confidence as number) ?? 0,
              reportsCount: (row.reports_count as number) ?? 0,
              updatedAt: row.updated_at as string,
              outageQuartierIds: (row.outage_quartier_ids as string[] | null) ?? [],
              powerQuartierIds: (row.power_quartier_ids as string[] | null) ?? [],
            },
          }
        }
      )
      .subscribe()
  }

  function init() {
    fetchInitialStatus()
    subscribeRealtime()

    // En mode démo, on ré-évalue périodiquement pour faire "vieillir" les
    // signalements (une zone sans nouveau signalement repasse en inconnue).
    if (!supabase && import.meta.client) {
      recomputeAll()
      const interval = setInterval(recomputeAll, 30_000)
      onScopeDispose(() => clearInterval(interval))
    }
  }

  const isDemoMode = computed(() => supabase === null)

  function getStatus(zoneId: string): ZoneStatusEntry {
    return (
      statusByZone.value[zoneId] ?? {
        zoneId,
        status: 'unknown',
        confidence: 0,
        reportsCount: 0,
        updatedAt: null,
        outageQuartierIds: [],
        powerQuartierIds: [],
      }
    )
  }

  return { ZONES, statusByZone, isDemoMode, init, recordDemoReport, getStatus }
}
