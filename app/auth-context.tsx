'use client';
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';import {api} from '../lib/client';
export type Account={id:string;email:string;name?:string;emailVerified?:boolean;isAdmin?:boolean};
const AuthContext=createContext<{user:Account|null;legacy:{email:string;count:number}|null;logout:()=>Promise<void>}>({user:null,legacy:null,logout:async()=>{}});
export function AuthProvider({initialUser,children}:{initialUser:Account|null;children:ReactNode}){
 const [user,setUser]=useState(initialUser);const [legacy,setLegacy]=useState<{email:string;count:number}|null>(null);
 useEffect(()=>{const sync=()=>api('/api/me').then(d=>{setUser(d.user);setLegacy(d.legacy||null);const previous=sessionStorage.getItem('hubsheet-account');if(d.user?.id&&previous&&previous!==d.user.id){sessionStorage.removeItem('hubsheet-draft');sessionStorage.removeItem('hubsheet-key')}if(d.user?.id)sessionStorage.setItem('hubsheet-account',d.user.id)}).catch(()=>{});sync();const t=setInterval(sync,900000);return ()=>clearInterval(t)},[]);
 const logout=async()=>{await api('/api/auth/logout',{method:'POST',body:'{}'});sessionStorage.removeItem('hubsheet-draft');sessionStorage.removeItem('hubsheet-key');sessionStorage.removeItem('hubsheet-account');setUser(null);location.assign('/market')};
 return <AuthContext.Provider value={{user,legacy,logout}}>{children}</AuthContext.Provider>
}
export function useAuth(){return useContext(AuthContext)}
