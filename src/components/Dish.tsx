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
    id: string;
    title: string;
    description: string;
    price: number;
    imageId?: string;
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
        onSave(result.data)
        showNotification({
          title: "??????????????",
          message: "?????????? ??????????????????",
          color: "teal",
        });

        closeAllModals();
      } else {
        showNotification({
          title: "?????????????????? ????????????",
          message: "?????????????????? ?????????????????????? ????????????",
          color: "red",
        });
      }
    };

    return (
      <form onSubmit={form.onSubmit(saveDish)}>
        <TextInput
          label="????????????????"
          placeholder="????????????????"
          data-autofocus
          value={form.values.title}
          onChange={(event) =>
            form.setFieldValue("title", event.currentTarget.value)
          }
        />
        <Textarea
          label="????????????????"
          placeholder="????????????????"
          value={form.values.description}
          onChange={(event) =>
            form.setFieldValue("description", event.currentTarget.value)
          }
        />
        <FileInput
          accept=".jpg,.jpeg,.png"
          value={newImage}
          onChange={setNewImage}
          label="??????????????????????"
          placeholder="???????????????? ????????"
        />
        <Button
          color="red"
          my={10}
          onClick={() => {
            localId = null;
          }}
        >
          ?????????????? ??????????????????????
        </Button>

        <NumberInput
          label="????????"
          defaultValue={0}
          value={form.values.price}
          onChange={(value: number) => form.setFieldValue("price", value)}
        />
        <Button type="submit" fullWidth mt="md">
          ??????????????????
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
      onDelete(dish.id)
      showNotification({
        title: "??????????????",
        message: "?????????? ??????????????",
        color: "teal",
      });

      closeAllModals();
    } else {
      showNotification({
        title: "?????????????????? ????????????",
        message: "?????????????????? ?????????????????????? ????????????",
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
          {dish?.price}???
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
                title: "???????????????????????????? ??????????",
                children: <EditDishModal />,
              })
            }
            variant="light"
            color="blue"
            fullWidth
            mt="md"
            radius="md"
          >
            ??????????????????????????
          </Button>
          <Button
            onClick={() => deleteDish(dish?.id)}
            variant="light"
            color="red"
            fullWidth
            mt="md"
            radius="md"
          >
            ??????????????
          </Button>
        </>
      )}
    </Card>
  );
};
