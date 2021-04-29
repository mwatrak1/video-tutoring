use mydb;
SET time_zone = "Europe/Warsaw";
CREATE EVENT delete_event
ON SCHEDULE EVERY 30 MINUTE 

DO
  
  DELETE FROM harmonogram WHERE dostepne_dni <= date_format(now(), "%Y-%m-%d") AND godzina_od <= date_format(now(), "%k:%i:%s");