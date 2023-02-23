import { useEffect, useState } from "react";
import axios from "axios";
import { axiosInstance } from "../axios";
import {
  ActionIcon,
  Avatar,
  Button,
  FileInput,
  Group,
  MultiSelect,
  Select,
  Table,
  Textarea,
  TextInput,
} from "@mantine/core";
import { NavLink } from "react-router-dom";
import { closeAllModals, openModal } from "@mantine/modals";
import { IDish } from "../types";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { DataTable } from "mantine-datatable";
import { IconEdit, IconTrash } from "@tabler/icons";

export const TeachersPage = () => {
  const token: string | null = localStorage.getItem("token");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      const response = await axiosInstance.get("/api/Account/GetTeachers", {
        headers: { authorization: `Bearer ${token}` },
      });
      setTeachers(response.data.data);
      setFetching(false);
    };
    
    fetchTeachers();
  }, []);
  
  const deleteTeacher = async (teacherId: string) => {
    const data = await axiosInstance.delete(`/api/Account/DeleteTeacher?id=${teacherId}`, { headers: { authorization: `Bearer ${token}` } })

    if (data.data.statusCode === 200) {
      showNotification({
        title: "Успешно",
        message: `Учитель удален`,
        color: "teal",
      });

      setTeachers(teachers.filter(t => t.id !== teacherId));
      console.log(teacherId)
      closeAllModals();
    } else {
      showNotification({
        title: "Произошла ошибка",
        message: "Произошла неизвестная ошибка",
        color: "red",
      });
    }
  }

  const CreateTeacherModal = () => {
    const form = useForm({
      initialValues: {
        name: "",
      },
    });

    const createTeacher = async () => {
      const result = await axiosInstance.post(
        "/api/Account/Register",
        {
          name: form.values.name,
          role: "teacher",
        },
        { headers: { authorization: `Bearer ${token}` } }
      );

      if (result.data.statusCode === 200) {
        setTeachers([...teachers,result.data.data.person]);
        console.log(teachers)
        console.log(result)
        showNotification({
          title: "Успешно",
          message: `Данные для входа: ${result.data.data.login}:${result.data.data.password} `,
          autoClose: false,
          color: "teal",
        });

        //setTeachers((old) => [...old, result.data]);

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
      <form onSubmit={form.onSubmit(createTeacher)}>
        <TextInput
          label="Имя"
          placeholder="Имя"
          data-autofocus
          value={form.values.name}
          onChange={(event) =>
            form.setFieldValue("name", event.currentTarget.value)
          }
        />
        <Button
          type="submit"
          fullWidth
          // onClick={() => updateParentKids(props.parent.id)}
          mt="md"
        >
          Создать
        </Button>
      </form>
    );
  };

  const UpdateTeacherModal = (props: any) => {
    const form = useForm({
      initialValues: {
        name: props.teacher.name,
      },
    });

    const updateTeacher = async () => {
      const result = await axiosInstance.put(
        `/api/Account/UpdateTeacher?id=${props.teacher.id}`,
        {
          name: form.values.name,
          role: 'teacher'
        },
        { headers: { authorization: `Bearer ${token}` } }
      );

      if (result.data.statusCode === 200) {
        console.log(teachers)
        console.log(result.data.data)
        let index_element=teachers.findIndex(teach=>teach.id ==result.data.data.id)
        teachers[index_element]=result.data.data
        setTeachers([...teachers])

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
      <form onSubmit={form.onSubmit(updateTeacher)}>
        <TextInput
          label="Имя"
          placeholder="Имя"
          data-autofocus
          value={form.values.name}
          onChange={(event) =>
            form.setFieldValue("name", event.currentTarget.value)
          }
        />
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
            title: "Создание учителя",
            children: <CreateTeacherModal />,
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
        striped
        highlightOnHover
        fetching={fetching}
        columns={[
          { accessor: "name", width: 400, title: "ФИО" },
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
                      title: "Редактирование учителя",
                      children: <UpdateTeacherModal teacher={record} />,
                    });
                  }}
                >
                  <IconEdit size={16} />
                </ActionIcon>

                <ActionIcon
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTeacher(record.id)
                  }}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
        records={teachers}
      />
    </>
  );
};
