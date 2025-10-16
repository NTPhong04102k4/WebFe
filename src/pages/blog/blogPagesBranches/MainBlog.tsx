import moment from "moment";
import React, { useState } from "react";
import { GoArrowUpRight, GoDotFill } from "react-icons/go";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router";
import { DATA_BLOG } from "src/pages/home/item/data";
import { Blog } from "src/pages/home/item/typeData";
import { Categories, DATA_CATEGORIES } from "src/pages/shop/data";
export const MainBodyBlog=React.memo(({data}:{data:Blog[]})=>{
    const [idxSelected,setIdxSelected]=useState<Categories[]>([]);
    const navigate=useNavigate();
    const handleClickAutoParts=(choiceItem:number|string)=>{
        const hasIdx=idxSelected.some(item=>item.id===choiceItem)
        if(hasIdx===true){
            let newIdxSelected=idxSelected.filter(item=>item.id!==choiceItem)
            setIdxSelected(newIdxSelected)
        }
        else {
            const objNewSelected=DATA_CATEGORIES.find(obj=>obj.id===choiceItem)
            if(objNewSelected===undefined){
                return idxSelected;
            }
            let newArrIdxSelected=[...idxSelected,objNewSelected]
             return setIdxSelected(newArrIdxSelected)
        }
    }
    const BlogDetail = (id: number | string) => {
        const dataProps = DATA_BLOG.find(item => item.id === id) ?? DATA_BLOG[0];
        const idxDataBlog=DATA_BLOG.findIndex(item=>item.id===id);
        console.log('idx:',idxDataBlog)
        navigate('/home/blog/all_blogs/details', { 
            state: { 
              dataProps, 
              prev: DATA_BLOG[idxDataBlog > 0 ? idxDataBlog - 1 : 0],
              next: DATA_BLOG[idxDataBlog < DATA_BLOG.length  ? idxDataBlog + 1 : idxDataBlog]
            }
          });
        };
    
    return(
        <div className="bg-white rounded-b-[35px] w-full flex flex-col ">
        <h2 className="text-xl pl-[5%] font-normal font-sans text-black mt-8  ">
      {" "}
      <span className="text-blue-500 ">Home</span>/ Blog
    </h2>
    <h2 className="text-2xl pl-[5%] font-sans font-bold mb-10">
     Blog
    </h2>
    <div className="inline-flex w-full px-[5%]  mb-12">
        <div className="w-[75%] flex flex-col gap-11  mr-[5%]">
            {
                data.map(item=>{
                    const img=item.img?item.img:require('src/assets/images/loading.png')
                    return(
                        <div className="w-full rounded-2xl flex  flex-col hover:shadow-lg shadow-xl transition duration-300">
                            <div className="rounded-2xl w-full h-auto aspect-[7/3] flex bg-cover bg-center hover:brightness-100 flex-col" style={{backgroundImage:`url(${img})`}}>
                                <h2 className="rounded-full w-[100px] cursor-pointer hover:opacity-85 active:scale-95 transition duration-300  p-3 bg-white items-center justify-center flex self-start m-5">{item.status}</h2>

                            </div>
                            
                
                            <h2 className=" inline-flex gap-4 items-center mt-2 ml-2 ">{item.owner.charAt(0).toUpperCase() + item.owner.slice(1)
                            } <GoDotFill size={18} className="text-gray-600" /> <span>{moment(item.date).format('LL')}</span>

                            </h2>
                            <h2 className="pl-2 font-semibold font-sans text-black text-xl 2xl:text-2xl text-ellipsis overflow-hidden mt-3  ">{item.name}</h2>
                            <h3 className="inline-flex text-ellipsis h-auto mb-3 text-base text-black  pl-2">{item.script}</h3>
                            <button onClick={()=>BlogDetail(item.id)} className="inline-flex pl-2 self-start mb-6  items-center gap-2 font-semibold text-[20px] hover:opacity-85  active:scale-95 transition duration-300 active:bg-gray-50">Read More <GoArrowUpRight size={20} className="text-black active:scale-100"/></button>
                        </div>
                    );
                })
            }
        </div>
        <div className=" w-[25%] gap-12 flex flex-col">
            <div className="w-full flex-col rounded-lg border border-gray-400 gap-3 py-4 px-[10%] justify-center items-start  flex ">
                <h2 className="mt-1 mb-1  font-medium font-sans text-lg hover:scale-110 transition duration-300 ">Categories</h2>
        {DATA_CATEGORIES.map((item,index)=> 
            <h3 key={item.id} onClick={()=>handleClickAutoParts(item.id)} className="  text-base font-sans font-normal text-black hover:underline active:scale-95 active:opacity-75 transition duration-300 ">{item.name}</h3>
            )}</div>
            <div className="rounded-lg border min-h-20 border-gray-400 px-[3%] py-4 flex flex-col " >
               <h2 className="font-medium text-black font-sans text-lg 2xl:text-2xl pl-[7%] ">Tags</h2>
               <div className="flex-wrap w-full flex ">
               {idxSelected.map(item=><h3 className="ml-2 mr-1 my-1  hover:scale-95 hover:brightness-110 text-sm 2xl:text-base px-3 py-1 text-gray-900 font-sans font-medium bg-sky-300 rounded-xl items-center justify-center gap-2 flex ">
                    {item.id}
                    <IoClose onClick={()=>handleClickAutoParts(item.id)} size={16} className="text-gray-800 active:scale-95 active:opacity-70  transition duration-200  hover:bg-gray-600 hover:text-white rounded-full flex items-center justify-center "/>
                </h3>)}
               </div>
            </div>
        </div>
    </div>
        </div>
    );
})