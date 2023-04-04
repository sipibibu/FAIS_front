import { useEffect, useState } from "react";
import { axiosInstance } from "../axios";
import { ActionIcon, Box, Button, Group, NavLink, Table, TextInput } from "@mantine/core";
import { closeAllModals, openModal } from "@mantine/modals";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { IconEdit, IconTrash } from "@tabler/icons";
import { DataTable } from "mantine-datatable";

export const StudentsPage = () => {
  const token: string | null = localStorage.getItem("token");
  const [students, setStudents] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetchStudents = async () => {
      const data = await axiosInstance.get("/api/Account/GetSchoolKids", {
        headers: { authorization: `Bearer ${token}` },
      });
      setStudents(data.data.data);
      setFetching(false)
    };

    fetchStudents();
  }, []);

  const deleteStudent = async (studentId: string) => {
    const data = await axiosInstance.delete(`/api/Account/DeleteSchoolKid?id=${studentId}`, { headers: { authorization: `Bearer ${token}` } })

    if (data.data.statusCode === 200) {
      showNotification({
        title: "Успешно",
        message: `Ученик удален`,
        color: "teal",
      });

      setStudents((old) => old.filter((s: any) => s.id !== studentId));

      closeAllModals();
    } else {
      showNotification({
        title: "Произошла ошибка",
        message: "Произошла неизвестная ошибка",
        color: "red",
      });
    }
  }

  const CreateStudentModal = () => {
    const form = useForm({
      initialValues: {
        name: "",
      },
    });

    const createStudent = async () => {
      const data = await axiosInstance.post(
        `/api/Account/CreateSchoolKid?name=${form.values.name}`,
        {
          role: "schoolKid",
        },
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (data.status === 200) {
        console.log(data)
        setStudents([...students, data.data.data])
        showNotification({
          title: "Успешно",
          message: "Ученик создан",
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
      <form onSubmit={form.onSubmit(createStudent)}>
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

  const UpdateStudentModal = (props: any) => {
    const form = useForm({
      initialValues: {
        name: props.student.name,
      },
    });

    const updateStudent = async () => {
      const result = await axiosInstance.put(
        `/api/Account/UpdateSchoolKid?id=${props.student.id}`,
        {
          name: form.values.name,
        },
        { headers: { authorization: `Bearer ${token}` } }
      );

      if (result.data.statusCode === 200) {
        console.log(students)
        console.log(result.data.data)
        let index_element=students.findIndex(student=>student.id ==result.data.data.id)
        students[index_element]=result.data.data
        setStudents([...students])
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
      <form onSubmit={form.onSubmit(updateStudent)}>
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
            title: "Создание ученика",
            children: <CreateStudentModal />,
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
                      title: "Редактирование ученика",
                      children: <UpdateStudentModal student={record} />,
                    });
                  }}
                >
                  <IconEdit size={16} />
                </ActionIcon>

                <ActionIcon
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteStudent(record.id)
                  }}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
        records={students}
      />


      
    </>
  );
};
