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
  dish: IDish | null;
}

export const DishComponent = ({ dish }: Props) => {
  const user: any = useRecoilValue(userAtom);
  const token = localStorage.getItem("token");
  const [image, setImage] = useState("");

  useEffect(() => {
    const fetchImage = async () => {
      const result = await axiosInstance.get(
        `/api/FileUpload?fileId=${dish?.imageId}`
      );
      setImage(result.data.data);
    };
    if (dish?.imageId) fetchImage();
  }, [dish]);

  const EditDishModal = () => {
    const [newImage, setNewImage] = useState<File | null>(null);
    let localId: string | undefined | null = dish?.imageId;

    const form = useForm({
      initialValues: {
        title: dish?.title,
        description: dish?.description,
        price: dish?.price,
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

      const result: AxiosResponse = await axiosInstance.put(
        `/api/Dishes/${dish?.id}`,
        {
          title: form.values.title,
          description: form.values.description,
          price: form.values.price,
          imageId: localId,
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
          value={form.values.price}
          onChange={(value: number) => form.setFieldValue("price", value)}
        />
        <Button type="submit" fullWidth mt="md">
          Сохранить
        </Button>
      </form>
    );
  };

  const deleteDish = async (id?: string) => {
    const result: AxiosResponse = await axiosInstance.delete(
      `/api/Dishes/${dish?.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (result.status === 200) {
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
        <Text weight={500}>{dish?.title}</Text>
        <Badge color="green" variant="light">
          {dish?.price}₽
        </Badge>
      </Group>

      <Text size="sm" color="dimmed">
        {dish?.description}
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
            onClick={() => deleteDish(dish?.id)}
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
