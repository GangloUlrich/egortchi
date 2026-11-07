export interface Zone {
  id: string
  name: string
  lat: number
  lng: number
  /** Rayon approximatif de la zone, en mètres (pour le rendu sur la carte) */
  radius: number
}

export type ZoneState = 'power' | 'outage' | 'unknown'

export interface ZoneStatusEntry {
  zoneId: string
  status: ZoneState
  confidence: number
  reportsCount: number
  updatedAt: string | null
  /** Quartier précis à l'origine de l'état affiché (nul si signalement géolocalisé ou état inconnu). */
  lastQuartierId: string | null
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
  { id: '4e-arrondissement', name: '4e Arrondissement', lat: 6.3629545, lng: 2.4512569, radius: 1300 },
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
  { id: '7e-arrondissement--gbedomidji-maro-militaire', name: 'Gbedomidji (Maro Militaire)', secteurId: '7e-arrondissement' },
  { id: '7e-arrondissement--gbenan', name: 'Gbenan', secteurId: '7e-arrondissement' },
  { id: '7e-arrondissement--gbewa-batito', name: 'Gbewa (Batito)', secteurId: '7e-arrondissement' },
  { id: '7e-arrondissement--sedami', name: 'Sedami', secteurId: '7e-arrondissement' },
  { id: '7e-arrondissement--sedjro', name: 'Sedjro', secteurId: '7e-arrondissement' },
  { id: '7e-arrondissement--todote', name: 'Todote', secteurId: '7e-arrondissement' },
  { id: '7e-arrondissement--yevedo', name: 'Yevedo', secteurId: '7e-arrondissement' },
  { id: '7e-arrondissement--dagbedji', name: 'Dagbedji', secteurId: '7e-arrondissement' },
  { id: '7e-arrondissement--enagnon', name: 'Enagnon', secteurId: '7e-arrondissement' },
  { id: '7e-arrondissement--fignon', name: 'Fignon', secteurId: '7e-arrondissement' },
  { id: '7e-arrondissement--missite', name: 'Missite', secteurId: '7e-arrondissement' },
  { id: '7e-arrondissement--sehogan', name: 'Sehogan', secteurId: '7e-arrondissement' },
  { id: '8e-arrondissement--agbodjedo', name: 'Agbodjedo', secteurId: '8e-arrondissement' },
  { id: '8e-arrondissement--agontikon', name: 'Agontikon', secteurId: '8e-arrondissement' },
  { id: '8e-arrondissement--gbedagba', name: 'Gbedagba', secteurId: '8e-arrondissement' },
  { id: '8e-arrondissement--houehoun', name: 'Houehoun', secteurId: '8e-arrondissement' },
  { id: '8e-arrondissement--houenoussou', name: 'Houenoussou', secteurId: '8e-arrondissement' },
  { id: '8e-arrondissement--mededjro', name: 'Mededjro', secteurId: '8e-arrondissement' },
  { id: '8e-arrondissement--tonato', name: 'Tonato', secteurId: '8e-arrondissement' },
  { id: '8e-arrondissement--minonkpo', name: 'Minonkpo', secteurId: '8e-arrondissement' },
  { id: '9e-arrondissement--fifadji', name: 'Fifadji', secteurId: '9e-arrondissement' },
  { id: '9e-arrondissement--kindonou', name: 'Kindonou', secteurId: '9e-arrondissement' },
  { id: '9e-arrondissement--menontin', name: 'Menontin', secteurId: '9e-arrondissement' },
  { id: '9e-arrondissement--vossa-kpodji', name: 'Vossa-Kpodji', secteurId: '9e-arrondissement' },
  { id: '9e-arrondissement--zogbo', name: 'Zogbo', secteurId: '9e-arrondissement' },
  { id: '9e-arrondissement--zogbohoue', name: 'Zogbohoue', secteurId: '9e-arrondissement' },
  { id: '10e-arrondissement--gbenonkpo', name: 'Gbenonkpo', secteurId: '10e-arrondissement' },
  { id: '10e-arrondissement--kouhounou', name: 'Kouhounou', secteurId: '10e-arrondissement' },
  { id: '10e-arrondissement--midedji', name: 'Midedji', secteurId: '10e-arrondissement' },
  { id: '10e-arrondissement--missekple', name: 'Missekple', secteurId: '10e-arrondissement' },
  { id: '10e-arrondissement--missogbe', name: 'Missogbe', secteurId: '10e-arrondissement' },
  { id: '10e-arrondissement--vedoko', name: 'Vedoko', secteurId: '10e-arrondissement' },
  { id: '10e-arrondissement--yenawa', name: 'Yenawa', secteurId: '10e-arrondissement' },
  { id: '11e-arrondissement--allobatin', name: 'Allobatin', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--ayidote', name: 'Ayidote', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--finagnon', name: 'Finagnon', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--gbediga-i', name: 'Gbediga I', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--gbediga-ii', name: 'Gbediga II', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--gbegamey-i', name: 'Gbegamey I', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--gbegamey-ii', name: 'Gbegamey II', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--gbegamey-iii', name: 'Gbegamey III', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--gbegamey-iv', name: 'Gbegamey IV', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--oueyiho-i', name: 'Oueyiho I', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--oueyiho-ii', name: 'Oueyiho II', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--st-jean-miffongou', name: 'St Jean (Miffongou)', secteurId: '11e-arrondissement' },
  { id: '11e-arrondissement--vodje-centre', name: 'Vodje Centre', secteurId: '11e-arrondissement' },
  { id: '12e-arrondissement--ahouanleko', name: 'Ahouanleko', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--aibatin-i', name: 'Aibatin I', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--cadjehoun-i', name: 'Cadjehoun I', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--cadjehoun-2', name: 'Cadjehoun 2', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--cadjehoun-3', name: 'Cadjehoun 3', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--cadjehoun-4', name: 'Cadjehoun 4', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--cadjehoun-5', name: 'Cadjehoun 5', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--cocotier', name: 'Cocotier', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--fidjrosse-centre', name: 'Fidjrosse Centre', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--fidjrosse-kpota', name: 'Fidjrosse Kpota', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--fiyegnon-i', name: 'Fiyegnon I', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--fiyegnon-ii', name: 'Fiyegnon II', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--cadjehoun-kpota', name: 'Cadjehoun Kpota', secteurId: '12e-arrondissement' },
  { id: '12e-arrondissement--vodje-kpota', name: 'Vodje Kpota', secteurId: '12e-arrondissement' },
  { id: '13e-arrondissement--agla', name: 'Agla', secteurId: '13e-arrondissement' },
  { id: '13e-arrondissement--ahogbohoue', name: 'Ahogbohouè', secteurId: '13e-arrondissement' },
  { id: '13e-arrondissement--aibatin-ii', name: 'Aibatin II', secteurId: '13e-arrondissement' },
  { id: '13e-arrondissement--gbedegbe', name: 'Gbèdégbé', secteurId: '13e-arrondissement' },
  { id: '13e-arrondissement--houenoussou', name: 'Houénoussou', secteurId: '13e-arrondissement' },
  { id: '13e-arrondissement--missite', name: 'Missité', secteurId: '13e-arrondissement' },
  { id: '13e-arrondissement--aibatin-kpota', name: 'Aïbatin-Kpota', secteurId: '13e-arrondissement' },
  { id: '4e-arrondissement--enagnon', name: 'Enagnon', secteurId: '4e-arrondissement' },
  { id: '4e-arrondissement--fifadji-houto', name: 'Fifadji Houto', secteurId: '4e-arrondissement' },
  { id: '4e-arrondissement--sodjatinme-centre', name: 'Sodjatinme Centre', secteurId: '4e-arrondissement' },
  { id: '4e-arrondissement--sodjatinme-est', name: 'Sodjatinme Est', secteurId: '4e-arrondissement' },
  { id: '4e-arrondissement--sodjatinme-ouest', name: 'Sodjatinme Ouest', secteurId: '4e-arrondissement' },
  { id: '4e-arrondissement--abokicodji-centre', name: 'Abokicodji Centre', secteurId: '4e-arrondissement' },
  { id: '4e-arrondissement--abokicodji-lagune', name: 'Abokicodji Lagune', secteurId: '4e-arrondissement' },
  { id: '4e-arrondissement--dedokpo', name: 'Dedokpo', secteurId: '4e-arrondissement' },
  { id: '4e-arrondissement--gbedjewin', name: 'Gbedjewin', secteurId: '4e-arrondissement' },
  { id: '4e-arrondissement--missessin', name: 'Missessin', secteurId: '4e-arrondissement' },
  { id: '4e-arrondissement--ohe', name: 'Ohe', secteurId: '4e-arrondissement' },
  { id: 'abomey-calavi-centre--abomey-calavi', name: 'Abomey-Calavi', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--agamandin', name: 'Agamandin', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--agori', name: 'Agori', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--aifa-calavi', name: 'Aïfa-Calavi', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--aitchedji', name: 'Aïtchédji', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--kansounkpa', name: 'Kansounkpa', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--seme', name: 'Sèmè', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--tankpe', name: 'Tankpè', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--tokpa-zoungo', name: 'Tokpa-Zoungo', secteurId: 'abomey-calavi-centre' },
  { id: 'abomey-calavi-centre--zogbadje', name: 'Zogbadjè', secteurId: 'abomey-calavi-centre' },
  { id: 'godomey--abikouholi', name: 'Abikouholi', secteurId: 'godomey' },
  { id: 'godomey--agbo-codji-sedegbe-sedegbe', name: 'Agbo Codji Sèdégbé (Sèdégbé)', secteurId: 'godomey' },
  { id: 'godomey--agonkanmey', name: 'Agonkanmey', secteurId: 'godomey' },
  { id: 'godomey--aimevo', name: 'Aïmèvo', secteurId: 'godomey' },
  { id: 'godomey--alegleta', name: 'Alègléta', secteurId: 'godomey' },
  { id: 'godomey--amahoun', name: 'Amahoun', secteurId: 'godomey' },
  { id: 'godomey--cococodji', name: 'Cococodji', secteurId: 'godomey' },
  { id: 'godomey--dekoungbe', name: 'Dékoungbé', secteurId: 'godomey' },
  { id: 'godomey--gbegnigan', name: 'Gbégnigan', secteurId: 'godomey' },
  { id: 'godomey--togoudo', name: 'Togoudo', secteurId: 'godomey' },
  { id: 'godomey--womey', name: 'Womey', secteurId: 'godomey' },
  { id: 'akassato--akassato', name: 'Akassato', secteurId: 'akassato' },
  { id: 'akassato--adjagbo', name: 'Adjagbo', secteurId: 'akassato' },
  { id: 'akassato--agassa-godomey', name: 'Agassa-Godomey', secteurId: 'akassato' },
  { id: 'akassato--agonme', name: 'Agonmé', secteurId: 'akassato' },
  { id: 'akassato--agonsoudja', name: 'Agonsoudja', secteurId: 'akassato' },
  { id: 'akassato--gbetagbo', name: 'Gbétagbo', secteurId: 'akassato' },
  { id: 'akassato--glo-tokpa', name: 'Glo-Tokpa', secteurId: 'akassato' },
  { id: 'akassato--houeke-gbo', name: 'Houèkè-Gbo', secteurId: 'akassato' },
  { id: 'akassato--houeke-honou', name: 'Houèkè-Honou', secteurId: 'akassato' },
  { id: 'akassato--koletin', name: 'Kolètin', secteurId: 'akassato' },
  { id: 'akassato--kpodji-les-monts', name: 'Kpodji-Les-Monts', secteurId: 'akassato' },
  { id: 'akassato--missessinto', name: 'Misséssinto', secteurId: 'akassato' },
  { id: 'akassato--zekanmey-dome', name: 'Zèkanmey-Domè', secteurId: 'akassato' },
  { id: 'akassato--zopah-akassato', name: 'Zopah-Akassato', secteurId: 'akassato' },
  { id: 'glo-djigbe--adjame', name: 'Adjamè', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--agongbe', name: 'Agongbé', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--agonkessa', name: 'Agonkèssa', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--alladacome', name: 'Alladacomè', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--azonsa', name: 'Azonsa', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--djissoukpa', name: 'Djissoukpa', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--domey-gbo', name: 'Domey-Gbo', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--espace-saint', name: 'Espace-Saint', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--golo-djigbe', name: 'Golo-Djigbé', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--golo-fanto', name: 'Golo-Fanto', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--lohoussa', name: 'Lohoussa', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--yekon-aga', name: 'Yêkon-Aga', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--yekon-do', name: 'Yèkon-Do', secteurId: 'glo-djigbe' },
  { id: 'glo-djigbe--zekanmey', name: 'Zèkanmey', secteurId: 'glo-djigbe' },
  { id: 'hevie--adovie', name: 'Adovié', secteurId: 'hevie' },
  { id: 'hevie--akossavie', name: 'Akossavié', secteurId: 'hevie' },
  { id: 'hevie--dossounou', name: 'Dossounou', secteurId: 'hevie' },
  { id: 'hevie--hevie', name: 'Hêvié', secteurId: 'hevie' },
  { id: 'hevie--houinme', name: 'Houinmè', secteurId: 'hevie' },
  { id: 'hevie--houinme-daho', name: 'Houinmè-Daho', secteurId: 'hevie' },
  { id: 'hevie--hounzevie', name: 'Hounzévié', secteurId: 'hevie' },
  { id: 'hevie--sogan', name: 'Sogan', secteurId: 'hevie' },
  { id: 'hevie--zoungo', name: 'Zoungo', secteurId: 'hevie' },
  { id: 'kpanroun--ahowegodo', name: 'Ahowégodo', secteurId: 'kpanroun' },
  { id: 'kpanroun--anagbo', name: 'Anagbo', secteurId: 'kpanroun' },
  { id: 'kpanroun--avagbe', name: 'Avagbé', secteurId: 'kpanroun' },
  { id: 'kpanroun--bozoun', name: 'Bozoun', secteurId: 'kpanroun' },
  { id: 'kpanroun--djigbo', name: 'Djigbo', secteurId: 'kpanroun' },
  { id: 'kpanroun--hadjanaho', name: 'Hadjanaho', secteurId: 'kpanroun' },
  { id: 'kpanroun--kpanroun', name: 'Kpanroun', secteurId: 'kpanroun' },
  { id: 'kpanroun--kpaviedja', name: 'Kpaviédja', secteurId: 'kpanroun' },
  { id: 'kpanroun--kpe', name: 'Kpé', secteurId: 'kpanroun' },
  { id: 'ouedo--adjagbo', name: 'Adjagbo', secteurId: 'ouedo' },
  { id: 'ouedo--adjagbo-aidjedo', name: 'Adjagbo-Aïdjèdo', secteurId: 'ouedo' },
  { id: 'ouedo--ahouato', name: 'Ahouato', secteurId: 'ouedo' },
  { id: 'ouedo--alansankome', name: 'Alansankomè', secteurId: 'ouedo' },
  { id: 'ouedo--dassekomey', name: 'Dassèkomey', secteurId: 'ouedo' },
  { id: 'ouedo--dessato', name: 'Dessato', secteurId: 'ouedo' },
  { id: 'ouedo--kpossidja', name: 'Kpossidja', secteurId: 'ouedo' },
  { id: 'ouedo--ouedo', name: 'Ouèdo', secteurId: 'ouedo' },
  { id: 'togba--ahossougbeta', name: 'Ahossougbéta', secteurId: 'togba' },
  { id: 'togba--aidegnon', name: 'Aïdégnon', secteurId: 'togba' },
  { id: 'togba--drabo', name: 'Drabo', secteurId: 'togba' },
  { id: 'togba--fifonsi', name: 'Fifonsi', secteurId: 'togba' },
  { id: 'togba--houeto', name: 'Houèto', secteurId: 'togba' },
  { id: 'togba--maria-gleta', name: 'Maria-Gléta', secteurId: 'togba' },
  { id: 'togba--ouega-ague', name: 'Ouéga-Agué', secteurId: 'togba' },
  { id: 'togba--ouega-tokpa', name: 'Ouéga-Tokpa', secteurId: 'togba' },
  { id: 'togba--some', name: 'Somè', secteurId: 'togba' },
  { id: 'togba--tankpe-tanme', name: 'Tankpè-Tanmè', secteurId: 'togba' },
  { id: 'togba--togba', name: 'Togba', secteurId: 'togba' },
  { id: 'togba--tokan', name: 'Tokan', secteurId: 'togba' },
  { id: 'zinvie--adjogansa', name: 'Adjogansa', secteurId: 'zinvie' },
  { id: 'zinvie--dangbodji', name: 'Dangbodji', secteurId: 'zinvie' },
  { id: 'zinvie--dokome', name: 'Dokomè', secteurId: 'zinvie' },
  { id: 'zinvie--gbodje', name: 'Gbodjè', secteurId: 'zinvie' },
  { id: 'zinvie--gbodjoko', name: 'Gbodjoko', secteurId: 'zinvie' },
  { id: 'zinvie--houegoudo', name: 'Houégoudo', secteurId: 'zinvie' },
  { id: 'zinvie--kpotomey', name: 'Kpotomey', secteurId: 'zinvie' },
  { id: 'zinvie--sokan', name: 'Sokan', secteurId: 'zinvie' },
  { id: 'zinvie--wawata', name: 'Wawata', secteurId: 'zinvie' },
  { id: 'zinvie--wawata-todja', name: 'Wawata-Todja', secteurId: 'zinvie' },
  { id: 'zinvie--yevie', name: 'Yèvié', secteurId: 'zinvie' },
  { id: 'zinvie--yevie-nougo', name: 'Yèvié-Nougo', secteurId: 'zinvie' },
  { id: 'zinvie--zinvie', name: 'Zinvié', secteurId: 'zinvie' },
  { id: 'zinvie--zinvie-agoledji', name: 'Zinvié-Agolèdji', secteurId: 'zinvie' },
  { id: 'zinvie--zinvie-fandji', name: 'Zinvié-Fandji', secteurId: 'zinvie' },
  { id: 'zinvie--zinvie-zounme', name: 'Zinvié-Zounmè', secteurId: 'zinvie' },
]

/** Bbox Cotonou / Abomey-Calavi (jusqu'à Kpanroun/Zinvié au nord), pour l'anti-abus (MVP). */
export const SERVICE_BBOX = { minLat: 6.3, maxLat: 6.7, minLng: 2.24, maxLng: 2.47 }

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
    return { zoneId, status: 'unknown', confidence: 0, reportsCount: 0, updatedAt: null, lastQuartierId: null }
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

  const totalWeight = powerWeight + outageWeight
  const winningStatus: 'power' | 'outage' = powerWeight >= outageWeight ? 'power' : 'outage'
  const winningCount = winningStatus === 'power' ? powerCount : outageCount
  const winningWeight = winningStatus === 'power' ? powerWeight : outageWeight
  const share = totalWeight > 0 ? winningWeight / totalWeight : 0

  const confirmed = winningCount >= CONFIRM_MIN_REPORTS || share >= CONFIRM_MAJORITY_SHARE

  let lastQuartierId: string | null = null
  if (confirmed) {
    const matching = recent.filter((r) => r.status === winningStatus && r.quartierId)
    lastQuartierId = matching.length > 0 ? matching.reduce((a, b) => (b.createdAt > a.createdAt ? b : a)).quartierId : null
  }

  return {
    zoneId,
    status: confirmed ? winningStatus : 'unknown',
    confidence: confirmed ? share : 0,
    reportsCount: recent.length,
    updatedAt: new Date(latest).toISOString(),
    lastQuartierId,
  }
}

let realtimeSubscribed = false

export function useZoneStatus() {
  const supabase = useSupabaseClient()

  const statusByZone = useState<Record<string, ZoneStatusEntry>>('zone-status-map', () => {
    const initial: Record<string, ZoneStatusEntry> = {}
    for (const zone of ZONES) {
      initial[zone.id] = { zoneId: zone.id, status: 'unknown', confidence: 0, reportsCount: 0, updatedAt: null, lastQuartierId: null }
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
        lastQuartierId: row.last_quartier_id ?? null,
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
              lastQuartierId: (row.last_quartier_id as string | null) ?? null,
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
      statusByZone.value[zoneId] ?? { zoneId, status: 'unknown', confidence: 0, reportsCount: 0, updatedAt: null, lastQuartierId: null }
    )
  }

  return { ZONES, statusByZone, isDemoMode, init, recordDemoReport, getStatus }
}
