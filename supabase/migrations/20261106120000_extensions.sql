-- Extensions nécessaires : PostGIS pour la géométrie des zones et des
-- signalements, pgcrypto pour gen_random_uuid().
create extension if not exists postgis;
create extension if not exists pgcrypto;
