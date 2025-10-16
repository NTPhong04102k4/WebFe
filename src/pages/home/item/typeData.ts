import { CarAccessories } from "src/pages/listings/item/detailCar/data";

 type expandItem={
    id:number;
    name:string;
    path:string;
}
 type FeatBrand={
    id:number|string;
    name:string;
    data:expandItem[]|null;
}
 type Brand={
    name:string,
    img:string,
    id:number|string,
}
type Suggest={
    title:string,
    script:string,
    icon:string,
    id:string|number,
}
export interface CarDetail extends CarAccessories{
    name:string,
    img:string,
    script:string,
    speed:string,
    priceRoot:string,
    priceBuy:string,
    status:'Sale'|'Great Price'|'none',
    id:number|string,
    isUsedTime:string,
    brand:string,
}
 type PopularBrand={
    id:string|number,
  
    data:CarDetail[],
}
type OptionSuggest={
    id:number|string,
    title:string,
    script:string,
    icon:string,
    path:string,

  } 
 export  enum StatusCarBlog{
    SOUND='Sound',
    ACCESSORIES="Accessories",
    EXTERIOR='Exterior'
  }
  
  export type Blog={
      img:string,
      script:string,
      // string 
      owner:'admin'|string,
      id:number|string,
      date:Date,
      status:StatusCarBlog,
      name:string
  }
  export type {PopularBrand,OptionSuggest,FeatBrand,Brand,Suggest,expandItem}
  