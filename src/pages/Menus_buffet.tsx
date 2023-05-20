import { useEffect, useState } from "react";
import { axiosInstance } from "../axios";
import jwtDecode from "jwt-decode";
import axios, { AxiosResponse } from "axios";
import { Card, Image, Text, Group, Badge, Button,Table,MultiSelect  } from "@mantine/core";
import {IconPlus ,IconMinus} from "@tabler/icons";
import { Modal } from '@mantine/core';
import { closeAllModals, openModal } from '@mantine/modals';
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";



export const Menus_buffet = () => {
  const token = localStorage.getItem("token")!;
  const user: any = jwtDecode(token);

  const [menus, setMenus] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [Dishes, setDishes] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [DishesId, setDishesId] = useState<any[]>([]);

  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchMenusBuffet = async () => {
      const result: AxiosResponse = await axiosInstance.get("api/Menu", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(JSON.parse(result.data.data)) 
      let asd=JSON.parse(result.data.data)
      const menuParse = asd
        .filter((qwe: any) => qwe.$type === "BuffetMenu")
        .map((qwe: any) => qwe);
      setMenus(menuParse);
      const result_d = await axiosInstance.get("/api/Dishes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const parseData = result_d.data.data.map((qwe: string) => JSON.parse(qwe));
      setDishes(parseData);

      
      
      const results = [];
      console.log(parseData)
      let arrImageId = menuParse[0].DishesIds.flatMap((dish: any) => {
        return parseData.filter((dishes:any) => dishes.Id === dish).map((dish:any)=>dish.ImageId)
      });
      console.log(arrImageId)
      for (const imageId of arrImageId) {
        const resultt = await axiosInstance.get(`/api/FileUpload?fileId=${imageId}`);
        results.push(resultt);
      }
      setImages([...images, ...results.map((result) => result.data.data)]);
    };
    
    fetchMenusBuffet();
  }, []);

  useEffect(() => {
    const cartData: any = localStorage.getItem("cartData");
    if (cartData) {
      setCartItems(JSON.parse(cartData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cartData", JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (dish: any) => {
    const existingCartItem = cartItems.find((item) => item.Id === dish[0].Id);
    if (existingCartItem) {
      setCartItems(
        cartItems.map((item: any) =>
          item.Id === dish[0].Id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...dish[0], quantity: 1 }]);
    }
  };

  const handleRemoveItem = (item: any) => {
    const updatedCartItems = cartItems.filter((cartItem) => cartItem.Id !== item.Id);
    setCartItems(updatedCartItems);
  };

  const handleItemChange = (item: any, change: number) => {
    const updatedCartItems = cartItems.map((cartItem) =>
      cartItem.Id === item.Id ? { ...cartItem, quantity: cartItem.quantity + change } : cartItem
    );

    setCartItems(updatedCartItems);
  };

  const calculateTotal = (items: any[]) => {
    return items.reduce((total, item) => total + item.Price * item.quantity, 0);
  };

  const handleOrder = async() => {
    console.log(user)
    let asd={
      MenuId: menus[0].Id,
      SchoolKidId: user.personId,
      DishesIds:cartItems.map((dish:any)=>dish.Id),
      dates:[],
      $type:"Order"
      }
      console.log(asd)
    const data = await axiosInstance.post(`/Post?orderJson=${JSON.stringify(asd)}`, {},
    { headers: { authorization: `Bearer ${token}` } }
    );
    if (data.status === 200) {
      showNotification({
        title: "Успешно",
        message: "Заказ создан",
        color: "teal",
      });

      closeAllModals();
    } else {
      showNotification({
        title: "Произошла ошибка",
        message: "Произошла неизвестная ошибка",
        color: "red",
      });
    }

    setCartItems([]);
    localStorage.removeItem("cartData");


  };
  //menus.map((menu:any)  =>(console.log(menu)))
  
  
  const handleSave = async () => {
    closeAllModals();
    let data={
      Id: menus[0].Id,
      Title: menus[0].Title,
      Description: menus[0].Description,
      TimeToService: menus[0].TimeToService,
      DishesIds: form.values.DishesIds,
      $type:'BuffetMenu'}
    console.log(form.values)
    const result: AxiosResponse = await axiosInstance.put(
      `/api/Menu/?jsonObj=${JSON.stringify(data)}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setMenus([data])
    setIsModalOpen(false);
  };

  
const qwe = () =>{
    setDishesId(menus[0]?.DishesIds)
    form.values.DishesIds=menus[0]?.DishesIds
    setIsModalOpen(true)
  }

const Create_buffet_menu = async() =>{
  let data={
    Title: "Меню буфет",
    Description: "Он единственный такой",
    TimeToService: 0,
    $type:"BuffetMenu"
   }

   const result: AxiosResponse = await axiosInstance.post(
    `/api/Menu?jsonObj=${JSON.stringify(data)}`,
    {},
    { headers: { authorization: `Bearer ${token}` } }
  );
  if (result.status === 200) {
    setMenus([...menus, JSON.parse(result.data.data)])
    showNotification({
      title: "Успешно",
      message: "Меню создано",
      color: "teal",
    });

    closeAllModals();
  } else {
    showNotification({
      title: "Произошла ошибка",
      message: "Произошла неизвестная ошибка",
      color: "red",
    });
  }
}
  const form = useForm({
    initialValues: {
      DishesIds: DishesId,
    },
  });

  menus.map((menu:any) =>
            menu.DishesIds?.map((dish: any) => (console.log(menu))))

  return (
    <div style={{ display: "flex", alignItems: "flex-start", }}>

    <Modal 
    opened={isModalOpen} onClose={() => setIsModalOpen(false)}>
    <MultiSelect 
        label="Блюда"
        data={Dishes.map((dish:any)=>({label: dish.Title, value: dish.Id}))}
        value={form.values.DishesIds} 
        onChange={(values) => {
          console.log(form.values)
          form.setFieldValue("DishesIds", values)
        }}
      />
      <Button onClick={handleSave}>Save</Button>
      <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
    </Modal>

      <div className="Cards"  style={{ flex: 1, display: "flex", flexWrap: "wrap" }}>
      {menus.length === 0 && user.role !== "schoolKid" && (
    <Button onClick={() => Create_buffet_menu()}>Create Menu</Button>
  )}
        {menus.map((menu:any) =>
            menu.DishesIds?.map((dish: any) => (
              <Card
                key={dish}
                style={{ marginRight: "1rem", marginBottom: "1rem", maxWidth: "25%" }}
                shadow="sm"
                radius="lg"
              >
                <Card.Section>
                  {images.length > 0 && (
                    <Image
                      src={"data:image/jpeg;charset=utf-8;base64," + images[menu?.DishesIds?.indexOf(dish)]||images[1]}
                      height={260}
                    />
                  )} 
                </Card.Section>
                <Group position="apart" mt="md" mb="xs">
                  <Text weight={500}>{
                  Dishes
                  .filter((dishes:any) => dishes.Id === dish)
                  .map((dishes:any) => dishes.Title)
                  
                  }</Text>
                  <Badge color="pink" variant="light">
                    { Dishes
                      .filter((dishes:any) => dishes.Id === dish) 
                      .map((dishes:any) => dishes.Price)
                      }₽
                  </Badge>
                </Group>
                  
                <Text size="sm" color="dimmed">
                {
                      Dishes
                      .filter((dishes:any) => dishes.Id === dish) 
                      .map((dishes:any) => dishes.description)
                      }
                </Text>
                {(user.role == "schoolKid") &&(
                <Button
                  variant="light"
                  color="blue"
                  fullWidth
                  mt="md"
                  radius="md"
                  onClick={() => handleAddToCart(Dishes.filter((dishes:any) => dishes.Id === dish) )}
                >
                  Добавить
                </Button>
                )}
              </Card>
            ))
        )}
      </div>
    <div style={{ marginLeft: "2rem", minWidth: "300px", }}>
      {(user.role != "schoolKid") &&(
      <Button onClick={() => qwe()}>Edit Menu</Button>
      )}
      {(user.role == "schoolKid") &&(
        <>
    <h2>Корзина</h2>
    {cartItems.length === 0 ? (
      <p>Корзина пуста</p>
    ) : (
     <>
     <Table >
        <thead>
          <tr>
            <th>Назваение</th>
            <th>цена</th>
            <th>Кол-ов</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        
        <tbody>{
          cartItems.map((item) => (
           <tr key={item.Name}>
             <td>{item.Title}</td>
             <td>{item.Price * item.quantity}₽</td>
             <td>{item.quantity}</td>
             <td>
               <IconPlus onClick={() => handleItemChange(item, 1)}></IconPlus>
               <IconMinus onClick={() => handleItemChange(item, -1)}>-</IconMinus>
              </td>
              <td><Button onClick={() => handleRemoveItem(item)}>Удалить</Button></td>
           </tr>))

          }
        </tbody>
         
      </Table>
        <span>Итого:</span>
        <span>{calculateTotal(cartItems)} ₽</span>  
        <span style={{marginLeft: "20px"}}><Button onClick={ handleOrder}>Заказать</Button></span> 
        </>
    )}
   </> )}
  </div>

</div>
);
};