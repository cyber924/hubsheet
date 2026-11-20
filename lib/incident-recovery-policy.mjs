export const INCIDENT_PROJECT_ID='1ad9cc85-eee9-49d9-bd0c-ebbf58d9b73e';
export const RECOVERED_FOOD_ID='recovered-food-'+INCIDENT_PROJECT_ID;
export const RECOVER_FOOD_SQL=`INSERT OR IGNORE INTO projects (id,owner_id,title,category,status,visibility,data,published_data,created_at,updated_at,published_at,revision,published_revision)
 SELECT ?1,p.owner_id,json_extract(v.data,'$.title'),'식품','complete','public',v.data,v.data,v.created_at,?2,v.created_at,1,1
 FROM project_versions v JOIN projects p ON p.id=v.project_id AND p.owner_id=v.owner_id
 WHERE p.id=?3 AND p.category!='식품' AND p.visibility='public' AND p.deleted_at IS NULL
 AND json_valid(v.data) AND json_extract(v.data,'$.category')='식품'
 AND json_array_length(v.data,'$.sections')>0 AND json_array_length(v.data,'$.images') BETWEEN 1 AND 7
 ORDER BY v.revision DESC LIMIT 1`;
