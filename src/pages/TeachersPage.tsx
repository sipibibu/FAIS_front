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
  const [userData, setUserData] = useState<any[]>([]);
  useEffect(() => {
    const fetchTeachers = async () => {
      const response = await axiosInstance.get(`/api/Account/GetPersons?role=teacher`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const parse_data = response.data.data.map((qwe: string)  => JSON.parse(qwe));
      console.log(parse_data)
      setTeachers(parse_data);
      setFetching(false);
    };
    
    fetchTeachers();
  }, []);

  

  const handleButtonClick = async (record: { UserId: any; }) => {
    const result = await axiosInstance.get(
      `/api/Account/GetUser?userId=${record.UserId}`,
      { headers: { authorization: `Bearer ${token}` } }
    );
    setUserData((prevState) => ({
      ...prevState,
      [record.UserId]: JSON.parse(result.data.data),
    }));
  };

  const deleteTeacher = async (teacherId: string) => {
    
    const response = await axiosInstance.delete(`/api/Account/DeletePerson?personId=${teacherId}`,
    { headers: { authorization: `Bearer ${token}` } })
    
   const response_parse=JSON.parse(response.data.data)
   
    if (response.data.statusCode === 200) {
      showNotification({
        title: "Успешно",
        message: `Учитель удален`,
        color: "teal",
      });

      setTeachers(teachers.filter(t => t.Id !== teacherId));
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
        Name: "",
      },
    });

    const createTeacher = async () => {
      const result = await axiosInstance.post(
        "/api/Account/Register",
        {
          Name: form.values.Name,
          role: "teacher",
        },
        { headers: { authorization: `Bearer ${token}` } }
      );
        let teacher_reg=JSON.parse(result.data.data)
        let teacher_data=JSON.parse(result.data.data).Person
        delete teacher_reg['Person'] 
        teacher_reg['UserId']=teacher_reg['Id']
        delete teacher_reg['Id']
        delete teacher_data['UserId']
        Object.assign(teacher_reg, teacher_data)

      if (result.data.statusCode === 200) {
        setTeachers([...teachers,teacher_reg]);

        showNotification({
          title: "Успешно",
          message: `Данные для входа: ${teacher_reg.Login}:${teacher_reg.Password} `,
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
          value={form.values.Name}
          onChange={(event) =>
            form.setFieldValue("Name", event.currentTarget.value)
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
        Name: props.teacher.Name,
        Login: userData[props.teacher.UserId]?.Login || '',
        Password: userData[props.teacher.UserId]?.Password || '',
      },
    });

    const updateTeacher = async () => {
    
    let data={
        $type:"Teacher",
        Name: form.values.Name,
        role: 'teacher'
      }
      Object.assign(props.teacher, data)
      console.log(props.teacher.UserId,form.values.Login)
      const result = await axiosInstance.put(
        `/api/Account/UpdatePerson?person=${JSON.stringify(props.teacher)}`,
        { headers: { authorization: `Bearer ${token}` } }
      );
      let teacher_data=JSON.parse(result.data.data)

     const result_log = await axiosInstance.put(
       `/api/Account/UpdateUserLogin?userId=${props.teacher.UserId}&login=${form.values.Login}`,
       { headers: { authorization: `Bearer ${token}` } }
     );
     const result_pas = await axiosInstance.put(
      `/api/Account/UpdateUserPassword?userId=${props.teacher.UserId}&password=${form.values.Password}`,
      { headers: { authorization: `Bearer ${token}` } }
    );
    setUserData([])

      if (result.data.statusCode === 200) {
        let index_element=teachers.findIndex(teach=>teach.id ==teacher_data.Id)
        teachers[index_element]=teacher_data
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
          value={form.values.Name}
          onChange={(event) =>
            form.setFieldValue("Name", event.currentTarget.value)
          }
        />
        <TextInput
          label="Логин"
          placeholder="Логин"
          data-autofocus
          value={form.values.Login}
          onChange={(event) =>
            form.setFieldValue("Login", event.currentTarget.value)
          }
        />
        <TextInput
          label="Пароль"
          placeholder="Пароль"
          data-autofocus
          value={form.values.Password}
          onChange={(event) =>
            form.setFieldValue("Password", event.currentTarget.value)
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
          { accessor: "login_pasword", width: 400, title: "login/pasword",render: (record)=>
          <>
           {userData[record?.UserId] ? (
             <div>Логин: {JSON.stringify(userData[record?.UserId].Login)} Пароль: {JSON.stringify(userData[record?.UserId].Password)} </div>
           ) : (
             <Button onClick={() => handleButtonClick(record)} my={1}>
               Посмотреть
             </Button>
           )}
         </>
        },
          { accessor: "Name", width: 400, title: "ФИО" },
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
                    deleteTeacher(record.Id)
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
