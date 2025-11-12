"use strict";(self.webpackChunkwebapp=self.webpackChunkwebapp||[]).push([[982],{1982:(e,r,a)=>{a.r(r),a.d(r,{default:()=>_});var o=a(5043),t=a(3216),n=a(5464),i=a(1205),s=a(899),c=a(6931),l=a(1217);const d=()=>{const{data:e,isLoading:r,isFetching:a,isError:o,error:t,refetch:n}=(0,c.I)({queryKey:["brand-accessories"],queryFn:async()=>await l.V.getBrands(),staleTime:3e5,retry:1});return{brandAccessories:null!==e&&void 0!==e?e:[],loading:r||a,error:o?t:null,refetch:n}};var u=a(6753);const m="/category/all",y=async()=>(await u.A.get(m)).data,h=()=>{const{data:e,isLoading:r,isFetching:a,isError:o,error:t,refetch:n}=(0,c.I)({queryKey:["categories"],queryFn:async()=>await y(),staleTime:3e5,retry:1});return{categories:null!==e&&void 0!==e?e:[],loading:r||a,error:o?t:null,refetch:n}};var p=a(579);const g=e=>{let{form:r,isEditing:a,brands:o,categories:t,onChange:n,setImageFile:i,setVideoFile:s,models:c}=e;return(0,p.jsxs)(b,{children:[(0,p.jsxs)(v,{children:[(0,p.jsx)(f,{children:"M\xe3 ph\u1ee5 ki\u1ec7n"}),(0,p.jsx)(x,{value:r.accessoryCode,disabled:a,onChange:e=>n((r=>({...r,accessoryCode:e.target.value}))),placeholder:"M\xe3 ph\u1ee5 ki\u1ec7n"})]}),(0,p.jsxs)(v,{children:[(0,p.jsx)(f,{children:"T\xean ph\u1ee5 ki\u1ec7n"}),(0,p.jsx)(x,{value:r.accessoryName,disabled:a,onChange:e=>n((r=>({...r,accessoryName:e.target.value}))),placeholder:"T\xean ph\u1ee5 ki\u1ec7n"})]}),(0,p.jsxs)(v,{children:[(0,p.jsx)(f,{children:"Gi\xe1 b\xe1n"}),(0,p.jsx)(x,{type:"number",value:r.price,onChange:e=>n((r=>({...r,price:e.target.value}))),placeholder:"0"})]}),(0,p.jsxs)(v,{children:[(0,p.jsx)(f,{children:"Th\u01b0\u01a1ng hi\u1ec7u"}),(0,p.jsxs)(k,{value:r.brandAccessoryID,onChange:e=>n((r=>({...r,brandAccessoryID:e.target.value}))),children:[(0,p.jsx)("option",{value:"",children:"-- Kh\xf4ng ch\u1ecdn --"}),o.map((e=>(0,p.jsx)("option",{value:e.name,children:e.name},e.name)))]})]}),(0,p.jsxs)(v,{children:[(0,p.jsx)(f,{children:"Danh m\u1ee5c"}),(0,p.jsxs)(k,{value:r.categoryID,onChange:e=>n((r=>({...r,categoryID:e.target.value}))),children:[(0,p.jsx)("option",{value:"",children:"-- Kh\xf4ng ch\u1ecdn --"}),t.map((e=>(0,p.jsx)("option",{value:e.categoryID,children:e.categoryName},e.categoryID)))]})]}),(0,p.jsxs)(v,{colSpan:!0,children:[(0,p.jsx)(f,{children:"M\xf4 t\u1ea3"}),(0,p.jsx)(j,{rows:3,value:r.description,onChange:e=>n((r=>({...r,description:e.target.value}))),placeholder:"M\xf4 t\u1ea3"})]}),(0,p.jsxs)(v,{colSpan:!0,children:[(0,p.jsx)(f,{children:"H\xecnh \u1ea3nh (file)"}),(0,p.jsx)(x,{type:"file",accept:"image/*",onChange:e=>{var r,a;return i(null!==(r=null===(a=e.target.files)||void 0===a?void 0:a[0])&&void 0!==r?r:null)}})]}),(0,p.jsxs)(v,{children:[(0,p.jsx)(f,{children:"Gi\xe1 v\u1ed1n"}),(0,p.jsx)(x,{type:"number",value:r.costPrice,onChange:e=>n((r=>({...r,costPrice:e.target.value}))),placeholder:"0"})]}),(0,p.jsxs)(v,{children:[(0,p.jsx)(f,{children:"T\u1ed3n kho"}),(0,p.jsx)(x,{type:"number",value:r.stockQuantity,onChange:e=>n((r=>({...r,stockQuantity:e.target.value}))),placeholder:"0"})]}),(0,p.jsxs)(v,{children:[(0,p.jsx)(f,{children:"T\u1ed3n t\u1ed1i thi\u1ec3u"}),(0,p.jsx)(x,{type:"number",value:r.minStockLevel,onChange:e=>n((r=>({...r,minStockLevel:e.target.value}))),placeholder:"0"})]}),(0,p.jsxs)(v,{children:[(0,p.jsx)(f,{children:"T\u1ed3n t\u1ed1i \u0111a"}),(0,p.jsx)(x,{type:"number",value:r.maxStockLevel,onChange:e=>n((r=>({...r,maxStockLevel:e.target.value}))),placeholder:"0"})]}),(0,p.jsxs)(v,{colSpan:!0,children:[(0,p.jsx)(f,{children:"M\u1eabu xe t\u01b0\u01a1ng th\xedch"}),(0,p.jsx)("div",{className:"grid grid-cols-2 md:grid-cols-3 gap-2",children:c.map((e=>{const a=(r.compatibleCarModels||[]).includes(e.bodyCode);return(0,p.jsxs)("label",{className:"flex items-center gap-2",children:[(0,p.jsx)("input",{type:"checkbox",checked:a,onChange:r=>{n((a=>{const o=Array.isArray(a.compatibleCarModels)?a.compatibleCarModels:[],t=r.target.checked?Array.from(new Set([...o,e.bodyCode])):o.filter((r=>r!==e.bodyCode));return{...a,compatibleCarModels:t}}))}}),(0,p.jsx)("span",{children:e.bodyName})]},e.bodyCode)}))})]}),(0,p.jsxs)(v,{children:[(0,p.jsx)(f,{children:"Video l\u1eafp \u0111\u1eb7t"}),(0,p.jsx)(x,{type:"file",accept:"video/*",onChange:e=>{var r,a;return s(null!==(r=null===(a=e.target.files)||void 0===a?void 0:a[0])&&void 0!==r?r:null)}})]}),(0,p.jsxs)(v,{children:[(0,p.jsx)(f,{children:"B\u1ea3o h\xe0nh (th\xe1ng)"}),(0,p.jsxs)(k,{value:r.warrantyMonths,onChange:e=>n((r=>({...r,warrantyMonths:e.target.value}))),children:[(0,p.jsx)("option",{value:"",children:"-- Ch\u1ecdn --"}),(0,p.jsx)("option",{value:"3",children:"3"}),(0,p.jsx)("option",{value:"6",children:"6"}),(0,p.jsx)("option",{value:"12",children:"12"}),(0,p.jsx)("option",{value:"24",children:"24"})]})]})]})},b=n.Ay.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`,v=n.Ay.div`
  ${e=>e.colSpan?"\n    grid-column: 1 / -1;\n  ":""}
`,f=n.Ay.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: #111827;
`,x=n.Ay.input`
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #111827;
  background: #fff;
`,k=n.Ay.select`
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #111827;
  background: #fff;
`,j=n.Ay.textarea`
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #111827;
  background: #fff;
`;var C=a(133),A=a(4244),S=a(6054);const w=e=>{let{open:r,onClose:a,onSaved:t,variant:n="modal"}=e;const c=(0,A.G)(S.mB),l=(0,o.useMemo)((()=>{const e=(null===c||void 0===c?void 0:c.roles)||(null===c||void 0===c?void 0:c.authorities)||(null!==c&&void 0!==c&&c.role?[null===c||void 0===c?void 0:c.role]:[]);return Array.isArray(e)?e.map((e=>String(e).toLowerCase())):[]}),[c]),u=o.useCallback((()=>`Acc${Math.floor(1e3+9e3*Math.random())}-${l.length>0?l.join("-"):"user"}`),[l]),[m,y]=(0,o.useState)(!1),[b,v]=(0,o.useState)(null),{brandAccessories:f}=d(),{bodyTypes:x}=(0,C.q)(),{categories:k}=h(),j=(0,o.useMemo)((()=>({accessoryCode:"",accessoryName:"",description:"",price:"",categoryID:"",brandAccessoryID:"",compatibleCarModels:[],costPrice:"",stockQuantity:"",minStockLevel:"",maxStockLevel:"",warrantyMonths:"",createdBy:1})),[]),[w,Q]=(0,o.useState)(j),[B,q]=(0,o.useState)(null),[z,G]=(0,o.useState)(null),V=(0,o.useMemo)((()=>s.Ik({createdBy:s.ai().required("Ng\u01b0\u1eddi t\u1ea1o l\xe0 b\u1eaft bu\u1ed9c"),accessoryName:s.Yj().trim().required("T\xean ph\u1ee5 ki\u1ec7n l\xe0 b\u1eaft bu\u1ed9c"),price:s.ai().typeError("Gi\xe1 b\xe1n ph\u1ea3i l\xe0 s\u1ed1").min(0,"Gi\xe1 b\xe1n kh\xf4ng \xe2m").required("Gi\xe1 b\xe1n l\xe0 b\u1eaft bu\u1ed9c"),categoryID:s.ai().typeError("Danh m\u1ee5c kh\xf4ng h\u1ee3p l\u1ec7").required("Danh m\u1ee5c l\xe0 b\u1eaft bu\u1ed9c"),brandAccessoryID:s.gl().nullable().transform(((e,r)=>""===r?null:e)),costPrice:s.ai().typeError("Gi\xe1 v\u1ed1n ph\u1ea3i l\xe0 s\u1ed1").min(0,"Gi\xe1 v\u1ed1n kh\xf4ng \xe2m").nullable().transform(((e,r)=>""===r?null:e)),stockQuantity:s.ai().typeError("T\u1ed3n kho ph\u1ea3i l\xe0 s\u1ed1").min(0,"T\u1ed3n kho kh\xf4ng \xe2m").nullable().transform(((e,r)=>""===r?null:e)),minStockLevel:s.ai().typeError("T\u1ed3n t\u1ed1i thi\u1ec3u ph\u1ea3i l\xe0 s\u1ed1").min(0,"T\u1ed3n t\u1ed1i thi\u1ec3u kh\xf4ng \xe2m").nullable().transform(((e,r)=>""===r?null:e)),maxStockLevel:s.ai().typeError("T\u1ed3n t\u1ed1i \u0111a ph\u1ea3i l\xe0 s\u1ed1").min(0,"T\u1ed3n t\u1ed1i \u0111a kh\xf4ng \xe2m").nullable().transform(((e,r)=>""===r?null:e)),warrantyMonths:s.ai().nullable().transform(((e,r)=>""===r?null:e)).oneOf([3,6,12,24,null],"Ch\u1ecdn 3, 6, 12, ho\u1eb7c 24"),compatibleCarModels:s.YO().of(s.Yj()).default([])})),[]);(0,o.useEffect)((()=>{r&&(Q({...j,accessoryCode:u()}),q(null),G(null),v(null))}),[r,j,u]);if(!r)return null;const O=(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(N,{children:"Th\xeam ph\u1ee5 ki\u1ec7n"}),b?(0,p.jsx)(L,{children:b}):null,(0,p.jsx)(g,{form:w,isEditing:!1,models:x,brands:f,categories:k,onChange:Q,setImageFile:q,setVideoFile:G}),(0,p.jsxs)(T,{children:[(0,p.jsx)(P,{type:"button",onClick:a,children:"modal"===n?"Hu\u1ef7":"Quay l\u1ea1i"}),(0,p.jsx)(E,{type:"button",onClick:async()=>{if(v(null),w.accessoryCode.trim()&&w.accessoryName.trim())try{var e;await V.validateSync({createdBy:w.createdBy,accessoryName:w.accessoryName,price:w.price,categoryID:w.categoryID,brandAccessoryID:w.brandAccessoryID,costPrice:w.costPrice,stockQuantity:w.stockQuantity,minStockLevel:w.minStockLevel,maxStockLevel:w.maxStockLevel,warrantyMonths:w.warrantyMonths,compatibleCarModels:Array.isArray(w.compatibleCarModels)?w.compatibleCarModels:[]}),y(!0);const r={accessoryCode:w.accessoryCode&&w.accessoryCode.trim().length>0?w.accessoryCode.trim():u(),accessoryName:w.accessoryName.trim(),categoryID:w.categoryID?Number(w.categoryID):0,brandAccessoryID:w.brandAccessoryID&&!isNaN(Number(w.brandAccessoryID))?Number(w.brandAccessoryID):null,description:null!==(e=w.description)&&void 0!==e?e:"",price:w.price?Number(w.price):0,costPrice:w.costPrice?Number(w.costPrice):void 0,stockQuantity:w.stockQuantity?Number(w.stockQuantity):void 0,minStockLevel:w.minStockLevel?Number(w.minStockLevel):void 0,maxStockLevel:w.maxStockLevel?Number(w.maxStockLevel):void 0,compatibleCarModels:JSON.stringify(Array.isArray(w.compatibleCarModels)?w.compatibleCarModels:[]),imagePath:null!==B&&void 0!==B?B:void 0,installationVideo:null!==z&&void 0!==z?z:void 0,warrantyMonths:w.warrantyMonths?Number(w.warrantyMonths):null,createdBy:1};await i.y.create(r),null===t||void 0===t||t(),a()}catch(r){if(r instanceof s.yI){const e=Array.isArray(r.errors)&&r.errors.length>0&&r.errors[0]||r.message||"Vui l\xf2ng ki\u1ec3m tra c\xe1c tr\u01b0\u1eddng nh\u1eadp li\u1ec7u";v(e)}else v("L\u01b0u ph\u1ee5 ki\u1ec7n th\u1ea5t b\u1ea1i")}finally{y(!1)}else v("M\xe3 v\xe0 t\xean ph\u1ee5 ki\u1ec7n l\xe0 b\u1eaft bu\u1ed9c")},disabled:m,children:"T\u1ea1o"})]})]});return"modal"===n?(0,p.jsxs)(I,{children:[(0,p.jsx)(D,{onClick:a}),(0,p.jsx)(M,{children:O})]}):(0,p.jsx)(F,{children:O})},I=n.Ay.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
`,D=n.Ay.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
`,M=n.Ay.div`
  position: relative;
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  width: 100%;
  max-width: 48rem;
`,N=n.Ay.div`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #111827;
`,L=n.Ay.div`
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`,T=n.Ay.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
`,P=n.Ay.button`
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111827;
  transition: background 120ms ease;
  &:hover {
    background: #f9fafb;
  }
`,E=(0,n.Ay)(P)`
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
  opacity: ${e=>e.disabled?.6:1};
  &:hover {
    background: #1d4ed8;
  }
`,F=n.Ay.div`
  position: relative;
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 1rem;
  width: 100%;
  max-width: 48rem;
  margin: 1rem auto;
`,Q=e=>{let{open:r,onClose:a,accessoryId:t,onSaved:n,variant:c="modal"}=e;const[l,u]=(0,o.useState)(!1),[m,y]=(0,o.useState)(null),{brandAccessories:b}=d(),{bodyTypes:v}=(0,C.q)(),{categories:f}=h(),x=(0,o.useMemo)((()=>({accessoryCode:"",accessoryName:"",description:"",price:"",categoryID:"",brandAccessoryID:"",compatibleCarModels:[],costPrice:"",stockQuantity:"",minStockLevel:"",maxStockLevel:"",warrantyMonths:"",createdBy:1})),[]),[k,j]=(0,o.useState)(x),[A,S]=(0,o.useState)(null),[w,I]=(0,o.useState)(null),D=(0,o.useMemo)((()=>s.Ik({createdBy:s.ai().required("Ng\u01b0\u1eddi t\u1ea1o l\xe0 b\u1eaft bu\u1ed9c"),accessoryName:s.Yj().trim().required("T\xean ph\u1ee5 ki\u1ec7n l\xe0 b\u1eaft bu\u1ed9c"),price:s.ai().typeError("Gi\xe1 b\xe1n ph\u1ea3i l\xe0 s\u1ed1").min(0,"Gi\xe1 b\xe1n kh\xf4ng \xe2m").required("Gi\xe1 b\xe1n l\xe0 b\u1eaft bu\u1ed9c"),categoryID:s.ai().typeError("Danh m\u1ee5c kh\xf4ng h\u1ee3p l\u1ec7").required("Danh m\u1ee5c l\xe0 b\u1eaft bu\u1ed9c"),brandAccessoryID:s.gl().nullable().transform(((e,r)=>""===r?null:e)),costPrice:s.ai().typeError("Gi\xe1 v\u1ed1n ph\u1ea3i l\xe0 s\u1ed1").min(0,"Gi\xe1 v\u1ed1n kh\xf4ng \xe2m").nullable().transform(((e,r)=>""===r?null:e)),stockQuantity:s.ai().typeError("T\u1ed3n kho ph\u1ea3i l\xe0 s\u1ed1").min(0,"T\u1ed3n kho kh\xf4ng \xe2m").nullable().transform(((e,r)=>""===r?null:e)),minStockLevel:s.ai().typeError("T\u1ed3n t\u1ed1i thi\u1ec3u ph\u1ea3i l\xe0 s\u1ed1").min(0,"T\u1ed3n t\u1ed1i thi\u1ec3u kh\xf4ng \xe2m").nullable().transform(((e,r)=>""===r?null:e)),maxStockLevel:s.ai().typeError("T\u1ed3n t\u1ed1i \u0111a ph\u1ea3i l\xe0 s\u1ed1").min(0,"T\u1ed3n t\u1ed1i \u0111a kh\xf4ng \xe2m").nullable().transform(((e,r)=>""===r?null:e)),warrantyMonths:s.ai().nullable().transform(((e,r)=>""===r?null:e)).oneOf([3,6,12,24,null],"Ch\u1ecdn 3, 6, 12, ho\u1eb7c 24"),compatibleCarModels:s.YO().of(s.Yj()).default([])})),[]);(0,o.useEffect)((()=>{r&&t&&(S(null),I(null),y(null))}),[r,t]),(0,o.useEffect)((()=>{r&&t&&(async()=>{try{const o=await i.y.getDetail(Number(t));if(o){var e,r,a;let t=[];try{if(o.compatibleCarModels){const e=JSON.parse(o.compatibleCarModels);Array.isArray(e)&&(t=e.map((e=>"string"===typeof e?e:"string"===typeof(null===e||void 0===e?void 0:e.bodyCode)?e.bodyCode:null)).filter((e=>"string"===typeof e)))}}catch{t=[]}j({accessoryCode:null!==(e=o.accessoryCode)&&void 0!==e?e:"",accessoryName:null!==(r=o.accessoryName)&&void 0!==r?r:"",description:null!==(a=o.description)&&void 0!==a?a:"",price:void 0!==o.price?String(o.price):"",categoryID:void 0!==o.categoryID?String(o.categoryID):"",brandAccessoryID:void 0!==o.brandAccessoryID?String(o.brandAccessoryID):"",compatibleCarModels:t,costPrice:void 0!==o.costPrice?String(o.costPrice):"",stockQuantity:void 0!==o.stockQuantity?String(o.stockQuantity):"",minStockLevel:void 0!==o.minStockLevel?String(o.minStockLevel):"",maxStockLevel:void 0!==o.maxStockLevel?String(o.maxStockLevel):"",warrantyMonths:void 0!==o.warrantyMonths&&null!==o.warrantyMonths?String(o.warrantyMonths):"",createdBy:1})}}catch(o){console.error("Failed to load accessory detail",o)}})()}),[r,t]);if(!r)return null;const M=(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(G,{children:"S\u1eeda ph\u1ee5 ki\u1ec7n"}),m?(0,p.jsx)(V,{children:m}):null,(0,p.jsx)(g,{form:k,isEditing:!0,models:v,brands:b,categories:f,onChange:j,setImageFile:S,setVideoFile:I}),(0,p.jsxs)(O,{children:[(0,p.jsx)(Y,{type:"button",onClick:a,children:"modal"===c?"Hu\u1ef7":"Quay l\u1ea1i"}),(0,p.jsx)($,{type:"button",onClick:async()=>{y(null);try{var e;await D.validateSync({createdBy:k.createdBy,accessoryName:k.accessoryName,price:k.price,categoryID:k.categoryID,brandAccessoryID:k.brandAccessoryID,costPrice:k.costPrice,stockQuantity:k.stockQuantity,minStockLevel:k.minStockLevel,maxStockLevel:k.maxStockLevel,warrantyMonths:k.warrantyMonths,compatibleCarModels:Array.isArray(k.compatibleCarModels)?k.compatibleCarModels:[]}),u(!0);const r={accessoryID:Number(t),accessoryCode:k.accessoryCode.trim(),accessoryName:k.accessoryName.trim(),categoryID:k.categoryID?Number(k.categoryID):1,brandAccessoryID:k.brandAccessoryID&&!isNaN(Number(k.brandAccessoryID))?Number(k.brandAccessoryID):null,description:null!==(e=k.description)&&void 0!==e?e:"",price:k.price?Number(k.price):0,costPrice:k.costPrice?Number(k.costPrice):void 0,stockQuantity:k.stockQuantity?Number(k.stockQuantity):void 0,minStockLevel:k.minStockLevel?Number(k.minStockLevel):void 0,maxStockLevel:k.maxStockLevel?Number(k.maxStockLevel):void 0,compatibleCarModels:JSON.stringify(Array.isArray(k.compatibleCarModels)?k.compatibleCarModels:[]),imagePath:null!==A&&void 0!==A?A:void 0,installationVideo:null!==w&&void 0!==w?w:void 0,warrantyMonths:k.warrantyMonths?Number(k.warrantyMonths):null,createdBy:1};await i.y.update(Number(t),r),null===n||void 0===n||n(),a()}catch(r){if(r instanceof s.yI){const e=Array.isArray(r.errors)&&r.errors.length>0&&r.errors[0]||r.message||"Vui l\xf2ng ki\u1ec3m tra c\xe1c tr\u01b0\u1eddng nh\u1eadp li\u1ec7u";y(e)}else y("L\u01b0u ph\u1ee5 ki\u1ec7n th\u1ea5t b\u1ea1i")}finally{u(!1)}},disabled:l,children:"L\u01b0u"})]})]});return"modal"===c?(0,p.jsxs)(B,{children:[(0,p.jsx)(q,{onClick:a}),(0,p.jsx)(z,{children:M})]}):(0,p.jsx)(K,{children:M})},B=n.Ay.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
`,q=n.Ay.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
`,z=n.Ay.div`
  position: relative;
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  width: 100%;
  max-width: 48rem;
`,G=n.Ay.div`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #111827;
`,V=n.Ay.div`
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`,O=n.Ay.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
`,Y=n.Ay.button`
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111827;
  transition: background 120ms ease;
  &:hover {
    background: #f9fafb;
  }
`,$=(0,n.Ay)(Y)`
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
  opacity: ${e=>e.disabled?.6:1};
  &:hover {
    background: #1d4ed8;
  }
`,K=n.Ay.div`
  position: relative;
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 1rem;
  width: 100%;
  max-width: 48rem;
  margin: 1rem auto;
`;function _(){const e=(0,t.Zp)(),r=(0,t.g)().id,a=!!r&&"new"!==r,n=(0,o.useCallback)((()=>{e("/auth/login/admin/page_manage",{replace:!0})}),[e]),i=(0,o.useCallback)((()=>{e("/auth/login/admin/page_manage",{replace:!0})}),[e]);return(0,p.jsx)("div",{className:"flex min-h-screen bg-gray-50",children:a?(0,p.jsx)(Q,{open:!0,accessoryId:r,onClose:n,onSaved:i,variant:"page"}):(0,p.jsx)(w,{open:!0,onClose:n,onSaved:i,variant:"page"})})}},1205:(e,r,a)=>{a.d(r,{y:()=>l});var o=a(6753);const t="/accessory/all",n="/accessory/create",i="/accessory/edit",s="/accessory/detail";function c(e){const r=new FormData;return Object.entries(e).forEach((e=>{let[a,o]=e;void 0!==o&&null!==o&&(o instanceof File?r.append(a,o):r.append(a,String(o)))})),r}const l={getDetail:async e=>(await o.A.get(`${s}`,{params:{accessoryId:e}})).data,getAll:async()=>(await o.A.get(t,{params:{Page:1,PageSize:1e3}})).data,getPaged:async e=>{var r,a,n,i,s,c,l,d;return(await o.A.get(t,{params:{Page:null!==(r=e.page)&&void 0!==r?r:1,PageSize:null!==(a=e.pageSize)&&void 0!==a?a:10,PriceFrom:null!==(n=e.priceFrom)&&void 0!==n?n:void 0,PriceTo:null!==(i=e.priceTo)&&void 0!==i?i:void 0,CategoryID:null!==(s=e.categoryID)&&void 0!==s?s:void 0,BrandAccessoryID:null!==(c=e.brandAccessoryID)&&void 0!==c?c:void 0,SortBy:null!==(l=e.sortBy)&&void 0!==l?l:void 0,SortDescending:null!==(d=e.sortDescending)&&void 0!==d&&d}})).data},create:async e=>{const r=c(e);return(await o.A.post(n,r,{headers:{"Content-Type":"multipart/form-data"}})).data},update:async(e,r)=>{const a=c(r);return(await o.A.put(i,a,{params:{id:e},headers:{"Content-Type":"multipart/form-data"}})).data}}},1217:(e,r,a)=>{a.d(r,{V:()=>c});var o=a(6753);const t="/common/brand_accessories",n="/common/brand_accessory/create",i="/common/brand_accessory/edit";function s(e){const r=new FormData;return Object.entries(e).forEach((e=>{let[a,o]=e;void 0!==o&&null!==o&&(o instanceof File?r.append(a,o):r.append(a,String(o)))})),r}const c={getBrands:async()=>(await o.A.get(t)).data,createBrand:async e=>{const r=s(e);return(await o.A.post(n,r,{headers:{"Content-Type":"multipart/form-data"}})).data},updateBrand:async e=>{const r=s(e);return(await o.A.put(i,r,{headers:{"Content-Type":"multipart/form-data"}})).data}}},133:(e,r,a)=>{a.d(r,{q:()=>s});var o=a(6931),t=a(6753);const n="/common/bodytypes",i=async()=>(await t.A.get(n)).data,s=()=>{const{data:e,isLoading:r,isFetching:a,isError:t,error:n,refetch:s}=(0,o.I)({queryKey:["body-types"],queryFn:async()=>await i(),staleTime:3e5,retry:1});return{bodyTypes:null!==e&&void 0!==e?e:[],loading:r||a,error:t?n:null,refetch:s}}}}]);
//# sourceMappingURL=982.1d463c9e.chunk.js.map