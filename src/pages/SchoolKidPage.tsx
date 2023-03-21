import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import QRCode from 'qrcode.react';

type Food = {
    id: number;
    name: string;
  };
  
const FOODS: Food[] = [
  { id: 1, name: 'Pizza' },
  { id: 2, name: 'Burger' },
  { id: 3, name: 'Sushi' },
];


export const SchoolkidPage = () => {
  const params = useParams();
  const location = useLocation();
  const token = localStorage.getItem("token");
  
  const [qrData, setQrData] = useState('');
  
  // handleClick function to handle button click
  const handleClick = (foodName: string) => {
    setQrData(foodName);
  };
  
  return (
    <>
      {FOODS.map((food) => (
        <button key={food.id} onClick={() => handleClick(food.name)}>
          {food.name}
        </button>
      ))}
      <QRCode value={qrData} />
    </>
  );
};