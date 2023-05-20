import React, { useEffect, useState } from 'react';
import { Button, Select, MultiSelect } from '@mantine/core';
import { axiosInstance } from "../axios";
import { useRecoilValue } from 'recoil';
import { userAtom } from '../store';

export const Calendar_p = () => {
  const [month, setMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [menus, setMenus] = useState<any[]>([]);
  const [menusChange, setMenusChange] = useState<string>('');
  const token = localStorage.getItem('token');
  const user: any = useRecoilValue(userAtom);
  let dishes11:any = {
    '2023-05-01': [
      { name: 'Суп' },
      { name: 'Каша' },
      { name: 'Мороженое' },
    ],
    '2023-05-02': [
      { name: 'Суп' },
      { name: 'Каша' },
      { name: 'Мороженое' },
    ],
    '2023-05-03': [
      { name: 'Суп' },
      { name: 'Каша' },
      { name: 'Мороженое' },
      { name: 'Майн' },
      { name: 'Без картинки)' },
    ],
    '2023-05-04': [
      { name: 'Суп' },
      { name: 'Каша' },
      { name: 'Мороженое' },
      { name: 'Майн' },
      { name: 'Без картинки)' },
    ],
    '2023-05-05': [
      { name: 'Суп' },
      { name: 'Каша' },
      { name: 'Мороженое' },
    ],
    '2023-05-06': [
      { name: 'Суп' },
      { name: 'Каша' },
      { name: 'Мороженое' },
    ],
    '2023-05-10': [
      { name: 'Суп' },
      { name: 'Каша' },
      { name: 'Мороженое' },
    ],
    '2023-05-11': [
      { name: 'Суп' },
      { name: 'Каша' },
      { name: 'Мороженое' },
    ],
    '2023-05-08': [
      { name: 'Суп' },
      { name: 'Каша' },
      { name: 'Мороженое' },
      { name: 'Майн' },
      { name: 'Без картинки)' },
    ],
    '2023-05-09': [
      { name: 'Суп' },
      { name: 'Каша' },
      { name: 'Мороженое' },
      { name: 'Майн' },
      { name: 'Без картинки)' },
    ],
    '2023-05-12': [
      { name: 'Суп' },
      { name: 'Каша' },
      { name: 'Мороженое' },
      { name: 'Майн' },
      { name: 'Без картинки)' },
    ],
    '2023-05-13': [
      { name: 'Суп' },
      { name: 'Каша' },
      { name: 'Мороженое' },
      { name: 'Майн' },
      { name: 'Без картинки)' },
    ],
  };

  let dishes2:any = {
    '2023-05-01': [
      { name: 'Суп' },
      { name: 'Каша' },
      { name: 'Мороженое' },
      { name: 'Майн' },
      { name: 'Без картинки)' },
    ],
    '2023-05-02': [
      { name: 'Суп' },
      { name: 'Каша' },
      { name: 'Мороженое' },
    ],
    '2023-05-03': [
      { name: 'Суп' },
      { name: 'Каша' },
      { name: 'Мороженое' },
      { name: 'Майн' },
      { name: 'Без картинки)' },
    ],
    '2023-05-04': [
      { name: 'Суп' },
      { name: 'Каша' },
      { name: 'Мороженое' },
    ],
    '2023-05-05': [
      { name: 'Суп' },
      { name: 'Каша' },
      { name: 'Мороженое' },
      { name: 'Майн' },
      { name: 'Без картинки)' },
    ],
    '2023-05-06': [
      { name: 'Суп' },
      { name: 'Каша' },
      { name: 'Мороженое' },
    ],
        
  }
  const [dishes1, setDishes1] = useState<any>({dishes11})

  const weekdays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const numDaysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const [matchingDatesColor, setMatchingDatesColor] = useState<{ [key: string]: string }>({});
  const [Dishes, setDishesData] = useState<{ value: string; label: string; price: number }[]>([]);
  const [kids, setKids] = useState([]);

  
  useEffect(() => {
    
    const fetchDishes = async () => {
      const result = await axiosInstance.get('api/Menu', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const menu_parse = JSON.parse(result.data.data).filter((item: any) => item.$type !== 'BuffetMenu').map((qwe: string) => qwe);
      setMenus([...menu_parse]);

      const result_d = await axiosInstance.get('/api/Dishes', {
        headers: { authorization: `Bearer ${token}` },
      });
      const parse_data = result_d.data.data.map((qwe: string) => JSON.parse(qwe));
      const dishesData = parse_data.map((dish: any) => ({
        value: dish.Id,
        label: dish.Title,
        price: dish.Price,
      }));
      setDishesData(dishesData);

      if (user.role === "parent"){ 
      const response = await axiosInstance.get(
        `/api/Account/GetPerson?personId=${user.personId}`
      );
      console.log(JSON.parse(response.data.data))
        const response_parse=JSON.parse(response.data.data).SchoolKids
      setKids(response_parse.filter((x: any) => x));
      }
      
      const dates = Object.keys(dishes1);
      const colors: { [key: string]: string } = {};
      let colorIndex = 0;
      const colorPalette = [
        '#F94144',
        '#F3722C',
        '#F8961E',
        '#F9C74F',
        '#90BE6D',
        '#43AA8B',
        '#577590',
        '#277DA1',
        '#0081A7',
        '#003F5C',
      ];

      for (let i = 0; i < dates.length; i++) {
        const currentDate: any = dates[i];
        const currentArray: any = dishes1[currentDate];

        if (!colors[currentDate]) {
          colors[currentDate] = colorPalette[colorIndex++];
          if (colorIndex >= colorPalette.length) {
            colorIndex = 0;
          }
        }
        for (let j = i + 1; j < dates.length; j++) {
          const compareDate = dates[j];
          const compareArray = dishes1[compareDate];

          if (JSON.stringify(currentArray) === JSON.stringify(compareArray)) {
            // Assign the same color to matching dates
            colors[compareDate] = colors[currentDate];
          }
        }
      }
      setMatchingDatesColor(colors);
    };

    fetchDishes();
  }, [token,dishes1]);

  useEffect(() => {
    if(menusChange=='31f9cf77-ca52-46bd-ac05-c33457bdc28c'){
      setDishes1(dishes2)  
    }else{
      setDishes1(dishes11) 
    }
  
}, [menusChange]);

  const handlePrevMonthClick = () => {
    setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonthClick = () => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const handleDayClick = (day: string) => {
    setSelectedDay(day);
  };

  const dishesForSelectedDay = selectedDay && dishes1[selectedDay];
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: '1' }}>
        <h1>{month.toLocaleString('default', { month: 'long', year: 'numeric' })}</h1>
        <Button onClick={handlePrevMonthClick}>Назад</Button>
        <Button style={{ marginLeft: '10px' }} onClick={handleNextMonthClick}>
          Вперёд
        </Button>
        <Select
          label="Выбор Меню"
          placeholder="Нажми"
          data={menus
            .filter((item: any) => item.$type !== 'BuffetMenu')
            .map((menu: any) => ({ label: menu.Title, value: menu.Id }))}
          onChange={(value: string) => {
            setMenusChange(value);
          }}
        />
        <table>
          <thead>
            <tr>
              {weekdays.map((weekday) => (
                <th key={weekday}>{weekday}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(Math.ceil((numDaysInMonth + firstDayOfMonth) / 7))].map((row, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(7)].map((cell, cellIndex) => {
                  const day = rowIndex * 7 + cellIndex - firstDayOfMonth + 2;
                  const date = `${month.getFullYear()}-${(month.getMonth() + 1)
                    .toString()
                    .padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                  const backgroundColor = matchingDatesColor[date] || 'white';
                  const cellWidth = 100 / 7;

                  return (
                    <td
                      key={day}
                      style={{
                        padding: '45px',
                        width: `${cellWidth}%`,
                        height: '100px',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        backgroundColor: backgroundColor,
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        handleDayClick(date);
                      }}
                    >
                      {day > 0 && day <= numDaysInMonth ? day : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ flex: '1', marginTop: '127px', marginLeft: '20px', width: '200px' }}>
      {(user.role === "parent") && (
        <>
            <Select
            style={{width: '200px'}}
            label="Выбор ребёнка"
            placeholder="Нажми"
            data={kids.filter(x => x).map((kid: any) => ({ label: kid.Name, value: kid.Id }))}
          />
          <Button style={{width: '200px'}} onClick={()=>console.log('Успешно,но ждём')}>Сохранить</Button>
          </>
          )}
        {dishesForSelectedDay && (
          <div>
            {(user.role === "admin" || user.role === "canteenEmployee") && (
              <>
            <MultiSelect
              label="Блюда"
              data={(menus
                .find((menu: any) => menu.Id === menusChange)
                ?.DishesIds?.map((dish: any) => {
                  const selectedDish: any = Dishes?.find((dishes1: any) => dishes1?.value === dish);
                  return selectedDish;
                })
                .filter((dish: any) => dish !== null))||[]}
              onChange={(values) => {
                // form.setFieldValue("DishesIds", values)
              }}
            />
                <Button style={{width: '200px'}} onClick={()=>console.log('Успешно,но ждём')}>Сохранить</Button>
              </>
          )}
            <h2 style={{ width: '200px' }}>{`Блюдо на дату ${selectedDay}`}</h2>
            <table>
              <thead>
                <tr>
                  <th style={{ background: matchingDatesColor[selectedDay] }}>Название</th>
                </tr>
              </thead>
              <tbody>
                {dishesForSelectedDay?.map((dish: any) => (
                  <tr key={dish.name}>
                    <td>{dish.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
