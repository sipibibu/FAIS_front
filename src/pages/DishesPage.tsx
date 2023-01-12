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

export const DishesPage = () => {
  const token = localStorage.getItem("token");
  const [dishes, setDishes] = useState<IDish[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result: AxiosResponse = await axiosInstance.get(`/api/Dishes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDishes(result.data);
    };
    fetchData();
  }, []);

  const FormModal = () => {
    const [image, setImage] = useState<File | null>(null);
    const form = useForm({
      initialValues: {
        title: "",
        description: "",
        price: 0,
      },
    });

    const saveDish = async () => {
      let imageId = null;
      if (image) {
        const data = new FormData();
        data.append("uploadedFile", image, image?.name);
        const imageResult = await axiosInstance.post("/api/FileUpload", data, {
          headers: { authorization: `Bearer ${token}` },
        });

        if (imageResult.data.statusCode === 200)
          imageId = imageResult.data.data;
      }

      const result: AxiosResponse = await axiosInstance.post(
        "/api/Dishes",
        {
          title: form.values.title,
          description: form.values.description,
          price: form.values.price,
          imageId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (result.status === 200) {
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

      console.log(result);
    };

    return (
      <form onSubmit={form.onSubmit(saveDish)}>
        <TextInput
          label="Название"
          placeholder="Название"
          data-autofocus
          value={form.values.title}
          onChange={(event) =>
            form.setFieldValue("title", event.currentTarget.value)
          }
        />
        <Textarea
          label="Описание"
          placeholder="Описание"
          value={form.values.description}
          onChange={(event) =>
            form.setFieldValue("description", event.currentTarget.value)
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
          value={form.values.price}
          onChange={(value: number) => form.setFieldValue("price", value)}
        />
        <Button type="submit" fullWidth mt="md">
          Сохранить
        </Button>
      </form>
    );
  };

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
        dishes.map((dish: IDish) => (
          <DishComponent dish={dish} key={dish.id} />
        ))}
    </>
  );
};
