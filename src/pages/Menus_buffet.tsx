import { useEffect, useState } from "react";
import { axiosInstance } from "../axios";
import jwtDecode from "jwt-decode";
import axios, { AxiosResponse } from "axios";
import { Card, Image, Text, Group, Badge, Button,Table  } from "@mantine/core";
import {IconPlus ,IconMinus} from "@tabler/icons";
export const Menus_buffet = () => {
  const token = localStorage.getItem("token")!;
  const user: any = jwtDecode(token);

  const [menus, setMenus] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    const fetch_Menus_Buffet = async () => {
      const result: AxiosResponse = await axiosInstance.get("api/Menu", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMenus(result.data.data);

      const results = [];
      let arr_imageId = result.data.data[0].dishes.map((id: any) => id.imageId);
      for (const imageId of arr_imageId) {
        const resultt = await axiosInstance.get(`/api/FileUpload?fileId=${imageId}`);
        results.push(resultt);
      }
      setImages([...images, ...results.map((result) => result.data.data)]);
    };
    
    fetch_Menus_Buffet();
  }, []);

  useEffect(() => {
    const cartData:any = localStorage.getItem("cartData");
    if (cartData) {
      setCartItems(JSON.parse(cartData))
      console.log(JSON.parse(cartData))
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cartData", JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (dish: any) => {
    const existingCartItem = cartItems.find((item) => item.id === dish.id);
    if (existingCartItem) {
      setCartItems(
        cartItems.map((item) =>
          item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        )
        
      );
    } else {
      setCartItems([...cartItems, { ...dish, quantity: 1 }]);
    }
  };


  const handleRemoveItem = (item: any) => {
    const updatedCartItems = cartItems.filter((cartItem) => cartItem.id !== item.id);
    setCartItems(updatedCartItems);
    console.log(updatedCartItems)
  };

  const handleItemChange = (item: any, change: number) => {
    const updatedCartItems = cartItems.map((cartItem) =>
      cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + change } : cartItem
    );

    setCartItems(updatedCartItems);
  };

  const calculateTotal = (items: any[]) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleOrder = () => {
    setCartItems([]);
    localStorage.removeItem("cartData");
  };

  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      <div className="Cards"  style={{ flex: 1, display: "flex", flexWrap: "wrap" }}>
        {menus.map((menu) =>
            menu.dishes.map((dish: any) => (
              <Card
                key={dish.id}
                style={{ marginRight: "1rem", marginBottom: "1rem", maxWidth: "25%" }}
                shadow="sm"
                radius="lg"
              >
                <Card.Section>
                  {images.length > 0 && (
                    <Image
                      src={"data:image/jpeg;charset=utf-8;base64," + images[menu.dishes.indexOf(dish)]}
                      height={260}
                    />
                  )}
                </Card.Section>
                <Group position="apart" mt="md" mb="xs">
                  <Text weight={500}>{dish.title}</Text>
                  <Badge color="pink" variant="light">
                    ₽{dish.price}
                  </Badge>
                </Group>
                  
                <Text size="sm" color="dimmed">
                  {dish.description}
                </Text>
                  
                <Button
                  variant="light"
                  color="blue"
                  fullWidth
                  mt="md"
                  radius="md"
                  onClick={() => handleAddToCart(dish)}
                >
                  Добавить
                </Button>
              </Card>
            ))
        )}
      </div>
{(user.role != "adminnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn") &&(
    <div style={{ marginLeft: "2rem", minWidth: "300px" }}>
      
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
           <tr key={item.name}>
             <td>{item.title}</td>
             <td>{item.price * item.quantity}₽</td>
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

  </div>

)}
</div>
);
};
