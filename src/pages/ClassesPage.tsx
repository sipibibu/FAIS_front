import { useEffect, useState } from "react";
import { axiosInstance } from "../axios";
import { DataTable } from "mantine-datatable";
import {
  ActionIcon,
  Box,
  Button,
  MultiSelect,
  NavLink,
  Select,
  TextInput,
} from "@mantine/core";
import { Group } from "@mantine/core";
import { closeAllModals, openModal } from "@mantine/modals";
import { IconEdit, IconTrash } from "@tabler/icons";
import { useRecoilValue } from "recoil";
import { userAtom } from "../store";
import { useNavigate } from "react-router-dom";
import { useForm } from "@mantine/form";
import { IDish } from "../types";
import { showNotification } from "@mantine/notifications";

export const ClassesPage = () => {
  const token: string | null = localStorage.getItem("token");
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const user: any = useRecoilValue(userAtom);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      const response_s = await axiosInstance.get("/api/Account/GetSchoolKids", {
        headers: { authorization: `Bearer ${token}` },
      });
      setStudents(response_s.data.data);

      const response_t = await axiosInstance.get("/api/Account/GetTeachers", {
        headers: { authorization: `Bearer ${token}` },
      });
      setTeachers(response_t.data.data);

      const response = await axiosInstance.get("/api/Class/GetClasses", {
        headers: { authorization: `Bearer ${token}` },
      });
      setClasses(response.data.data);
      setFetching(false);
    };
    fetchClasses();
    
    //console.log(teachers, classes);
  }, []);

  const CreateClassModal = () => {
    const form = useForm({
      initialValues: {
        title: "",
        teacherId: "",
        studentIds: [] as string[],
      },
    });

    const createClass = async () => {
      const response = await axiosInstance.post("/api/Class/CreateClass", {
        title: form.values.title,
        schoolKidIds: form.values.studentIds,
        teacherId: form.values.teacherId,
        schoolKids: [],
      });
      console.log(form.values)
      console.log(response)
      if (response.data.statusCode === 200) {
        showNotification({
          title: "Успешно",
          message: "Класс создан",
          color: "teal",
        });
        setClasses((cl) => [...cl, response.data.data]);
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
      <form onSubmit={form.onSubmit(createClass)}>
        <TextInput
          label="Наименование"
          placeholder="Наименование"
          data-autofocus
          value={form.values.title}
          onChange={(event) =>
            form.setFieldValue("title", event.currentTarget.value)
          }
        />
        <Select
          label="Учитель"
          data={teachers.map((teacher: any) => ({
            value: teacher.id,
            label: teacher.name,
          }))}
          value={form.values.teacherId}
          onChange={(value: string) => form.setFieldValue("teacherId", value)}
        />
        <MultiSelect
          label="Ученики"
          data={students.map((student: any) => ({
            value: student.id,
            label: student.name,
          }))}
          value={form.values.studentIds}
          onChange={(values) => form.setFieldValue("studentIds", values)}
        />
        <Button type="submit" fullWidth mt="md">
          Создать
        </Button>
      </form>
    );
  };

  interface Props {
    state: any;
  }
  const UpdateClassModal = ({ state }: Props) => {
    const form = useForm({
      initialValues: {
        title: state.title,
        teacherId: state.teacherId,
        studentIds: state.schoolKidIds,
      },
    });

    const updateClass = async () => {
      const response = await axiosInstance.put(
        `/api/Class/UpdateClass?classId=${state.id}`,
        {
          title: form.values.title,
          schoolKidIds: form.values.studentIds,
          teacherId: form.values.teacherId,
          schoolKids: [],
        }
      );

      if (response.data.statusCode === 200) {
        // setClasses((cl) => [...cl, response.data.data]);
        
        showNotification({
          title: "Успешно",
          message: "Информация обновлена",
          color: "teal",
        });

        setClasses((prev: any[]) =>
          prev.map((obj) => {
            if (obj.id === response.data.data.id)
              return { ...obj, ...response.data.data };
            return obj;
          })
        );
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
      <form onSubmit={form.onSubmit(updateClass)}>
        <TextInput
          label="Наименование"
          placeholder="Наименование"
          data-autofocus
          value={form.values.title}
          onChange={(event) =>
            form.setFieldValue("title", event.currentTarget.value)
          }
        />
        <Select
          label="Учитель"
          data={teachers.map((teacher: any) => ({
            value: teacher.id,
            label: teacher.name,
          }))}
          value={form.values.teacherId}
          onChange={(value: string) => form.setFieldValue("teacherId", value)}
        />
        <MultiSelect
          label="Ученики"
          data={students.map((student: any) => ({
            value: student.id,
            label: student.name,
          }))}
          value={form.values.studentIds}
          onChange={(values) => form.setFieldValue("studentIds", values)}
        />
        <Button type="submit" fullWidth mt="md">
          Обновить
        </Button>
      </form>
    );
  };

  const deleteClass = async (classId: string) => {
    const response = await axiosInstance.delete("/api/Class/DeleteClasses", {
      data: [classId],
      headers: { authorization: `Bearer ${token}` },
    });

    if (response.data.statusCode === 200) {
      showNotification({
        title: "Успешно",
        message: "Класс удален",
        color: "teal",
      });

      setClasses(classes.filter((cl) => cl.id !== classId));

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
    <>
      <Button
        onClick={() =>
          openModal({
            title: "Создание класса",
            children: <CreateClassModal />,
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
          { accessor: "title", title: "№" },
          {
            accessor: "teacherId",
            title: "Учитель",
            width: 400,
            render: (record) => {
              return (
                teachers.find((teacher: any) => teacher.id === record.teacherId)
                  ?.name || "-"
              );
            },
          },
          {
            accessor: "schoolKids",
            title: "Кол-во учеников",
            render: (record) => record.schoolKids?.length,
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
                      title: "Редактирование класса",
                      children: <UpdateClassModal state={record} />,
                    });
                  }}
                >
                  <IconEdit size={16} />
                </ActionIcon>

                <ActionIcon
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteClass(record.id);
                  }}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
        records={classes}
        rowExpansion={{
          content: ({ record }) => (
            <>
              <Box>
                {record.schoolKids?.length > 0 &&
                  record.schoolKids
                    .filter((x: any) => x)
                    .map((student: any, key: number) => (
                      <NavLink
                        key={student.id}
                        label={
                          <Group position="apart">
                            {key + 1}. {student?.name}
                          </Group>
                        }
                        onClick={() =>
                          user.role === "admin" &&
                          navigate(`/students/${student.id}`, {
                            state: { kid: student },
                          })
                        }
                      />
                    ))}
              </Box>
            </>
          ),
        }}
      />
    </>
  );
};
