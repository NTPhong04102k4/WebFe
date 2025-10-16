// hooks/useRevenue.ts
import { useCallback, useMemo } from 'react';
import { REVENUE_DATA, RevenueData } from './data';
import moment from 'moment';

interface RevenueStats {
  totalRevenue: number;
  averageRevenue: number;
  maxRevenue: number;
  minRevenue: number;
  yearOverYearGrowth: number;
}

const itemPerOfDataMonth=9;
const itemPerOfDataYearOrWeek=7;
export const useRevenue = () => {
    const getTransactionInYear = ( year: number ) => {
        return REVENUE_DATA.filter(transactions => moment(transactions.day, 'YY').year() === year)
        
    };
    
    const getTransactionInMonth = ({ year, month }: { year: number; month: number }) => {
        return REVENUE_DATA.filter(transactions => {
            const transactionDate = moment(transactions.day); 
            return transactionDate.year() === year && transactionDate.month() + 1 === month; 
        });
    };
        
    const getTotalRevenue=(data:RevenueData[])=>{
        return  data.reduce((acc,curr)=>acc+curr.value,0)
    }
    const getAverageInYear=(data:RevenueData[])=>{
        const numMonths=12;
        const totalRevenue=getTotalRevenue(data);
        return totalRevenue/numMonths;
    }
    const getMaxRevenue=(data:RevenueData[])=>{
        return Math.max(...data.map(item=>item.value))
    }
    const getMinRevenue=(data:RevenueData[])=>{
        return Math.min(...data.map(item=>item.value))
    }
  
    const getDetailRevenue=(data:RevenueData[])=>{
        if(data===null||undefined) return null;

        const yearInTime=data[0].day.getFullYear();
        const monthInTime=data[0].day.getMonth()+1;
       const numsTransactionInYear=getTransactionInYear(yearInTime);
       const numsTransactionInMonth=getTransactionInMonth({year:yearInTime,month:monthInTime});
       const totalRevenue=getTotalRevenue(data);
       const averageRevenue=getAverageInYear(data);
       const max=getMaxRevenue(data);
       const min=getMinRevenue(data);
       return {
            numsTransactionInMonth,
            numsTransactionInYear,
            totalRevenue,
            averageRevenue,
            max,min
       }
    }
  return {
        getDetailRevenue,
        getAverageInYear,
        getTransactionInMonth,
        getTransactionInYear,
        getMinRevenue,
        getMaxRevenue

  };
};
