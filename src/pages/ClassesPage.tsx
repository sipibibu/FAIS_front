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
      const response_s = await axiosInstance.get("/api/Account/GetPersons?role=schoolKid", {
        headers: { authorization: `Bearer ${token}` },
      });
      const parse_data_k = response_s.data.data.map((qwe: string)  => JSON.parse(qwe));
      setStudents(parse_data_k);

      const response_t = await axiosInstance.get(`/api/Account/GetPersons?role=teacher`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const parse_data_t = response_t.data.data.map((qwe: string)  => JSON.parse(qwe));
      setTeachers(parse_data_t);

      const response = await axiosInstance.get("/api/Class/GetClasses", {
        headers: { authorization: `Bearer ${token}` },
      });
      const parse_response = response.data.data.map((qwe: string)  => JSON.parse(qwe))
      console.log(parse_response)
      setClasses(parse_response);
      setFetching(false);
    };
    fetchClasses();
    
  }, []);
  console.log(teachers)
  const CreateClassModal = () => {
    const form = useForm({
      initialValues: {
        Title: "",
        TeacherId: "",
        StudentIds: [] as string[],
      },
    });
    const createClass = async () => {

      let asd={
        Title: form.values.Title,
        SchoolKidIds: form.values.StudentIds,
        TeacherId: form.values.TeacherId,
        SchoolKids: [],
        $type:"Class"
      }
      const response = await axiosInstance.post(`/api/Class/CreateClass?_class=${JSON.stringify(asd)}`,
      {},
      { headers: { authorization: `Bearer ${token}` } }
      );
      const response_parse=(JSON.parse(response.data.data))
      //const response_parse = Js
      if (response.data.statusCode === 200) {
        showNotification({
          title: "Успешно",
          message: "Класс создан",
          color: "teal",
        });
        setClasses((cl) => [...cl, response_parse]);
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
          value={form.values.Title}
          onChange={(event) =>
            form.setFieldValue("Title", event.currentTarget.value)
          }
        />
        <Select
            label="Учитель"
            data={teachers.map((teacher: any) => ({ label: teacher.Name, value: teacher.Id }))}
            value={form.values.TeacherId}
            onChange={(value: string) => form.setFieldValue("TeacherId", value)}
          />
        <MultiSelect
          label="Ученики"
          data={students.filter(x => x).map((student: any) => ({ label: student.Name, value: student.Id }))}
          value={form.values.StudentIds}
          onChange={(values) => form.setFieldValue("StudentIds", values)}
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
  const UpdateClassModal = ({ state }: any) => {
    const form = useForm({
      initialValues: {
        Title: state.Title,
        TeacherId: state.TeacherId,
        StudentIds: state.SchoolKidIds,
      },
    });

    let data = {
      $type: "Class",
      Title: form.values.Title,
      TeacherId:form.values.TeacherId,
      SchoolKidIds:form.values.StudentIds,

    }
    Object.assign(state, data)
    const updateClass = async () => {
      
      const response = await axiosInstance.put(
        `/api/Class/UpdateClass?classJson=${JSON.stringify(state)}`,
        { headers: { authorization: `Bearer ${token}` } }
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
            if (obj.id === response.data.data.Id)
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
          value={form.values.Title}
          onChange={(event) =>
            form.setFieldValue("Title", event.currentTarget.value)
          }
        />
        <Select
          label="Учитель"
          data={teachers.map((teacher: any) => ({
            value: teacher.Id,
            label: teacher.Name,
          }))}
          value={form.values.TeacherId}
          onChange={(value: string) => form.setFieldValue("TeacherId", value)}
        />
        <MultiSelect
          label="Ученики"
          data={students.map((student: any) => ({
            value: student.Id,
            label: student.Name,
          }))}
          value={form.values.StudentIds}
          onChange={(values) => form.setFieldValue("StudentIds", values)}
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

      setClasses(classes.filter((cl) => cl.Id !== classId));

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
          { accessor: "Title", title: "№" },
          {
            accessor: "TeacherId",
            title: "Учитель",
            width: 400,
            render: (record) => {
              record=(record)
              return (
                teachers.find((teacher: any) => teacher.Id === record.TeacherId)
                  ?.Name || "-"
              );
            },
          },
          {
            accessor: "SchoolKidIds",
            title: "Кол-во учеников",
            render: (record) => record.SchoolKidIds?.length,
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
                    deleteClass(record.Id);
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
