import { useEffect, useState } from "react";
import { axiosInstance } from "../axios";
import { ActionIcon, Box, Button, Group, MultiSelect, TextInput } from "@mantine/core";
import { closeAllModals, openModal } from "@mantine/modals";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { IconEdit, IconTrash } from "@tabler/icons";
import { DataTable } from "mantine-datatable";

export const ParentsPage = () => {
  const token: string | null = localStorage.getItem("token");
  const [parents, setParents] = useState<any[]>([]);
  const [kids, setKids] = useState([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetchParents = async () => {
      const datak = await axiosInstance.get("/api/Account/GetSchoolKids", {
        headers: { authorization: `Bearer ${token}` },
      });
      setKids(datak.data.data);

      const data = await axiosInstance.get("/api/Account/GetTrustees", {
        headers: { authorization: `Bearer ${token}` },
      });
      setParents(data.data.data);
      setFetching(false)
    };

    fetchParents();
  }, []);
  console.log(parents)
  const deleteParent = async (parentId: string) => {
    const data = await axiosInstance.delete(`/api/Account/DeleteTrustee?id=${parentId}`, { headers: { authorization: `Bearer ${token}` } })
    if (data.data.statusCode === 200) {
      showNotification({
        title: "Успешно",
        message: `Родитель удален`,
        color: "teal",
      });
      setParents(parents.filter((s: any) => s.id !== parentId));
      closeAllModals();
    } else {
      showNotification({
        title: "Произошла ошибка",
        message: "Произошла неизвестная ошибка",
        color: "red",
      });
    }
  }
  

  const CreateParentModal = () => {
    const form = useForm({
      initialValues: {
        name: "",
      },
    });

    const createParent = async () => {
      const result = await axiosInstance.post(
        `/api/Account/Register`,
        {
          name: form.values.name,
          role: "trustee",
        },
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (result.status === 200) {
        console.log(result)
        setParents([...parents,result.data.data.person])
        showNotification({
          title: "Успешно",
          message: `Данные для входа: ${result.data.data.login}:${result.data.data.password} `,
          autoClose: false,
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
      <form onSubmit={form.onSubmit(createParent)}>
        <TextInput
          label="Имя"
          placeholder="Имя"
          data-autofocus
          value={form.values.name}
          onChange={(event) =>
            form.setFieldValue("name", event.currentTarget.value)
          }
        />
        <Button type="submit" fullWidth mt="md">
          Создать
        </Button>
      </form>
    );
  };

  const UpdateParentModal = (props: any) => {
    const [selected, setSelected] = useState(kids.filter((k: any) => props.parent.schoolKidIds?.includes(k.id)).map((k: any) => k.id))
    const form = useForm({
      initialValues: {
        name: props.parent.name,
      },
    });

    const updateParent = async () => {
      const result = await axiosInstance.put(
        `/api/Account/UpdateTrustee?id=${props.parent.id}`,
        {
          name: form.values.name,
          role: "trustee",
          schoolKidIds: selected
        },
        { headers: { authorization: `Bearer ${token}` } }
      );

      if (result.data.statusCode === 200) {

        console.log(parents)
        console.log(result.data.data)
        let index_element=parents.findIndex(parent=>parent.id ==result.data.data.id)
        parents[index_element]=result.data.data
        setParents([...parents])

        showNotification({
          title: "Успешно",
          message: `Данные обновлены`,
          autoClose: false,
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
      <form onSubmit={form.onSubmit(updateParent)}>
        <TextInput
          label="Имя"
          placeholder="Имя"
          data-autofocus
          value={form.values.name}
          onChange={(event) =>
            form.setFieldValue("name", event.currentTarget.value)
          }
        />
        <MultiSelect label="Дети" value={selected} onChange={setSelected} data={kids.map((k: any) => ({ value: k.id, label: k.name }))} />
        <Button
          type="submit"
          fullWidth
          // onClick={() => updateParentKids(props.parent.id)}
          mt="md"
        >
          Сохранить
        </Button>
      </form>
    );
  };

  return (
    <>
      <Button
        onClick={() =>
          openModal({
            title: "Создание родителя",
            children: <CreateParentModal />,
          })
        }
        my={10}
      >
        Создать
      </Button>
      <DataTable
        withBorder
        borderRadius="sm"
        withColumnBorders
        minHeight={100}
        striped
        highlightOnHover
        fetching={fetching}
        columns={[
          // { accessor: "id", title: "ID" },
          {
            accessor: "id",
            title: "ID",
          },
          {
            accessor: "name",
            title: "Имя",
            width: 400,

          },
          {
            accessor: "role",
            title: "Роль",
          },
          {
            accessor: "actions",
            title: "Действия",
            render: (record) => (
              <Group spacing={4} position="apart">
                <ActionIcon
                  color="blue"
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal({
                      title: "Редактирование родителя",
                      children: <UpdateParentModal parent={record} />,
                    });
                  }}
                >
                  <IconEdit size={16} />
                </ActionIcon>

                <ActionIcon
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteParent(record.id)
                  }}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
        records={parents}
      />
    </>
  );
};
