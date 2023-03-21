import { useEffect, useState } from "react";
import { axiosInstance } from "../axios";
import jwtDecode from "jwt-decode";
import axios, { AxiosResponse } from "axios";
import { Card,Image,Text,Group,Badge,Button } from '@mantine/core';
import {DishPage } from "../pages";

let dish: {
  id: string;
  title: string;
  description: string;
  price: number;
  imageId?: string;
}
export const Menus_buffet = () => {
  const token = localStorage.getItem("token")!;
  const user: any = jwtDecode(token);

  const [menus, setMenus] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  useEffect(() => {
    const fetch_Menus_Buffet = async () => {
      const result: AxiosResponse = await axiosInstance.get("api/Menu", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMenus(result.data.data);

      const results = [];
      let arr_imageId=result.data.data[0].dishes.map((id:any)=>id.imageId)
      for (const imageId of arr_imageId) {
        const resultt = await axiosInstance.get(`/api/FileUpload?fileId=${imageId}`);
        results.push(resultt);
      }
      setImages([...images, ...results.map(result => result.data.data)]);
     // setImage(resultt.data.data);
//
     //   console.log(result.data.data[0].dishes.map((id:any)=>id.imageId))
     //   console.log(resultt)
     //   console.log(image)
    };
    
    fetch_Menus_Buffet();
  }, []);

  return (
    <>
      {menus.map((menu) => (
        <div key={menu.id}>
          <div style={{ display: "flex" }}>
            {menu.dishes.map((dish:any) => (
              <Card
                key={dish.id}
                style={{ marginRight: "1rem" }}
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

             <Button variant="light" color="blue" fullWidth mt="md" radius="md">
               Заказать
             </Button>
           </Card>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};