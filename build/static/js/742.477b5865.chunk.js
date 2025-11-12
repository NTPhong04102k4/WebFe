"use strict";(self.webpackChunkwebapp=self.webpackChunkwebapp||[]).push([[742],{9742:(e,i,r)=>{r.r(i),r.d(i,{default:()=>D});var n=r(5043),t=r(4858),a=r(8403),l=r(5464),s=r(2961),o=r(184),d=r(899);const u=/^[A-Za-z\xc0-\u1ef9\xe0-\u1ef9\s]+$/,h=d.Ik({firstName:d.Yj().trim().required("Vui l\xf2ng nh\u1eadp t\xean").matches(u,"T\xean ch\u1ec9 \u0111\u01b0\u1ee3c ch\u1ee9a ch\u1eef c\xe1i v\xe0 kho\u1ea3ng tr\u1eafng"),lastName:d.Yj().trim().required("Vui l\xf2ng nh\u1eadp h\u1ecd").matches(u,"H\u1ecd ch\u1ec9 \u0111\u01b0\u1ee3c ch\u1ee9a ch\u1eef c\xe1i v\xe0 kho\u1ea3ng tr\u1eafng"),username:d.Yj().trim().required("Vui l\xf2ng nh\u1eadp t\xean \u0111\u0103ng nh\u1eadp").matches(/^[A-Za-z0-9]{8,}$/,"T\xean \u0111\u0103ng nh\u1eadp ph\u1ea3i c\xf3 \xedt nh\u1ea5t 8 k\xfd t\u1ef1 v\xe0 ch\u1ec9 bao g\u1ed3m ch\u1eef v\xe0 s\u1ed1"),identityNumber:d.Yj().trim().required("Vui l\xf2ng nh\u1eadp m\xe3 \u0111\u1ecbnh danh c\xe1 nh\xe2n").matches(/^(\d{9}|\d{12})$/,"M\xe3 \u0111\u1ecbnh danh ph\u1ea3i g\u1ed3m 9 ho\u1eb7c 12 ch\u1eef s\u1ed1"),phone:d.Yj().trim().required("Vui l\xf2ng nh\u1eadp s\u1ed1 \u0111i\u1ec7n tho\u1ea1i").matches(/^(0|\+84)(3|5|7|8|9)\d{8}$/,"S\u1ed1 \u0111i\u1ec7n tho\u1ea1i ph\u1ea3i theo \u0111\u1ecbnh d\u1ea1ng Vi\u1ec7t Nam"),dateOfBirth:d.Yj().required("Vui l\xf2ng ch\u1ecdn ng\xe0y sinh").test("is-valid-date","Ng\xe0y sinh kh\xf4ng h\u1ee3p l\u1ec7",(e=>{if(!e)return!1;const i=new Date(e);return!Number.isNaN(i.getTime())})).test("is-not-future","Ng\xe0y sinh kh\xf4ng \u0111\u01b0\u1ee3c \u1edf t\u01b0\u01a1ng lai",(e=>!!e&&new Date(e)<=new Date)).test("is-at-least-18","B\u1ea1n ph\u1ea3i \u0111\u1ee7 18 tu\u1ed5i",(e=>{if(!e)return!1;const i=new Date(e),r=new Date;return i<=new Date(r.getFullYear()-18,r.getMonth(),r.getDate())})),image:d.gl().nullable().optional()}).required();var c=r(579);const m=l.Ay.div`
  min-height: calc(100vh - 160px);
  background: linear-gradient(135deg, #050b2b 0%, #0a1542 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
`,p=l.Ay.div`
  width: 100%;
  max-width: 720px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 36px;
  color: #fff;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
`,g=l.Ay.h1`
  font-size: 28px;
  margin-bottom: 12px;
  font-weight: 600;
`,x=l.Ay.p`
  font-size: 15px;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 28px;
`,f=l.Ay.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px 24px;
`,v=l.Ay.label`
  display: flex;
  flex-direction: column;
  gap: 10px;
`,b=l.Ay.span`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  text-transform: uppercase;
  letter-spacing: 0.04em;
`,j=l.Ay.span`
  font-size: 13px;
  color: #ff8383;
`,y=l.Ay.input`
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: ${e=>{let{$readOnly:i}=e;return i?"rgba(255, 255, 255, 0.08)":"rgba(5, 11, 43, 0.65)"}};
  color: #fff;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: rgba(82, 182, 255, 0.85);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.45);
  }
`,N=l.Ay.div`
  grid-column: 1 / -1;
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
`,w=l.Ay.button`
  padding: 12px 22px;
  border-radius: 12px;
  background: #52b6ff;
  color: #050b2b;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(82, 182, 255, 0.35);
  }
`,A=l.Ay.div`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
`,k=l.Ay.div`
  position: relative;
  width: 88px;
  height: 88px;
`,O=l.Ay.img`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
`,B=l.Ay.button`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`,$=l.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`,z=l.Ay.span`
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.6);
`,V=l.Ay.span`
  font-size: 17px;
  font-weight: 600;
`,E=e=>{if(!e)return"";const i=new Date(e);return Number.isNaN(i.getTime())?"":i.toISOString().slice(0,10)},U=(e,i)=>{if(i&&i.trim().length>0)return i;return`https://ui-avatars.com/api/?name=${encodeURIComponent(e||"User")}&background=050b2b&color=fff&size=160`},D=()=>{var e,i,r;const{user:l}=(0,s.A)(),d=(0,n.useRef)(null),u=(0,n.useMemo)((()=>{var e,i,r,n,t,a,s;return{firstName:null!==(e=null===l||void 0===l?void 0:l.firstName)&&void 0!==e?e:"",lastName:null!==(i=null===l||void 0===l?void 0:l.lastName)&&void 0!==i?i:"",username:null!==(r=null===l||void 0===l?void 0:l.username)&&void 0!==r?r:"",identityNumber:null!==(n=null===l||void 0===l?void 0:l.identityNumber)&&void 0!==n?n:"",phone:null!==(t=null===l||void 0===l?void 0:l.phone)&&void 0!==t?t:"",dateOfBirth:null!==(a=E(null===l||void 0===l?void 0:l.dateOfBirth))&&void 0!==a?a:"",image:null!==(s=null===l||void 0===l?void 0:l.image)&&void 0!==s?s:""}}),[l]),{register:D,handleSubmit:S,watch:Y,setValue:q,reset:C,formState:{errors:M}}=(0,t.mN)({resolver:(0,a.t)(h),defaultValues:u,mode:"onBlur"});(0,n.useEffect)((()=>{C(u)}),[u,C]);const R=null!==(e=Y("firstName"))&&void 0!==e?e:"",T=null!==(i=Y("lastName"))&&void 0!==i?i:"",I=Y("image"),L=(0,n.useMemo)((()=>{var e;const i=R.trim(),r=T.trim();return i||r?`${i}${i&&r?" ":""}${r}`:null!==(e=null===l||void 0===l?void 0:l.fullName)&&void 0!==e?e:""}),[R,T,null===l||void 0===l?void 0:l.fullName]),[P,F]=(0,n.useState)(!1),[Z,H]=(0,n.useState)((()=>U(L,"string"===typeof I?I:null===l||void 0===l?void 0:l.image)));(0,n.useEffect)((()=>{P&&H(U(L,null===l||void 0===l?void 0:l.image))}),[P,L,null===l||void 0===l?void 0:l.image]),(0,n.useEffect)((()=>{if(F(!1),!I)return void H(U(L,null===l||void 0===l?void 0:l.image));if("string"===typeof I)return void H(I||U(L,null===l||void 0===l?void 0:l.image));const e=I,i=URL.createObjectURL(e);return H(i),()=>URL.revokeObjectURL(i)}),[I,L,null===l||void 0===l?void 0:l.image]);const X=null!==(r=null===l||void 0===l?void 0:l.email)&&void 0!==r?r:"";return(0,c.jsx)(m,{children:(0,c.jsxs)(p,{children:[(0,c.jsx)(g,{children:"Personal Information"}),(0,c.jsx)(x,{children:"Update your details and profile image."}),(0,c.jsxs)(f,{onSubmit:S((e=>{if(!window.confirm("X\xe1c nh\u1eadn l\u01b0u thay \u0111\u1ed5i h\u1ed3 s\u01a1?"))return C(u),void F(!1);const i={firstName:e.firstName.trim(),lastName:e.lastName.trim(),username:e.username.trim(),fullName:L.trim(),identityNumber:e.identityNumber.trim(),phone:e.phone.trim(),dateOfBirth:e.dateOfBirth,image:e.image instanceof File?e.image:e.image||Z,email:X};console.table(i)})),children:[(0,c.jsxs)(v,{children:[(0,c.jsx)(b,{children:"First Name"}),(0,c.jsx)(y,{...D("firstName"),placeholder:"Enter first name","aria-invalid":!!M.firstName}),M.firstName&&(0,c.jsx)(j,{children:M.firstName.message})]}),(0,c.jsxs)(v,{children:[(0,c.jsx)(b,{children:"Last Name"}),(0,c.jsx)(y,{...D("lastName"),placeholder:"Enter last name","aria-invalid":!!M.lastName}),M.lastName&&(0,c.jsx)(j,{children:M.lastName.message})]}),(0,c.jsxs)(v,{children:[(0,c.jsx)(b,{children:"Username"}),(0,c.jsx)(y,{...D("username"),placeholder:"Enter username","aria-invalid":!!M.username}),M.username&&(0,c.jsx)(j,{children:M.username.message})]}),(0,c.jsxs)(v,{children:[(0,c.jsx)(b,{children:"Full Name"}),(0,c.jsx)(y,{value:L,readOnly:!0,$readOnly:!0})]}),(0,c.jsxs)(v,{children:[(0,c.jsx)(b,{children:"Identity Number"}),(0,c.jsx)(y,{inputMode:"numeric",...D("identityNumber"),placeholder:"Enter identity number","aria-invalid":!!M.identityNumber}),M.identityNumber&&(0,c.jsx)(j,{children:M.identityNumber.message})]}),(0,c.jsxs)(v,{children:[(0,c.jsx)(b,{children:"Email"}),(0,c.jsx)(y,{value:X,readOnly:!0,$readOnly:!0})]}),(0,c.jsxs)(v,{children:[(0,c.jsx)(b,{children:"Phone"}),(0,c.jsx)(y,{inputMode:"tel",...D("phone"),placeholder:"Enter phone number","aria-invalid":!!M.phone}),M.phone&&(0,c.jsx)(j,{children:M.phone.message})]}),(0,c.jsxs)(v,{children:[(0,c.jsx)(b,{children:"Date of Birth"}),(0,c.jsx)(y,{type:"date",...D("dateOfBirth"),"aria-invalid":!!M.dateOfBirth}),M.dateOfBirth&&(0,c.jsx)(j,{children:M.dateOfBirth.message})]}),(0,c.jsx)("input",{ref:d,type:"file",accept:"image/*",style:{display:"none"},onChange:e=>{var i;const r=null===(i=e.target.files)||void 0===i?void 0:i[0];r&&(F(!1),q("image",r,{shouldValidate:!0,shouldTouch:!0}),e.target.value="")}}),(0,c.jsxs)(A,{children:[(0,c.jsxs)(k,{children:[(0,c.jsx)(O,{src:Z,alt:L||"Profile Avatar",onError:()=>{F(!0),q("image",null,{shouldValidate:!0,shouldTouch:!0})}}),(0,c.jsx)(B,{type:"button",onClick:()=>{var e;null===(e=d.current)||void 0===e||e.click()},"aria-label":"Change avatar",children:(0,c.jsx)(o.p5B,{size:24,color:"#fff"})})]}),(0,c.jsxs)($,{children:[(0,c.jsx)(z,{children:"Profile Preview"}),(0,c.jsx)(V,{children:L||"Unnamed User"}),(0,c.jsx)("span",{children:X})]})]}),(0,c.jsx)(N,{children:(0,c.jsx)(w,{type:"submit",children:"Save Changes"})})]})]})})}}}]);
//# sourceMappingURL=742.477b5865.chunk.js.map