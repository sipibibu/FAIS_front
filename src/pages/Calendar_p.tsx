import React, { useEffect, useState } from 'react';
import { Button, Select, MultiSelect,NumberInput  } from '@mantine/core';
import { axiosInstance } from "../axios";
import { useRecoilValue } from 'recoil';
import { userAtom } from '../store';
import { IconMinus } from '@tabler/icons-react';
export const Calendar_p = () => {
  const [month, setMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [menus, setMenus] = useState<any[]>([]);
  const [menusChange, setMenusChange] = useState<string>('');
  const token = localStorage.getItem('token');
  const user: any = useRecoilValue(userAtom);

  const [dishes1, setDishes1] = useState<any>({})

  const weekdays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const numDaysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const [matchingDatesColor, setMatchingDatesColor] = useState<{ [key: string]: string }>({});
  const [Dishes, setDishesData] = useState<{ value: string; label: string; price: number }[]>([]);
  const [kids, setKids] = useState([]);
  const [calendar_dish, setcalendar_dish] = useState<any[]>([]);
  const [highlightedDays, setHighlightedDays] = useState<any>({});
  const [dishselect,setdishselect] = useState<any[]>([]);
  const [fetchDishesTrigger, setFetchDishesTrigger] = useState(false);
  
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
          if (currentArray.Name.slice().sort().toString() === compareArray.Name.slice().sort().toString()) {
            colors[compareDate] = colors[currentDate];
          }
        }
      }
      setMatchingDatesColor(colors);
    };

    fetchDishes();
  }, [dishes1]);

  useEffect(() => {
  const fetchDates = async () => {
  const zxc = await axiosInstance.get(`api/Menu/GetDishesDates?menuId=${menusChange}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(JSON.parse(zxc.data.data))

  setcalendar_dish(JSON.parse(zxc.data.data))



    }
  fetchDates();
  }, [menusChange,fetchDishesTrigger]);


  function convertDates(transformedDataWithDates:any) {
    const startingPoint:any = new Date('2023-05-02');
    const transformedData:any = {};

    for (const date in transformedDataWithDates) {
      const formattedDate = transformedDataWithDates[date].replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$2-$3-$1');
      const currentDate:any = new Date(formattedDate);
      const daysDiff = Math.floor((currentDate - startingPoint) / (1000 * 60 * 60 * 24));
      const originalDate = daysDiff + 2;
      transformedData[originalDate] = transformedDataWithDates[date];
    }
    return transformedData;
  }


  const SaveDateMenu = async ()=>{


  let qwe:any=(Object.keys(highlightedDays))
  setHighlightedDays('')

  let dishDates:any=(Object.keys(convertDates(qwe)))
  dishDates = dishDates.map((str:any) => parseInt(str));
  console.log(dishDates)
  
  for (const dishId of dishselect) {
    
    let zxc=(findDatesByDish(dishId,dishes1))

    let dishDates_qwe=zxc.concat(dishDates)
 
    dishDates_qwe = dishDates_qwe.filter((value:any, index:any, self:any) => {
      return self.indexOf(value) === index;
    });
    console.log(dishDates_qwe)

  const rofl=await axiosInstance.put(
    `api/Menu/SetDishDates?menuId=${menusChange}&dishId=${dishId}`,
    dishDates_qwe,
    {
     headers: {
       Authorization: `Bearer ${token}`,
     },
   }
  );
  }
  setdishselect([])
  setHighlightedDays('')
  //setDishes1(dishes1,)
  setFetchDishesTrigger((prev) => !prev)
  }



  useEffect(() => {
  const transformedData:any = {};
  for (const array of calendar_dish) {
    for (const obj of array) {
      const { Date, MenuId,Dish } = obj;
      if (transformedData[Date]) {
        transformedData[Date].Id.push(Dish.Id)
        transformedData[Date].Name.push(Dish.Title);
        transformedData[Date].MenuIds.push(MenuId);
      } else {
        transformedData[Date] = {
          Date:Date,
          Id:[Dish.Id],
          Name:[Dish.Title],
          MenuIds: [MenuId]
        };
      }
    }
  }

  const startingPoint:any = new Date('2023-05-02');
  const transformedDataWithDates:any = {};
  for (const date in transformedData) {
    const daysToAdd = parseInt(date) - 1;
    const currentDate:any = new Date(startingPoint);
    currentDate.setDate(currentDate.getDate() + daysToAdd);
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    transformedDataWithDates[formattedDate] = transformedData[date];
  }




  setDishes1(transformedDataWithDates)
  }, [calendar_dish]);

  


  const handlePrevMonthClick = () => {
    setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonthClick = () => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const handleDayClick = (day: string) => {
    {(user.role === "admin" || user.role === "canteenEmployee") && (
    setHighlightedDays((prevHighlightedDays:any) => {
      if (prevHighlightedDays[day]) {
        const { [day]: _, ...updatedHighlightedDays } = prevHighlightedDays;
        return updatedHighlightedDays;
      } else {
        return { ...prevHighlightedDays, [day]: 'red' };
      }
    }))}
    setSelectedDay(day);
  };

  function findDatesByDish(dishId:any, data:any) {
    const dates = [];
    for (const date in data) {
      if (data.hasOwnProperty(date)) {
        const dishIds = data[date];
        if (dishIds.Id.includes(dishId)) {
          dates.push(data[date].Date);
        }
      }
    }
    
    return dates;
  }


  const deleteDish = async (dishId:any)=>{
    let qwe:any=(Object.keys(highlightedDays))
    let dishDates:any=(Object.keys(convertDates(qwe)))
    dishDates = dishDates.map((str:any) => parseInt(str));
    console.log(dishDates)

    let zxc=(findDatesByDish(dishId,dishes1))
    let ustal=(zxc.filter((number) => !dishDates.includes(number)))
    await axiosInstance.put(
      `api/Menu/SetDishDates?menuId=${menusChange}&dishId=${dishId}`,
      ustal,
      {
       headers: {
         Authorization: `Bearer ${token}`,
       },
     }
    );
    setFetchDishesTrigger((prev) => !prev)
  }

  const dishesForSelectedDay = selectedDay && dishes1[selectedDay];


  

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: '1' }}>
        <h1>{month.toLocaleString('default', { month: 'long', year: 'numeric' })}</h1>
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '10px' }}>
        <Button onClick={handlePrevMonthClick}>Назад</Button>
        <Button style={{ marginLeft: '10px' }} onClick={handleNextMonthClick}>Вперёд</Button>
        {(user.role === "parent") && (
          <NumberInput
          style={{ marginLeft: '10px', paddingBottom:'20px' }}
            defaultValue={18}
            placeholder="Продлеваем на"
            label="Продлеваем на"
          />
        )}
      </div>
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
                  const borderColor = highlightedDays[date] || '#cccc';

                  const cellWidth = 100 / 7;

                  return (
                    <td
                      key={day}
                      style={{
                        padding: '45px',
                        width: `${cellWidth}%`,
                        height: '100px',
                        border: `2px solid ${borderColor}`,
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
            style={{width: '200px', paddingTop:'50px'}}
            label="Выбор ребёнка"
            placeholder="Нажми"
            data={kids.filter(x => x).map((kid: any) => ({ label: kid.Name, value: kid.Id }))}
          />
          <Button style={{width: '200px'}} onClick={()=>console.log('Успешно,но ждём')}>Сохранить</Button>
          </>
          )}
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
                setdishselect(values)
              }}
            />
                <Button style={{width: '200px'}} 
                onClick={
                  SaveDateMenu
                  }>Сохранить</Button>
              </>
          )}
        {dishesForSelectedDay && (
          <div>

            <h2 style={{ width: '200px' }}>{`Блюда на дату ${selectedDay}`}</h2>
            <table>
              <thead>
                <tr>
                  <th style={{ background: matchingDatesColor[selectedDay] }}>Название</th>
                </tr>
              </thead>
              <tbody>
              {dishesForSelectedDay.Name?.map((dish: any, index: number) => (
  <tr key={dish}>
    <td>{dish}</td>
    {(user.role === "admin" || user.role === "canteenEmployee") && (
    <IconMinus
      onClick={() => deleteDish(dishesForSelectedDay.Id[index])} // Pass the dish ID to deleteDish
      style={{ color: 'red', paddingTop: '5px' }}
    />)}
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
