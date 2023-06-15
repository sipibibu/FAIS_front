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
  const [userData, setUserData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const response = await axiosInstance.get("/api/Account/GetPersons?role=schoolKid", {
        headers: { authorization: `Bearer ${token}` },
      });
      const parse_data = response.data.data.map((qwe: string)  => JSON.parse(qwe));

      setStudents(parse_data);
      setFetching(false)
    };
    
    fetchStudents();
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


  const deleteStudent = async (studentId: string) => {
    const data = await axiosInstance.delete(`/api/Account/DeletePerson?personId=${studentId}`,
     { headers: { authorization: `Bearer ${token}` } })

    if (data.data.statusCode === 200) {
      showNotification({
        title: "Успешно",
        message: `Ученик удален`,
        color: "teal",
      });
      setStudents(students.filter(s => s.Id !== studentId));

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
        Name: "",
      },
    });

    const createStudent = async () => {
      const result = await axiosInstance.post(
        "/api/Account/Register",
        {
          Name: form.values.Name,
          role: "schoolKid",
        },
        { headers: { authorization: `Bearer ${token}` } }
      );

      let schoolKid_reg=JSON.parse(result.data.data)
      let schoolKid_data=JSON.parse(result.data.data).Person  
      delete schoolKid_reg['Person'] 
      schoolKid_reg['UserId']=schoolKid_reg['Id']
      delete schoolKid_reg['Id']
      delete schoolKid_data['UserId']
      Object.assign(schoolKid_reg, schoolKid_data)
      if (result.status === 200) {
        setStudents([...students, schoolKid_reg])
        
        showNotification({
          title: "Успешно",
          message: `Данные для входа: ${schoolKid_reg.Login}:${schoolKid_reg.Password} `,
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
console.log([...students])
    return (
      <form onSubmit={form.onSubmit(createStudent)}>
        <TextInput
          label="Имя"
          placeholder="Имя"
          data-autofocus
          value={form.values.Name}
          onChange={(event) =>
            form.setFieldValue("Name", event.currentTarget.value)
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
        Name: props.student.Name,
        Login: userData[props.student.UserId]?.Login || '',
        Password: userData[props.student.UserId]?.Password || '',
      },
    });

    let data={
      $type:"SchoolKid",
      Name: form.values.Name,
    }


    Object.assign(props.student,data)



    const updateStudent = async () => {


      const result = await axiosInstance.put(
        `/api/Account/UpdatePerson?person=${JSON.stringify(props.student)}`,
        { headers: { authorization: `Bearer ${token}` } }
      );


      let student_data=JSON.parse(result.data.data)

      const result_log = await axiosInstance.put(
        `/api/Account/UpdateUserLogin?userId=${props.student.UserId}&login=${form.values.Login}`,
        { headers: { authorization: `Bearer ${token}` } }
      );
      const result_pas = await axiosInstance.put(
       `/api/Account/UpdateUserPassword?userId=${props.student.UserId}&password=${form.values.Password}`,
       { headers: { authorization: `Bearer ${token}` } }
      );


      if (result.data.statusCode === 200) {
        let index_element=students.findIndex(student=>student.id ==student_data.Id)
        students[index_element]=student_data
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
          { accessor: "login_pasword", width: 200, title: "login/pasword",render: (record)=>
          <>
           {userData[record.UserId] ? (
             <div>Логин: {JSON.stringify(userData[record.UserId].Login)} Пароль: {JSON.stringify(userData[record.UserId].Password)} </div>
           ) : (
             <Button onClick={() => handleButtonClick(record)} my={1}>
               Посмотреть
             </Button>
           )}
         </>
        },
          {
            accessor: "Name",
            title: "Имя",
            width: 400,

          },
          {
            accessor: "Role",
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
                    deleteStudent(record.Id)
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
