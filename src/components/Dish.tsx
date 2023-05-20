import {
  Badge,
  Button,
  Card,
  Group,
  NumberInput,
  Text,
  Textarea,
  TextInput,
  Image,
  FileInput,
  ActionIcon,
} from "@mantine/core";
import { IDish } from "../types";
import { useForm } from "@mantine/form";
import { AxiosResponse } from "axios";
import { closeAllModals, openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { axiosInstance } from "../axios";
import { useRecoilValue } from "recoil";
import { userAtom } from "../store";
import { useEffect, useState } from "react";
import { IconEdit, IconTrash } from "@tabler/icons";
import FormData from "form-data";

interface Props {
  dish: {
    Id: string;
    Title: string;
    Description: string;
    Price: number;
    ImageId?: string;
  };
  
  onDelete: (id: string) => void;
  onSave: (dish:Props) =>void;
}

export const DishComponent: React.FC<Props> = ({ dish, onDelete, onSave }) => {
  const user: any = useRecoilValue(userAtom);
  const token = localStorage.getItem("token");
  const [image, setImage] = useState("");
  useEffect(() => {
    const fetchImage = async () => {
      const result = await axiosInstance.get(
        `/api/FileUpload?fileId=${dish?.ImageId}`
      );
      
      setImage(result.data.data);
    };
    if (dish?.ImageId) fetchImage();
  }, [dish]);

  const EditDishModal = () => {
    const [newImage, setNewImage] = useState<File | null>(null);
    let localId: string | undefined | null = dish?.ImageId;

    const form = useForm({
      initialValues: {
        Title: dish?.Title,
        Description: dish?.Description,
        Price: dish?.Price,
      },
    });

    const saveDish = async () => {
      if (newImage) {
        const data = new FormData();
        data.append("uploadedFile", newImage, newImage?.name);
        const imageResult = await axiosInstance.post("/api/FileUpload", data, {
          headers: { authorization: `Bearer ${token}` },
        });

        if (imageResult.data.statusCode === 200)
          localId = imageResult.data.data;
      }

      let data=({
          Title: form.values.Title,
          Description: form.values.Description,
          Price: form.values.Price,
          ImageId: localId,
      })

      Object.assign(dish, data);//dish перезаписываем dish датой с новыми данными из модального окна.
      console.log(token)
      const result: AxiosResponse = await axiosInstance.put(
        `/api/Dishes?dishJson=${JSON.stringify(dish)}`,
        {},
        {headers: { Authorization: `Bearer ${token}` }}
      );

      if (result.status === 200) {
        onSave(result.data)
        showNotification({
          title: "Успешно",
          message: "Блюдо сохранено",
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
          value={newImage}
          onChange={setNewImage}
          label="Изображение"
          placeholder="Выберите файл"
        />
        <Button
          color="red"
          my={10}
          onClick={() => {
            localId = null;
          }}
        >
          Удалить изображение
        </Button>

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

  const deleteDish = async (Id?: string) => {

    console.log(dish.Id)
    const result: AxiosResponse = await axiosInstance.delete(//не удаляется
      `/api/Dishes?id=${Id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (result.status === 200) {
      
      onDelete(dish.Id)
      showNotification({
        title: "Успешно",
        message: "Блюдо удалено",
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
    <Card w={800} shadow="sm" my="lg" p="lg" radius="md" withBorder>
      <Card.Section>
        {image && (
          <Image
            src={"data:image/jpeg;charset=utf-8;base64," + image}
            height={160}
          />
        )}
      </Card.Section>
      <Group position="apart" mt="md" mb="xs">
        <Text weight={500}>{dish?.Title}</Text>
        <Badge color="green" variant="light">
          {dish?.Price}₽
        </Badge>
      </Group>

      <Text size="sm" color="dimmed">
        {dish?.Description}
      </Text>

      {user.role === "admin" && (
        <>
          <Button
            onClick={() =>
              openModal({
                title: "Редактирование блюда",
                children: <EditDishModal />,
              })
            }
            variant="light"
            color="blue"
            fullWidth
            mt="md"
            radius="md"
          >
            Редактировать
          </Button>
          <Button
            onClick={() => deleteDish(dish?.Id)}
            variant="light"
            color="red"
            fullWidth
            mt="md"
            radius="md"
          >
            Удалить
          </Button>
        </>
      )}
    </Card>
  );
};
