export const UPDATE_SCHEDULE='UPDATE projects SET data = ? WHERE id = ? AND owner_id = ? AND data = ? AND revision = ? AND deleted_at IS NULL';
export const PUBLISH_SCHEDULE="UPDATE projects SET data=?, visibility='public', published_data=?, published_at=?, published_revision=revision WHERE id=? AND owner_id=? AND data=? AND revision=? AND deleted_at IS NULL";
