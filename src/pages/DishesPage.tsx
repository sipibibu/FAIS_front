import {
  Button,
  FileInput,
  NumberInput,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { IDish } from "../types";
import { AxiosResponse } from "axios";
import { useForm } from "@mantine/form";
import { closeAllModals, openModal } from "@mantine/modals";
import { DishComponent } from "../components";
import { showNotification } from "@mantine/notifications";
import { axiosInstance } from "../axios";
import FormData from "form-data";

interface DishProps {
  Id: string;
  Title: string;
  Description: string;
  Orice: number;
  ImageId?: string;
} 

export const DishesPage: React.FC = () => {
  const token = localStorage.getItem("token");
  const [dishes, setDishes] = useState<DishProps[]>([]);
  const handleDeleteDish = (id: string) => {
    setDishes(dishes.filter((dish) => dish.Id !== id));
  };
  const handleSaveDish = (obj_now:any) => {
    let index_element=dishes.findIndex(dish=>dish.Id ==obj_now.id)
    dishes[index_element]=obj_now
    setDishes([...dishes])
  };
  useEffect(() => {
    const fetchData = async () => {
      const response: AxiosResponse = await axiosInstance.get(`/api/Dishes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const parse_data = response.data.data.map((qwe: string)  => JSON.parse(qwe));
      console.log(parse_data)
      setDishes(parse_data);
    };
    fetchData();
  }, []);
  const FormModal = () => {
    const [image, setImage] = useState<File | null>(null);
    const form = useForm({
      initialValues: {
        Title: "",
        Description: "",
        Price: 0,
      },
    });
    const saveDish = async () => {
      let ImageId = null;
      if (image) {
        console.log(image)
        const data = new FormData();
        data.append("uploadedFile", image, image?.name);
        const imageResult = await axiosInstance.post("/api/FileUpload", data, {
          headers: { authorization: `Bearer ${token}` },
        });
        console.log(imageResult)
          
        if (imageResult.data.statusCode === 200)
          ImageId = imageResult.data.data;
      }
      
      const result: AxiosResponse = await axiosInstance.post(
        `/api/Dishes`,
        {
          Title: form.values.Title,
          Price: form.values.Price,
          ImageId,
          Description: form.values.Description,
          $type:"Dish"
          },
        {
          headers: {
            'Content-Type': 'application/json',
            'accept': 'text/plain',
            Authorization: `Bearer ${token}`,
          },
        }
      );  
      console.log(JSON.parse(result.data.data))
        
      if (result.status === 200) {
        setDishes([...dishes, JSON.parse(result.data.data)]);
        showNotification({
          title: "Успешно",
          message: "Блюдо создано",
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
      
    };
    return (
      <form onSubmit={form.onSubmit(saveDish)}>
        <TextInput
          label="Название"
          placeholder="Название"
          data-autofocus
          value={form.values.Title}
          onChange={(event) =>
            form.setFieldValue("Title", event.currentTarget.value)
          }
        />
        <Textarea
          label="Описание"
          placeholder="Описание"
          value={form.values.Description}
          onChange={(event) =>
            form.setFieldValue("Description", event.currentTarget.value)
          }
        />
        <FileInput
          accept=".jpg,.jpeg,.png"
          value={image}
          onChange={setImage}
          label="Изображение"
          placeholder="Выберите файл"
        />
        <NumberInput
          label="Цена"
          defaultValue={0}
          value={form.values.Price}
          onChange={(value: number) => form.setFieldValue("Price", value)}
        />
        <Button type="submit" fullWidth mt="md">
          Сохранить
        </Button>
      </form>
    );
  };
  //dishes.map((dish: any) => (console.log(dish)))
  return (
    <>
      <Button
        my={10}
        onClick={() => {
          openModal({
            title: "Создание блюда",
            children: <FormModal />,
          });
        }}
      >
        Создать
      </Button>
      {dishes &&
        dishes.map((dish: any) => (
          <DishComponent dish={dish} key={dish.Id} onDelete={handleDeleteDish} onSave={handleSaveDish} />
        ))}
    </>
  );
};