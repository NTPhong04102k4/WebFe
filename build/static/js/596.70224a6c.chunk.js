"use strict";(self.webpackChunkwebapp=self.webpackChunkwebapp||[]).push([[596],{5866:(e,t,s)=>{s.r(t),s.d(t,{default:()=>ne});var l=s(5043),i=s(5464),a=s(609),n=s(5051),r=s(1355),o=s(8877),c=s(397),d=s(686),x=s(6833),m=s(3216),f=s(579),p=function(e){return e.GREAT_PRICE="Great Price",e.SALE="Sale",e.NONE="none",e}(p||{});const u=l.memo((e=>{let{data:t,title:s}=e;const[i,a]=(0,l.useState)(0),[u,h]=(0,l.useState)(0),[g,b]=(0,l.useState)([]),[j,w]=(0,l.useState)([]),v=(0,m.Zp)();(0,l.useEffect)((()=>{const e=[{id:0,manufacturer:"SUV",data:t.filter((e=>"SUV"===e.body))},{id:1,manufacturer:"Coupe",data:t.filter((e=>"Coupe"===e.body))},{id:2,manufacturer:"Sedan",data:t.filter((e=>"Sedan"===e.body))},{id:3,manufacturer:"HatchBack",data:t.filter((e=>"HatchBack"===e.body))}];b(e);const s=e[0].data.slice(0,4);w(s)}),[t]);const y=(0,l.useCallback)((e=>{a(e),h(0);const t=g.find((t=>t.id===e));if(t){const e=t.data.slice(0,4);w(e)}}),[g]),N=(0,l.useCallback)((()=>{if(u>0){const e=u-1;h(e);const t=g.find((e=>e.id===i));if(t){const s=4*e,l=t.data.slice(s,s+4);w(l)}}}),[u,i,g]),k=(0,l.useCallback)((()=>{const e=g.find((e=>e.id===i));if(e){const t=Math.ceil(e.data.length/4);if(u<t-1){const t=u+1;h(t);const s=4*t,l=e.data.slice(s,s+4);w(l)}}}),[u,i,g]),C=g.find((e=>e.id===i)),S=C?Math.ceil(C.data.length/4):0,z=0===u,F=u>=S-1;return(0,f.jsxs)("div",{className:"self-center flex flex-col w-full",children:[(0,f.jsx)("h2",{className:"text-4xl text-center font-sans font-bold mt-12 mb-2",children:s}),(0,f.jsx)("div",{className:"flex flex-row justify-center items-center mt-4 px-[90px] w-[90%] border-b-[1px] self-center",children:g.map((e=>(0,f.jsx)("button",{className:"min-w-14 flex justify-center items-center mx-3 pb-3 transition-all duration-300 ease-in-out border-b-[2px] "+(i===e.id?"border-blue-900":"border-transparent"),onClick:()=>y(e.id),"aria-label":`Select ${e.manufacturer}`,children:(0,f.jsx)("h3",{className:"text-sm font-sans font-normal text-[#000]",children:e.manufacturer})},e.id)))}),(0,f.jsxs)("div",{className:"w-[90%] self-center  mt-4",children:[(0,f.jsx)("div",{className:"w-full grid grid-cols-4 h-auto  gap-[9px]",children:j.map((e=>(0,f.jsxs)("div",{className:"h-auto  bg-white border border-gray-200 rounded-lg shadow",children:[(0,f.jsxs)("div",{className:"h-auto aspect-[5/3] w-full bg-cover bg-center relative rounded-t-lg",style:{backgroundImage:`url(${e.img})`},children:[e.status!==p.NONE&&(0,f.jsx)("div",{className:`absolute top-2 left-2 ${e.status===p.SALE?"bg-blue-600":"bg-green-600"} text-white text-xs font-semibold px-2 py-1 rounded`,children:e.status}),(0,f.jsx)("button",{className:"absolute top-2 right-2 bg-white p-2 rounded-full","aria-label":"Bookmark",children:(0,f.jsx)(n.NaU,{size:20})})]}),(0,f.jsxs)("div",{className:"p-4",children:[(0,f.jsx)("h2",{className:"text-lg font-semibold truncate",children:e.name}),(0,f.jsx)("p",{className:"text-sm text-gray-600 truncate",children:e.script}),(0,f.jsx)("hr",{className:"mt-3"}),(0,f.jsxs)("div",{className:"mt-3 flex md:justify-between 2xl:justify-evenly gap-6 items-center text-sm",children:[(0,f.jsxs)("div",{className:"flex flex-col items-center",children:[(0,f.jsx)(r.OqM,{size:20}),(0,f.jsxs)("span",{children:[e.speed.replace("km/h","")," Miles"]})]}),(0,f.jsxs)("div",{className:"flex flex-col items-center",children:[(0,f.jsx)(o.v6k,{size:20}),(0,f.jsx)("span",{children:e.energy})]}),(0,f.jsxs)("div",{className:"flex flex-col items-center",children:[(0,f.jsx)(c.Jf6,{size:20}),(0,f.jsx)("span",{children:e.transmission})]})]}),(0,f.jsx)("hr",{className:"mt-3 mb-3"}),(0,f.jsxs)("div",{className:"md:justify-between 2xl:justify-evenly flex flex-row items-center",children:[(0,f.jsxs)("h2",{className:"text-[#000] text-base font-sans font-semibold",children:[e.priceBuy,"$"]}),(0,f.jsxs)("button",{className:"inline-flex gap-2 p-2 justify-center items-center text-base text-[#0044ff]",onClick:()=>v("/cars/details",{state:{subItem:e}}),children:["View Details ",(0,f.jsx)(x.zny,{size:24,color:"#0044ff"})]})]})]})]},e.id)))}),(0,f.jsxs)("div",{className:"inline-flex  w-full gap-6 self-center mt-12 justify-center",children:[(0,f.jsx)("button",{className:"w-14 h-auto border rounded-lg items-center flex p-2 justify-center\n              "+(z?"opacity-50 cursor-not-allowed":"opacity-100 hover:opacity-80 active:opacity-50"),onClick:N,disabled:z,"aria-label":"Previous page",children:(0,f.jsx)(d.SnO,{size:24,color:"#000"})}),(0,f.jsx)("button",{className:"w-14 h-auto border rounded-lg items-center flex p-2 justify-center\n              "+(F?"opacity-50 cursor-not-allowed":"opacity-100 hover:opacity-80 active:opacity-50"),onClick:k,disabled:F,"aria-label":"Next page",children:(0,f.jsx)(d.dH8,{size:24,color:"#000"})})]})]})]})}));var h=function(e){return e.GREAT_PRICE="Great Price",e.SALE="Sale",e.NONE="none",e}(h||{});const g=l.memo((e=>{let{data:t,title:s}=e;const[i,a]=(0,l.useState)(0),[p,u]=(0,l.useState)([]),g=(0,m.Zp)(),b=(0,l.useMemo)((()=>t.filter((e=>["BMW","Audi","Tesla","Mercedes"].includes(e.brand)))),[t]);(0,l.useEffect)((()=>{const e=4*i,t=b.slice(e,e+4);u(t)}),[i,4,b]);const j=(0,l.useCallback)((()=>{i>0&&a(i-1)}),[i]),w=(0,l.useCallback)((()=>{const e=Math.ceil(b.length/4);i<e-1&&a(i+1)}),[i,b]),v=Math.ceil(b.length/4),y=0===i,N=i>=v-1;return(0,f.jsxs)("div",{className:"self-center flex flex-col w-full",children:[(0,f.jsx)("h2",{className:"text-4xl text-center font-sans font-bold mt-12 mb-2",children:s}),(0,f.jsxs)("div",{className:"w-[90%] self-center mt-4",children:[(0,f.jsx)("div",{className:"w-full grid grid-cols-4 h-auto gap-[9px] transition duration-100 ",children:p.map((e=>(0,f.jsxs)("div",{className:"h-auto bg-white border border-gray-200 rounded-lg shadow",children:[(0,f.jsxs)("div",{className:"h-auto aspect-[5/3] w-full bg-cover bg-center relative rounded-t-lg",style:{backgroundImage:`url(${e.img})`},children:[e.status!==h.NONE&&(0,f.jsx)("div",{className:`absolute top-2 left-2 ${e.status===h.SALE?"bg-blue-600":"bg-green-600"} text-white text-xs font-semibold px-2 py-1 rounded`,children:e.status}),(0,f.jsx)("button",{className:"absolute top-2 right-2 bg-white p-2 rounded-full","aria-label":"Bookmark",children:(0,f.jsx)(n.NaU,{size:20})})]}),(0,f.jsxs)("div",{className:"p-4",children:[(0,f.jsx)("h2",{className:"text-lg font-semibold truncate",children:e.name}),(0,f.jsx)("p",{className:"text-sm text-gray-600 truncate",children:e.script}),(0,f.jsx)("hr",{className:"mt-3"}),(0,f.jsxs)("div",{className:"mt-3 flex md:justify-between 2xl:justify-evenly gap-6 items-center text-sm",children:[(0,f.jsxs)("div",{className:"flex flex-col items-center",children:[(0,f.jsx)(r.OqM,{size:20}),(0,f.jsxs)("span",{children:[e.speed.replace("km/h","")," Miles"]})]}),(0,f.jsxs)("div",{className:"flex flex-col items-center",children:[(0,f.jsx)(o.v6k,{size:20}),(0,f.jsx)("span",{children:e.energy})]}),(0,f.jsxs)("div",{className:"flex flex-col items-center",children:[(0,f.jsx)(c.Jf6,{size:20}),(0,f.jsx)("span",{children:e.transmission})]})]}),(0,f.jsx)("hr",{className:"mt-3 mb-3"}),(0,f.jsxs)("div",{className:"md:justify-between 2xl:justify-evenly flex flex-row items-center",children:[(0,f.jsxs)("h2",{className:"text-[#000] text-base font-sans font-semibold",children:[e.priceBuy,"$"]}),(0,f.jsxs)("button",{className:"inline-flex gap-2 p-2 justify-center items-center text-base text-[#0044ff]",onClick:()=>g("/cars/details",{state:{subItem:e}}),children:["View Details ",(0,f.jsx)(x.zny,{size:24,color:"#0044ff"})]})]})]})]},e.id)))}),(0,f.jsxs)("div",{className:"inline-flex w-full gap-6 self-center mt-12 justify-center",children:[(0,f.jsx)("button",{className:"w-14 h-auto border rounded-lg items-center flex p-2 justify-center\n              "+(y?"opacity-50 cursor-not-allowed":"opacity-100 hover:opacity-80 active:opacity-50"),onClick:j,disabled:y,"aria-label":"Previous page",children:(0,f.jsx)(d.SnO,{size:24,color:"#000"})}),(0,f.jsx)("button",{className:"w-14 h-auto border rounded-lg items-center flex p-2 justify-center\n              "+(N?"opacity-50 cursor-not-allowed":"opacity-100 hover:opacity-80 active:opacity-50"),onClick:w,disabled:N,"aria-label":"Next page",children:(0,f.jsx)(d.dH8,{size:24,color:"#000"})})]})]})]})}));var b=s(3236),j=s(5394);const w=[{nums:"836001000",script:"CARS FOR SALE",id:0},{nums:"738000250",script:"DEALER REVIEWS",id:1},{nums:"100001000",script:"VISITORS PER DAY",id:2},{nums:"238100200",script:"VERIFIED DEALERS",id:3}],v=e=>{let{data:t,title:s=""}=e;return(0,f.jsxs)("div",{className:"flex flex-col md:flex-row pr-[90px] pl-[90px] mt-4 mb-4 pt-16 pb-20 bg-[#f6fbfc]",children:[(0,f.jsx)("div",{className:"w-full md:w-2/5  pr-4 mb-4 md:mb-0",children:(0,f.jsx)("h2",{className:"md:w-[350px] hover:scale-110 duration-300  2xl:w-[400px] md:text-2xl 2xl:text-4xl font-serif font-bold  text-black p-4",children:s})}),(0,f.jsx)("div",{className:"w-full md:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-6",children:t.map((e=>(0,f.jsxs)("div",{className:"flex flex-col hover:scale-105 active:scale-100 duration-500",children:[(0,f.jsx)("img",{src:e.icon,className:"w-16 h-16",alt:`${e.id} icon`}),(0,f.jsx)("h3",{className:" text-xl font-sans text-black font-medium mt-4 mb-3",children:e.title}),(0,f.jsx)("h3",{className:"text-base font-sans font-normal text-black",children:e.script})]},e.id)))})]})},y=()=>{function e(e){const t=Number(e);return t>=1e9?(t/1e9).toFixed(2)+"B":t>=1e6?(t/1e6).toFixed(1)+"M":t>=1e3?(t/1e3).toFixed(1)+"K":t.toString()}return(0,f.jsxs)("div",{children:[(0,f.jsxs)("div",{className:"flex flex-row w-full h-auto min-h-[380px]  aspect-[3/1] flex-1 mt-12",children:[(0,f.jsx)("div",{className:"flex flex-1 bg-center bg-cover ",style:{backgroundImage:`url(${s(4276)})`}}),(0,f.jsxs)("div",{className:"py-[80px] pl-[80px] flex flex-col gap-8 flex-1 bg-[#291f2e] ",children:[(0,f.jsx)("h2",{className:"leading-normal text-[#FFF] font-sans font-bold md:text-3xl md:w-1/2   2xl:text-6xl 2xl:w-[60%] ",children:"Online,in-person, everywhere"}),(0,f.jsx)("h3",{className:"font-sans font-normal md:text-[14px] 2xl:text-xl text-[#FFF] max-w-[80%]",children:"Choose from thousands of vehicles from multiple brands and buy online with Click & Drive, or visit us at one of our dealerships today."}),(0,f.jsxs)("button",{className:"gap-2 rounded-xl border-x border-y border-[#FFF] p-4 flex flex-row justify-center items-center w-1/3",onClick:()=>window.scrollTo({top:0,behavior:"smooth"}),children:[(0,f.jsx)("h2",{className:"text-xl font-bold text-[#FFF] hover:opacity-90 active:opacity-70 opacity-100 duration-500",children:"Get Started"}),(0,f.jsx)(x.zny,{size:24,color:"#FFF"})]})]})]}),(0,f.jsx)("div",{className:"flex flex-row justify-evenly w-full h-auto mt-12 mb-12",children:w.map((t=>(0,f.jsxs)("div",{className:" flex flex-col gap-4",children:[(0,f.jsx)("h2",{className:"text-[#000] text-3xl font-sans font-bold",children:e(t.nums)}),(0,f.jsx)("h3",{className:"font-sans font-normal text-[16px] leading-normal text-[#00]",children:t.script})]},t.id)))})]})},N=e=>{let{data:t}=e;const s=(0,m.Zp)();return(0,f.jsx)("div",{className:"w-[90%] h-auto flex flex-row gap-4 self-center mt-16 ",children:t.map((e=>(0,f.jsxs)("div",{className:`flex flex-1 flex-col pl-[80px] pr-[80px] ${0===Number(e.id)?"bg-[#a7dcff]":"bg-[#fdcaff]"} p-[80px] rounded-xl relative\n            hover:drop-shadow-xl\n          \n          `,children:[(0,f.jsx)("h2",{className:"text-2xl font-sans font-semibold text-[#000] max-w-[230px]",children:e.title}),(0,f.jsx)("h3",{className:"font-sans font-normal text-[16px] mt-4 max-w-[400px] leading-6 ",children:e.script}),(0,f.jsxs)("button",{className:`rounded-lg ${0===Number(e.id)?"bg-blue-800":"bg-[#181818]"} min-h-16 w-[40%] gap-3 p-2 justify-center items-center mt-3 inline-flex opacity-100 hover:opacity-85 active:opacity-70 duration-300`,onClick:()=>{0===e.id?window.scrollTo({top:0,behavior:"smooth"}):s("/sellCar")},children:[(0,f.jsx)("h3",{className:"font-sans font-medium text-xl text-[#FFF] ",children:"Get Started"}),(0,f.jsx)(x.zny,{size:24,color:"#FFF"})]}),(0,f.jsx)("div",{className:"w-[15%] h-auto aspect-[1] bg-contain bg-center right-[60px] flex absolute bottom-[50px]",style:{backgroundImage:`url(${e.icon})`}})]})))})},k=()=>(0,f.jsxs)("div",{className:"inline-flex bg-[#f0fcff] w-full md:pt-12 md:pb-20   flex-1 px-[5%] items-center mt-20",children:[(0,f.jsxs)("div",{className:"flex w-1/2",children:["      ",(0,f.jsx)("div",{className:"bg-center bg-cover rounded-2xl box-shadow self-end w-[90%]  h-auto aspect-[14/11]  ",style:{backgroundImage:`url(${s(4272)})`}})]}),(0,f.jsxs)("div",{className:"flex flex-col w-1/2 gap-6 ",children:[(0,f.jsx)("h2",{className:"font-sans font-bold text-2xl 2xl:text-4xl text-black w-[70%]",children:"Have more questions? Don't hesitate to reach us"}),(0,f.jsx)("h3",{className:"font-sans font-normal md:text-sm 2xl:text-xl text-[#000] w-[40%]",children:"123 Queensberry Street, North Melbourne VIC3051, Australia."}),(0,f.jsxs)("div",{className:"inline-flex gap-6 ",children:[(0,f.jsxs)("h2",{className:"border-2 rounded-3xl border-gray-500 py-2 px-8 justify-center items-center inline-flex cursor-pointer hover:underline duration-75 active:opacity-80 gap-2",children:[(0,f.jsx)(j.scQ,{size:24,color:"#000"})," +76 956 039 999"]}),(0,f.jsxs)("h2",{className:"py-2 px-8 items-center justify-center inline-flex gap-2 border-gray-500 cursor-pointer border-2 rounded-3xl duration-75 active:opacity-80 hover:underline",children:[(0,f.jsx)(n.ep0,{color:"#000",size:24})," ali@boxcars.com"]})]}),(0,f.jsxs)("div",{className:"rounded-xl px-6 py-4 2xl:px-3 2xl:py-6 gap-2 items-center justify-center  cursor-pointer active:opacity-80 duration-300 hover:opacity-95 inline-flex bg-[#050b20] self-start  ",onClick:()=>{window.scrollTo({top:0,behavior:"smooth"})},children:[(0,f.jsx)("h2",{className:" text-base 2xl:text-2xl items-center justify-center flex text-[#fff]",children:"View Started"})," ",(0,f.jsx)(x.zny,{size:24,color:"#fff"})]})]})]});var C=s(4460),S=s(6178),z=s.n(S),F=s(9698);const A=i.Ay.div`
  width: 90%;
  overflow: hidden;
  align-self: center;
  display: flex;
  flex-direction: column;
  margin-top: 16px;
`,E=e=>{let{data:t,title:s}=e;return(0,f.jsxs)(A,{children:[(0,f.jsx)("h2",{className:"text-4xl  font-sans font-bold mt-12 mb-8",children:s}),(0,f.jsx)("div",{className:"w-full h-auto inline-flex gap-[9px]  ",children:t.map((e=>(0,f.jsxs)("div",{className:"h-auto flex-shrink-0 bg-white   relative  ",style:{width:"calc(33.33% - 8px)"},children:[(0,f.jsx)("div",{className:"h-auto aspect-[5/3] w-full bg-cover bg-center relative shadow-md 2xl:shadow-lg  rounded-lg ",style:{backgroundImage:`url(${e.img})`},children:(0,f.jsx)("div",{className:"absolute top-2 left-2 bg-[#fff] text-black text-xs 2xl:text-sm brightness-110  font-semibold px-2 py-1 rounded-lg",children:e.status})}),(0,f.jsxs)("div",{className:"px-3 pt-3 pb-1 inline-flex gap-3 2xl:gap-5 w-full items-center",children:[(0,f.jsx)("h2",{className:"text-lg font-semibold truncate",children:e.owner}),(0,f.jsx)(F.Lnv,{size:27,className:"text-gray-500"}),(0,f.jsx)("p",{className:"text-sm text-gray-600 truncate",children:z()(e.date.toString()).format("LL")})]}),(0,f.jsx)("h2",{className:"font-medium font-sans text-lg 2xl:text-2xl md:h-auto 2xl:h-20 text-[#000] relative  h-auto px-3  justify-between w-full ",children:e.script})]},e.id)))})]})};var G=s(29),T=s(184),O=s(7179),I=s(3002),L=s(2657),D=s(423);const R=e=>{let{label:t,dropdownOpen:s,toggleDropdown:l,closeDropdowns:i,items:a}=e;const n=(0,m.Zp)(),r=a.pages,o=a.path?a.path:"";return(0,f.jsxs)("div",{className:"relative  flex items-center justify-center",children:[(0,f.jsxs)(M,{onClick:()=>n(o),onMouseEnter:l,children:[t," ",(0,f.jsx)(D.q2p,{size:16})]}),s&&(0,f.jsx)($,{onMouseLeave:i,children:r.map((e=>(0,f.jsx)(B,{onClick:()=>{n(e.path),i()},children:e.name},e.name)))})]})},M=i.Ay.h1`
  font-size: 16px;
  font-family: Cambria, Cochin, Georgia, Times, "Times New Roman", serif;
  font-weight: 500;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  position: relative;
  cursor: pointer;
`,$=i.Ay.div`
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  min-width: 160px;
`,B=i.Ay.a`
  padding: 12px 16px;
  text-decoration: none;
  color: #000;
  cursor: pointer;
  &:hover {
    background-color: #f1f1f1;
  }
`,P=l.memo((()=>{const e=(0,m.Zp)(),[t,s]=(0,l.useState)({home:!1,listings:!1,blogs:!1,pages:!1}),i=e=>{s((()=>({listings:e===L.G.LISTINGS,blogs:e===L.G.BLOGS,pages:e===L.G.PAGES,home:e===L.G.HOME})))},a=()=>{s({listings:!1,blogs:!1,pages:!1,home:!1})};return(0,f.jsxs)(H,{children:[(0,f.jsxs)(V,{children:[(0,f.jsx)(W,{children:"BOXCARS"}),(0,f.jsx)(R,{label:"Home",dropdownOpen:t.home,toggleDropdown:()=>i(L.G.HOME),closeDropdowns:a,items:L.W.home}),(0,f.jsx)(R,{label:"Listings",dropdownOpen:t.listings,toggleDropdown:()=>i(L.G.LISTINGS),closeDropdowns:a,items:L.W.listings}),(0,f.jsx)(R,{label:"Blog",dropdownOpen:t.blogs,toggleDropdown:()=>i(L.G.BLOGS),closeDropdowns:a,items:L.W.blog}),(0,f.jsx)(R,{label:"Pages",dropdownOpen:t.pages,toggleDropdown:()=>i(L.G.PAGES),closeDropdowns:a,items:L.W.pages}),(0,f.jsx)(_,{onClick:()=>e("/about"),children:"About"}),(0,f.jsx)(_,{onClick:()=>e("/contact"),children:"Contact"}),(0,f.jsxs)(_,{children:[" ",(0,f.jsx)(I.Jp1,{})," +75 123 456 789"]})]}),(0,f.jsxs)(V,{children:[(0,f.jsxs)(_,{onClick:()=>e("/auth/login"),children:[(0,f.jsx)(T.VGZ,{size:24})," Sign in"]}),(0,f.jsx)(U,{style:{width:130},onClick:()=>e("/login/admin"),children:"Admin"})]})]})})),H=i.Ay.div`
  flex-direction: row;
  display: flex;
  justify-content: space-between;
  width: 90%;
  padding-top: 12px;
  padding-bottom: 12px;
  align-items: center;
`,V=i.Ay.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
`,W=i.Ay.h1`
  font-size: 24px;
  font-family: Cambria, Cochin, Georgia, Times, "Times New Roman", serif;
  font-weight: 600;
  align-self: center;
`,U=i.Ay.button`
  border-radius: 8px;
  padding: 10px 10px 10px 10px;
  font-size: 16px;
  font-weight: 500;
  border-width: 1px 2px 1px 2px;
  border-color: black;
`,_=i.Ay.h1`
  font-size: 16px;
  font-family: Cambria, Cochin, Georgia, Times, "Times New Roman", serif;
  font-weight: 500;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  position: relative;
  cursor: pointer;
`,Z=s.p+"static/media/bgc_title.1880d67230487b88cde6.jpg";var q=s(4276),Y=s(4264);const J=[Z,q,Y],Q=e=>{let{data:t}=e;const s=(0,m.Zp)(),[i,a]=(0,l.useState)(0),n=t;l.useEffect((()=>{const e=setInterval((()=>{a((e=>e<J.length-1?e+1:0))}),5e3);return()=>clearInterval(e)}),[]);const[r,c]=(0,l.useState)(""),[x,p]=(0,l.useState)([]),[u,h]=(0,l.useState)(-1),[g,b]=(0,l.useState)(!1),j=(0,l.useRef)(null),w=(0,l.useRef)(null),v=e=>{const t=e.target.value;c(t),(e=>{const t=O.w.filter((t=>t.name.toLowerCase().includes(e.toLowerCase())||t.body.toLowerCase().includes(e.toLowerCase())));p(t)})(t),h(-1)},y=e=>{requestAnimationFrame((()=>{(e=>{if(w.current){const t=w.current,s=t.children[e];if(s){const e=t.clientHeight,l=t.scrollTop,i=l+e,a=s.offsetHeight,n=s.offsetTop,r=n+a;r>i?t.scrollTop=r-e:n<l&&(t.scrollTop=n)}}})(e)}))},N=e=>{c(`${e.name} - ${e.body}`),p([]),h(-1),b(!1)};return(0,l.useEffect)((()=>{const e=e=>{g&&(e=>{var t;if(g&&0!==x.length)switch(e.key){case"ArrowDown":e.preventDefault(),h((e=>{const t=e===x.length-1?e:e+1;return y(t),t}));break;case"ArrowUp":e.preventDefault(),h((e=>{const t=e<=0?x.length-1:e-1;return y(t),t}));break;case"Enter":e.preventDefault(),u>=0&&u<x.length&&(N(x[u]),s("/cars/details",{state:{subItem:x[u]}}));break;case"Escape":e.preventDefault(),b(!1),null===(t=j.current)||void 0===t||t.blur(),p([])}})(e)};return document.addEventListener("keydown",e),()=>{document.removeEventListener("keydown",e)}}),[u,x,g]),(0,f.jsxs)("div",{className:"flex flex-col items-center justify-center",children:[(0,f.jsx)(P,{}),(0,f.jsxs)(K,{img:J[i],children:[(0,f.jsx)(X,{children:"The World's Largest Used Car Dealership"}),(0,f.jsx)(ee,{children:"Find Your Perfect Vehicle Online"}),(0,f.jsxs)("div",{className:"inline-flex w-full pl-7 pr-7 justify-between bg-transparent",children:[(0,f.jsx)(te,{onClick:()=>{a((e=>e>0?e-1:J.length))},children:(0,f.jsx)(d.SnO,{size:24,color:"#FFF"})}),(0,f.jsx)(te,{onClick:()=>{a((e=>e<J.length?e+1:0))},children:(0,f.jsx)(d.dH8,{size:24,color:"#FFF"})})]}),(0,f.jsx)(se,{children:n.map(((e,t)=>{if(!e)return null;const l=e.data;return(0,f.jsxs)("div",{className:"flex flex-row flex-1 w-full",children:[(0,f.jsxs)(le,{children:[(0,f.jsx)(ie,{onClick:()=>{0===e.id?s("/listings/car_old"):s("/listings/all")},children:l?null===e||void 0===e?void 0:e.name:(null===e||void 0===e?void 0:e.name)+" :"}),l?(0,f.jsx)(T.z44,{size:24,color:"#FFF",className:"cursor-pointer",onClick:()=>{0===e.id?s("/listings/car_old"):s("/listings/all")}}):(0,f.jsxs)("div",{className:"inline-flex 2xl:gap-8 justify-between gap-4 items-center",children:[(0,f.jsx)("p",{className:"font-medium text-[#FFF] text-[18px]",children:"All Prices"}),(0,f.jsxs)("div",{className:"relative",children:[(0,f.jsxs)("div",{className:"border-white border rounded w-auto flex flex-row justify-center items-center",children:[(0,f.jsx)("input",{ref:j,className:"text-[16px] focus:outline-none font-medium bg-transparent p-3 text-white w-full",placeholder:"Search Cars",value:r,onChange:v,onFocus:()=>b(!0),onClick:()=>b(!0)}),(0,f.jsx)("div",{className:"cursor-default mr-3 p-1 hover:scale-105 w-9 transition duration-300 flex items-center justify-center active:scale-95",children:(0,f.jsx)(o.M7W,{size:24,color:"#fff"})})]}),g&&x.length>0&&(0,f.jsx)("div",{ref:w,className:"absolute w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto z-50",children:x.map(((e,t)=>(0,f.jsxs)("div",{className:"p-2 cursor-pointer hover:bg-gray-100 "+(t===u?"bg-blue-100":""),onClick:()=>N(e),onMouseEnter:()=>h(t),children:[e.name," - ",e.body," ",e.priceBuy]},e.id)))})]})]})]}),(0,f.jsx)("div",{className:`${l&&"w-[1px]"} bg-white mt-2 mb-2 h-[80%]`})]},e.id)}))})]})]})},K=i.Ay.div`
  width: 90%;
  margin-right: 90px;
  margin-left: 90px;
  background-image: url(${e=>e.img||q});
  background-position: center;
  background-size: cover;
  display: flex;
  border-radius: 16px 16px 0px 0px;
  aspect-ratio: 8/4;
  height: auto;

  @media screen and (min-width: 1920px) {
    height: 800px;
  }
  flex-direction: column;
  position: relative;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 1px 1px 1px #363636;
  &:hover {
    box-shadow: 0px 1px 2px 2px #363636;
  }

  transition: all 0.3s ease;
`,X=i.Ay.h2`
  font-size: 18px;
  font-family: Cambria, Cochin, Georgia, Times, "Times New Roman", serif;
  font-weight: 400;
  text-align: center;
  align-self: center;
  align-items: center;
  position: absolute;
  top: 150px;
  color: #fff;
`,ee=i.Ay.h1`
  /* font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; */
  font-size: 32px;
  font-weight: 500;
  align-self: center;
  text-align: center;
  position: absolute;
  top: 200px;
  color: #fff;
  font-weight: 700;
`,te=i.Ay.button`
  border-radius: 25px;
  padding: 5px 10px 5px 10px;
  width: 60px;
  height: 40px;
  justify-content: center;
  align-items: center;
  display: flex;
  background-color: #cfc9c9;
`,se=i.Ay.div`
  display: flex;
  flex-direction: row;
  background-color: #050b20;
  height: 96px;
  position: absolute;
  bottom: 0;
  width: 85%;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  @media screen and (min-width: 768px) {
    height: 80px;
  }
  @media screen and (min-width: 1920px) {
    height: 96px;
  }
`,le=i.Ay.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 20px 10px 20px;
  flex: 1;
  min-width: max-content;
  flex-direction: row;
  gap: 16px;
`,ie=i.Ay.h2`
  font-size: 18px;
  font-family: "Times New Roman", Times, serif;
  font-weight: 400;
  color: #ffffff;
  cursor: pointer;
`;var ae=s(816);const ne=l.memo((()=>(0,f.jsxs)(re,{children:[(0,f.jsx)(Q,{data:a.eV}),(0,f.jsx)(b.O,{data:a.Wz,title:"Select a Body Styles"}),(0,f.jsx)(v,{data:a.YN,title:"We're BIG on what matters to you"}),(0,f.jsx)(u,{data:O.w,title:" The Most Searched Cars"}),(0,f.jsx)(N,{data:a.QW}),(0,f.jsx)(g,{data:O.w,title:"Recommended Cars For You"}),(0,f.jsx)(y,{}),(0,f.jsx)(g,{data:O.w,title:"Upcoming Cars"}),(0,f.jsx)(C._x,{data:C.Hc}),(0,f.jsx)(E,{data:a.EU,title:"Latest Blog Posts"}),(0,f.jsx)(b.O,{title:"Explore Our Premium Brands",data:a.fg,detail:!0}),(0,f.jsx)(k,{}),(0,f.jsx)(G.w,{theme:ae.Sx.LIGHT})]}))),re=i.Ay.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`},4276:(e,t,s)=>{e.exports=s.p+"static/media/homepage_onl.93442291f73fd201f4da.png"},4272:(e,t,s)=>{e.exports=s.p+"static/media/more_question.1261c02074646aa152f7.png"}}]);
//# sourceMappingURL=596.70224a6c.chunk.js.map