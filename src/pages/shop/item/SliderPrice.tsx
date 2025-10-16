import React, { useState, ChangeEvent, FocusEvent } from 'react';
import styled from 'styled-components';

const SliderInput = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 4px;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 13px;
    height: 13px;
    background: #3b82f6;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
      background: #2563eb;
      transform: scale(1.1);
    }
  }

  &::-moz-range-thumb {
    width: 13px;
    height: 13px;
    background: #3b82f6;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
      background: #2563eb;
      transform: scale(1.1);
    }
  }
`;

const NumberInput = styled.input`
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type=number] {
    -moz-appearance: textfield;
  }
`;
interface PriceProps{
  setCost:(cost:number)=>void
  item:string|number,
}
export const CustomPriceSlider: React.FC<PriceProps> = React.memo(({setCost,item}) => {
  const [price, setPrice] = useState<number>(0);

  const formatPrice = (value: string): number => {
    // Loại bỏ các ký tự không phải số
    const numericValue = value.replace(/[^\d]/g, '');
    
    // Nếu chuỗi rỗng hoặc chỉ chứa các số 0
    if (!numericValue || /^0+$/.test(numericValue)) {
      return 0;
    }

    // Nếu số bắt đầu bằng 0, loại bỏ các số 0 đứng đầu
    const cleanValue = numericValue.replace(/^0+/, '');
    
    return Number(cleanValue);
  };

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = formatPrice(e.target.value);
    // Giới hạn giá trị trong khoảng 0-2000
    const clampedValue = Math.min(Math.max(val, 0), 2000);
    setPrice(clampedValue);
    setCost(clampedValue)
  };

  const handleNumberInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = formatPrice(e.target.value);
    // Giới hạn giá trị trong khoảng 0-2000
    const clampedValue = Math.min(Math.max(val, 0), 2000);
    setPrice(clampedValue);
    setCost(clampedValue)
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    // Đảm bảo giá trị nằm trong khoảng cho phép
    if (value < 0) {
      setPrice(0);
      setCost(0)
    } else if (value > 2000) {
      setPrice(2000);
      setCost(2000)
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white py-6 px-3 rounded-lg shadow-lg border border-gray-300 hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-center w-full mb-4">
        <h3 className="text-sm 2xl:text-base  font-medium text-gray-600 md:text-xs w-2/3">Price Range</h3>
        <div className="inline-flex items-center space-x-1 w-1/3 overflow-hidden">
          <span className="text-lg font-bold text-blue-600">$</span>
          <NumberInput
            className="text-lg w-16 font-bold text-blue-600 text-start  md:text-sm 2xl:text-lg focus:outline-none"
            type="text"
            value={price}
            min="0"
            max="2000"
            onChange={handleNumberInputChange}
            onBlur={handleBlur}
          />
        </div>
      </div>
        
      <div className="relative pt-2">
        <SliderInput
          type="range"
          min="0"
          max="2000"
          value={price}
          onChange={handlePriceChange}
          className="mb-2"
        />
          
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-500">$0</span>
          <span className="text-sm text-gray-500">$2000</span>
        </div>
      </div>
    </div>
  );
});