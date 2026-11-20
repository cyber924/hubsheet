import {documentKey} from './project-policy.mjs';
export class DraftWriter{
 constructor(project,transport){this.id=project.id;this.revision=project.revision||0;this.transport=transport;this.queue=Promise.resolve();this.savedKey='';}
 save(project,manual=false){const snapshot=structuredClone(project);const run=this.queue.catch(()=>{}).then(async()=>{const result=await this.transport({...snapshot,id:snapshot.sample?undefined:this.id,expectedRevision:this.revision,manual});this.id=result.id;this.revision=result.revision;this.savedKey=documentKey(snapshot);return {...result,submittedKey:this.savedKey};});this.queue=run;return run;}
}
export function mergeSaveMetadata(current,result){const patch={};for(const key of ['id','revision','visibility','updatedAt','publishedRevision','publishedAt','hasUnpublishedChanges'])if(result[key]!==undefined)patch[key]=result[key];const changedAfterSubmit=result.submittedKey&&documentKey(current)!==result.submittedKey;return {...current,...patch,sample:false,...(changedAfterSubmit&&patch.visibility==='public'?{hasUnpublishedChanges:true}:{})};}
